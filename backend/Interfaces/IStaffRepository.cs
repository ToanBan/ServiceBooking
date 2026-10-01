using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Interfaces;

public interface IStaffRepository
{
    Task<(List<Staff> Items, int TotalCount)> GetAsync(bool? isActive, int offset, int limit);

    Task<Staff?> GetByIdAsync(int id);

    Task<List<WorkSchedule>> GetSchedulesAsync(int staffId, DateOnly? from, DateOnly? to);

    Task<bool> HasOverlapAsync(int staffId, DateOnly date, TimeOnly start, TimeOnly end);
    Task<WorkSchedule> CreateScheduleAsync(WorkSchedule schedule);
}