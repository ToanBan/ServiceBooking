using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ServiceBooking.Api.Data;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Repositories;

public class BookingRepository : IBookingRepository
{
	private readonly AppDbContext _db;

	public BookingRepository(AppDbContext db)
	{
		_db = db;
	}

	public async Task<List<BookingTimeRange>> GetBusyBookingRangesAsync(
		int staffId,
		DateTime fromUtc,
		DateTime toUtc)
	{
		return await _db.Bookings
			.AsNoTracking()
			.Where(booking =>
				booking.StaffId == staffId
				&& booking.Status != BookingStatus.Cancelled
				&& booking.StartTime < toUtc
				&& booking.EndTime > fromUtc)
			.Select(booking => new BookingTimeRange(
				booking.StartTime,
				booking.EndTime))
			.ToListAsync();
	}

	public async Task<Booking> CreateWithStaffLockAsync(
		Booking booking,
		DateOnly workDate,
		TimeOnly localStartTime,
		TimeOnly localEndTime)
	{
		await using var transaction = await _db.Database.BeginTransactionAsync();

		var connection = _db.Database.GetDbConnection();
		await using var command = connection.CreateCommand();
		command.Transaction = _db.Database.CurrentTransaction!.GetDbTransaction();
		command.CommandText = "SELECT \"IsActive\" FROM \"Staffs\" WHERE \"Id\" = @staffId FOR NO KEY UPDATE";

		var staffIdParameter = command.CreateParameter();
		staffIdParameter.ParameterName = "staffId";
		staffIdParameter.Value = booking.StaffId;
		command.Parameters.Add(staffIdParameter);

		var isActiveValue = await command.ExecuteScalarAsync();
		if (isActiveValue is null || isActiveValue is DBNull)
			throw AppException.NotFound($"Không tìm thấy nhân viên có id {booking.StaffId}");

		if (!(bool)isActiveValue)
			throw AppException.BadRequest("Nhân viên hiện không hoạt động.");

		var scheduleExists = await _db.WorkSchedules.AnyAsync(schedule =>
			schedule.StaffId == booking.StaffId
			&& schedule.WorkDate == workDate
			&& schedule.StartTime <= localStartTime
			&& schedule.EndTime >= localEndTime);

		if (!scheduleExists)
			throw AppException.BadRequest("Khung giờ đã chọn không nằm trong ca làm việc của nhân viên.");

		var hasOverlap = await _db.Bookings.AnyAsync(existing =>
			existing.StaffId == booking.StaffId
			&& existing.Status != BookingStatus.Cancelled
			&& existing.StartTime < booking.EndTime
			&& existing.EndTime > booking.StartTime);

		if (hasOverlap)
			throw AppException.Conflict("Khung giờ vừa được đặt. Vui lòng chọn khung giờ khác.");

		_db.Bookings.Add(booking);
		await _db.SaveChangesAsync();
		await transaction.CommitAsync();

		return await _db.Bookings
			.AsNoTracking()
			.Include(item => item.Customer)
			.Include(item => item.Service)
			.Include(item => item.Staff)
			.SingleAsync(item => item.Id == booking.Id);
	}

	public async Task<(List<Booking> Items, int TotalCount)> GetPageAsync(
		int? customerId,
		BookingStatus? status,
		string? search,
		DateOnly? date,
		int offset,
		int limit)
	{
		var query = _db.Bookings
			.AsNoTracking()
			.AsQueryable();

		if (customerId.HasValue)
			query = query.Where(booking => booking.CustomerId == customerId.Value);

		if (status.HasValue)
			query = query.Where(booking => booking.Status == status.Value);

		if (date.HasValue)
		{
			var timeZoneId = OperatingSystem.IsWindows()
				? "SE Asia Standard Time"
				: "Asia/Ho_Chi_Minh";
			var businessTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
			var localDayStart = date.Value.ToDateTime(TimeOnly.MinValue);
			var utcDayStart = TimeZoneInfo.ConvertTimeToUtc(localDayStart, businessTimeZone);
			var utcDayEnd = TimeZoneInfo.ConvertTimeToUtc(localDayStart.AddDays(1), businessTimeZone);

			query = query.Where(booking =>
				booking.StartTime >= utcDayStart
				&& booking.StartTime < utcDayEnd);
		}

		if (!string.IsNullOrWhiteSpace(search))
		{
			var searchPattern = $"%{search.Trim()}%";
			query = query.Where(booking =>
				EF.Functions.ILike(booking.BookingCode, searchPattern)
				|| EF.Functions.ILike(booking.Customer.FullName, searchPattern));
		}

		var totalCount = await query.CountAsync();
		var items = await query
			.OrderByDescending(booking => booking.CreatedAt)
			.ThenByDescending(booking => booking.Id)
			.Skip(offset)
			.Take(limit)
			.Include(booking => booking.Customer)
			.Include(booking => booking.Service)
			.Include(booking => booking.Staff)
			.ToListAsync();

		return (items, totalCount);
	}

	public async Task<Booking> UpdateStatusWithLockAsync(
		int bookingId,
		BookingStatus status,
		DateTime nowUtc)
	{
		await using var transaction = await _db.Database.BeginTransactionAsync();
		await LockBookingRowAsync(bookingId);

		var booking = await _db.Bookings.FirstOrDefaultAsync(item => item.Id == bookingId)
			?? throw AppException.NotFound($"Không tìm thấy booking có id {bookingId}");

		if (status == BookingStatus.Confirmed)
		{
			if (booking.Status != BookingStatus.Pending)
				throw AppException.Conflict("Chỉ booking Pending mới được xác nhận.");

			booking.Status = BookingStatus.Confirmed;
		}
		else if (status == BookingStatus.Completed)
		{
			if (booking.Status != BookingStatus.Confirmed)
				throw AppException.Conflict("Chỉ booking Confirmed mới được hoàn tất.");

			if (nowUtc < booking.EndTime)
				throw AppException.Conflict("Chỉ có thể hoàn tất booking khi đã đến hoặc qua giờ kết thúc.");

			booking.Status = BookingStatus.Completed;
		}
		else
		{
			throw AppException.BadRequest("Trạng thái đích chỉ có thể là Confirmed hoặc Completed.");
		}

		await _db.SaveChangesAsync();
		await transaction.CommitAsync();
		return await GetBookingWithDetailsAsync(bookingId);
	}

	public async Task<Booking> CancelWithLockAsync(
		int bookingId,
		int customerId,
		string reason,
		DateTime nowUtc)
	{
		await using var transaction = await _db.Database.BeginTransactionAsync();
		await LockBookingRowAsync(bookingId);

		var booking = await _db.Bookings.FirstOrDefaultAsync(item => item.Id == bookingId)
			?? throw AppException.NotFound($"Không tìm thấy booking có id {bookingId}");

		if (booking.CustomerId != customerId)
			throw AppException.NotFound($"Không tìm thấy booking có id {bookingId}");

		if (booking.Status is not (BookingStatus.Pending or BookingStatus.Confirmed))
			throw AppException.Conflict("Booking hiện tại không thể hủy.");

		if (nowUtc >= booking.StartTime)
			throw AppException.Conflict("Không thể hủy booking khi đã đến hoặc qua giờ bắt đầu.");

		booking.Status = BookingStatus.Cancelled;
		booking.CancellationReason = reason.Trim();

		await _db.SaveChangesAsync();
		await transaction.CommitAsync();
		return await GetBookingWithDetailsAsync(bookingId);
	}

	private async Task LockBookingRowAsync(int bookingId)
	{
		var command = _db.Database.GetDbConnection().CreateCommand();
		await using (command)
		{
			command.Transaction = _db.Database.CurrentTransaction!.GetDbTransaction();
			command.CommandText = "SELECT \"Id\" FROM \"Bookings\" WHERE \"Id\" = @bookingId FOR UPDATE";

			var bookingIdParameter = command.CreateParameter();
			bookingIdParameter.ParameterName = "bookingId";
			bookingIdParameter.Value = bookingId;
			command.Parameters.Add(bookingIdParameter);

			var result = await command.ExecuteScalarAsync();
			if (result is null || result is DBNull)
				throw AppException.NotFound($"Không tìm thấy booking có id {bookingId}");
		}
	}

	private Task<Booking> GetBookingWithDetailsAsync(int bookingId) => _db.Bookings
		.AsNoTracking()
		.Include(item => item.Customer)
		.Include(item => item.Service)
		.Include(item => item.Staff)
		.SingleAsync(item => item.Id == bookingId);
}
