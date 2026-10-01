namespace ServiceBooking.Api.Services;

using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;

public class BookingService
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IStaffRepository _staffRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly TimeZoneInfo _businessTimeZone;

    public BookingService(
        IServiceRepository serviceRepository,
        IStaffRepository staffRepository,
        IBookingRepository bookingRepository

    )
    {
        _serviceRepository = serviceRepository;
        _staffRepository = staffRepository;
        _bookingRepository = bookingRepository;

        var defaultTimeZoneId = OperatingSystem.IsWindows()
            ? "SE Asia Standard Time"
            : "Asia/Ho_Chi_Minh";
        var timeZoneId = defaultTimeZoneId;
        _businessTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
    }

    public async Task<List<AvailableSlotResponseDTO>> GetAvailableSlotsAsync(
        int serviceId,
        int staffId,
        DateOnly date)
    {
        var service = await GetValidServiceAsync(serviceId);
        await EnsureStaffActiveAsync(staffId);

        var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _businessTimeZone);
        if (date < DateOnly.FromDateTime(now))
            throw AppException.BadRequest("Không thể xem khung giờ của ngày đã qua.");

        var schedules = await _staffRepository.GetSchedulesAsync(staffId, date, date);
        if (schedules.Count == 0)
            return [];

        var dayStart = date.ToDateTime(TimeOnly.MinValue);
        var busyRanges = await _bookingRepository.GetBusyBookingRangesAsync(
            staffId,
            ToUtc(dayStart),
            ToUtc(dayStart.AddDays(1)));

        var duration = TimeSpan.FromMinutes(service.DurationMinutes);
        var slots = new List<AvailableSlotResponseDTO>();

        foreach (var schedule in schedules)
        {
            var start = date.ToDateTime(schedule.StartTime);
            var shiftEnd = date.ToDateTime(schedule.EndTime);

            for (; start + duration <= shiftEnd; start += duration)
            {
                var end = start + duration;
                var startUtc = ToUtc(start);
                var endUtc = ToUtc(end);

                var isPast = start <= now;
                var isBusy = busyRanges.Any(b => startUtc < b.EndTime && endUtc > b.StartTime);

                if (isPast || isBusy) continue;

                slots.Add(new AvailableSlotResponseDTO
                {
                    StartTime = TimeOnly.FromDateTime(start),
                    EndTime = TimeOnly.FromDateTime(end)
                });
            }
        }

        return slots
            .DistinctBy(s => (s.StartTime, s.EndTime))
            .OrderBy(s => s.StartTime)
            .ToList();
    }

    private async Task<Service> GetValidServiceAsync(int serviceId)
    {
        var service = await _serviceRepository.GetByIdAsync(serviceId)
            ?? throw AppException.NotFound($"Không tìm thấy dịch vụ có id {serviceId}");

        if (!service.IsActive)
            throw AppException.BadRequest("Dịch vụ hiện không hoạt động.");
        if (service.DurationMinutes <= 0)
            throw AppException.BadRequest("Thời lượng dịch vụ không hợp lệ.");

        return service;
    }

    private async Task EnsureStaffActiveAsync(int staffId)
    {
        var staff = await _staffRepository.GetByIdAsync(staffId)
            ?? throw AppException.NotFound($"Không tìm thấy nhân viên có id {staffId}");

        if (!staff.IsActive)
            throw AppException.BadRequest("Nhân viên hiện không hoạt động.");
    }

    private DateTime ToUtc(DateTime businessLocalTime) =>
        TimeZoneInfo.ConvertTimeToUtc(businessLocalTime, _businessTimeZone);

    public async Task<BookingResponseDTO> CreateAsync(
        int customerId,
        BookingCreateRequestDTO request)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId)
            ?? throw AppException.NotFound($"Không tìm thấy dịch vụ có id {request.ServiceId}");

        if (!service.IsActive)
            throw AppException.BadRequest("Dịch vụ hiện không hoạt động.");

        if (service.DurationMinutes <= 0)
            throw AppException.BadRequest("Thời lượng dịch vụ không hợp lệ.");

        var date = request.Date!.Value;
        var startTime = request.StartTime!.Value;
        var localStart = DateTime.SpecifyKind(
            date.ToDateTime(startTime),
            DateTimeKind.Unspecified);
        var localEnd = localStart.AddMinutes(service.DurationMinutes);
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _businessTimeZone);

        if (localStart <= localNow)
            throw AppException.BadRequest("Không thể đặt lịch vào thời điểm đã qua.");

        var booking = new Booking
        {
            BookingCode = $"BK-{Guid.NewGuid():N}".ToUpperInvariant(),
            CustomerId = customerId,
            ServiceId = service.Id,
            StaffId = request.StaffId,
            StartTime = ToUtc(localStart),
            EndTime = ToUtc(localEnd),
            Status = BookingStatus.Pending,
            CustomerNote = request.CustomerNote?.Trim()
        };

        var created = await _bookingRepository.CreateWithStaffLockAsync(
            booking,
            date,
            startTime,
            TimeOnly.FromDateTime(localEnd));

        return BookingResponseDTO.FromEntity(created);
    }

    public async Task<PagedResponseDTO<BookingResponseDTO>> GetAllAsync(
        BookingStatus? status,
        string? search,
        int offset,
        int limit)
    {
        var (items, totalCount) = await _bookingRepository.GetPageAsync(
            null,
            status,
            search,
            offset,
            limit);

        return ToPagedResponse(items, totalCount, offset, limit);
    }

    public async Task<PagedResponseDTO<BookingResponseDTO>> GetMyBookingsAsync(
        int customerId,
        BookingStatus? status,
        int offset,
        int limit)
    {
        var (items, totalCount) = await _bookingRepository.GetPageAsync(
            customerId,
            status,
            null,
            offset,
            limit);

        return ToPagedResponse(items, totalCount, offset, limit);
    }

    public async Task<BookingResponseDTO> UpdateStatusAsync(int bookingId, string requestedStatus)
    {
        if (!Enum.TryParse<BookingStatus>(requestedStatus, true, out var status)
            || status is not (BookingStatus.Confirmed or BookingStatus.Completed))
        {
            throw AppException.BadRequest("Trạng thái đích chỉ có thể là Confirmed hoặc Completed.");
        }

        var updated = await _bookingRepository.UpdateStatusWithLockAsync(
            bookingId,
            status,
            DateTime.UtcNow);

        return BookingResponseDTO.FromEntity(updated);
    }

    public async Task<BookingResponseDTO> CancelAsync(
        int bookingId,
        int customerId,
        string reason)
    {
        var cancelled = await _bookingRepository.CancelWithLockAsync(
            bookingId,
            customerId,
            reason,
            DateTime.UtcNow);

        return BookingResponseDTO.FromEntity(cancelled);
    }

    private static PagedResponseDTO<BookingResponseDTO> ToPagedResponse(
        List<Booking> items,
        int totalCount,
        int offset,
        int limit) => new()
        {
            Items = items.Select(BookingResponseDTO.FromEntity).ToList(),
            TotalCount = totalCount,
            Offset = offset,
            Limit = limit
        };


}
