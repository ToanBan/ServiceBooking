using Microsoft.EntityFrameworkCore;
using ServiceBooking.Api.Data;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Repositories;

public class StaffRepository : IStaffRepository
{
    private readonly AppDbContext _db;

    public StaffRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(List<Staff> Items, int TotalCount)> GetAsync(bool? isActive, int offset, int limit)
    {
        var query = _db.Staffs.AsNoTracking();

        if (isActive.HasValue)
            query = query.Where(s => s.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(s => s.FullName)
            .ThenBy(s => s.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Staff?> GetByIdAsync(int id)
    {
        return await _db.Staffs.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<WorkSchedule>> GetSchedulesAsync(int staffId, DateOnly? from, DateOnly? to)
    {
        var query = _db.WorkSchedules.AsNoTracking().Where(w => w.StaffId == staffId);

        if (from.HasValue) query = query.Where(w => w.WorkDate >= from.Value);
        if (to.HasValue) query = query.Where(w => w.WorkDate <= to.Value);

        return await query
            .OrderBy(w => w.WorkDate)
            .ThenBy(w => w.StartTime)
            .ToListAsync();
    }

    public async Task<bool> HasOverlapAsync(int staffId, DateOnly date, TimeOnly start, TimeOnly end)
    {
        return await _db.WorkSchedules.AnyAsync(w =>
            w.StaffId == staffId
            && w.WorkDate == date
            && start < w.EndTime
            && end > w.StartTime);
    }

    public async Task<WorkSchedule> CreateScheduleAsync(WorkSchedule schedule)
    {
        _db.WorkSchedules.Add(schedule);
        await _db.SaveChangesAsync();
        return schedule;
    }
}