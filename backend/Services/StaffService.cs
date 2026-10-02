namespace ServiceBooking.Api.Services;

using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;


public class StaffService
{
    private readonly IStaffRepository _staffRepository;
    private readonly TimeZoneInfo _businessTimeZone;

    public StaffService(IStaffRepository staffRepository)
    {
        _staffRepository = staffRepository;

        var timeZoneId = OperatingSystem.IsWindows()
            ? "SE Asia Standard Time"
            : "Asia/Ho_Chi_Minh";
        _businessTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
    }

    public async Task<PagedResponseDTO<StaffResponseDTO>> GetAllAsync(
        bool? isActive,
        int offset,
        int limit)
    {
        var (items, totalCount) = await _staffRepository.GetAsync(isActive, offset, limit);

        return new PagedResponseDTO<StaffResponseDTO>
        {
            Items = items.Select(StaffResponseDTO.FromEntity).ToList(),
            TotalCount = totalCount,
            Offset = offset,
            Limit = limit
        };
    }

    public async Task<List<WorkScheduleResponseDTO>> GetSchedulesAsync(
        int staffId,
        DateOnly? from,
        DateOnly? to)
    {

        _ = await _staffRepository.GetByIdAsync(staffId)
            ?? throw AppException.NotFound($"Không tìm thấy nhân viên có id {staffId}");

        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            throw AppException.BadRequest("Khoảng thời gian không hợp lệ: from phải nhỏ hơn hoặc bằng to.");
        }

        var schedules = await _staffRepository.GetSchedulesAsync(staffId, from, to);

        return schedules.Select(WorkScheduleResponseDTO.FromEntity).ToList();
    }

    public async Task<WorkScheduleResponseDTO> CreateScheduleAsync(int staffId, WorkSchedule request)
    {
        var staff = await _staffRepository.GetByIdAsync(staffId)
            ?? throw AppException.NotFound($"Không tìm thấy nhân viên có id {staffId}");

        if (!staff.IsActive)
        {
            throw AppException.BadRequest("Không thể thêm ca làm việc cho nhân viên đã ngừng hoạt động.");
        }

        if (request.StartTime >= request.EndTime)
        {
            throw AppException.BadRequest("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
        }

        var businessNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _businessTimeZone);
        var today = DateOnly.FromDateTime(businessNow);
        var currentTime = TimeOnly.FromDateTime(businessNow);

        if (request.WorkDate < today
            || (request.WorkDate == today && request.StartTime <= currentTime))
        {
            throw AppException.BadRequest("Không thể tạo ca làm việc có thời gian bắt đầu trong quá khứ.");
        }

        if (await _staffRepository.HasOverlapAsync(staffId, request.WorkDate, request.StartTime, request.EndTime))
        {
            throw AppException.Conflict("Ca làm việc bị trùng khung giờ với ca đã tồn tại.");
        }

        var created = await _staffRepository.CreateScheduleAsync(new WorkSchedule
        {
            StaffId = staffId,
            WorkDate = request.WorkDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        });

        return WorkScheduleResponseDTO.FromEntity(created);
    }
}