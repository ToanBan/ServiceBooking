using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Interfaces;

public record BookingTimeRange(DateTime StartTime, DateTime EndTime);

public interface IBookingRepository
{
	Task<List<BookingTimeRange>> GetBusyBookingRangesAsync(
		int staffId,
		DateTime fromUtc,
		DateTime toUtc);

	Task<Booking> CreateWithStaffLockAsync(
		Booking booking,
		DateOnly workDate,
		TimeOnly localStartTime,
		TimeOnly localEndTime);

	Task<(List<Booking> Items, int TotalCount)> GetPageAsync(
		int? customerId,
		BookingStatus? status,
		string? search,
		int offset,
		int limit);

	Task<Booking> UpdateStatusWithLockAsync(
		int bookingId,
		BookingStatus status,
		DateTime nowUtc);

	Task<Booking> CancelWithLockAsync(
		int bookingId,
		int customerId,
		string reason,
		DateTime nowUtc);
}
