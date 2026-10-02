using Microsoft.EntityFrameworkCore;
using ServiceBooking.Api.Data;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Repositories;

public class ServiceRepository : IServiceRepository
{
    private readonly AppDbContext _db;

    public ServiceRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(List<Service> Items, int TotalCount)> GetAsync(int offset, int limit)
    {
        var query = _db.Services.AsNoTracking();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Service?> GetByIdAsync(int id)
    {
        return await _db.Services.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Service> CreateAsync(Service service)
    {
        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return service;
    }

    public async Task<bool> UpdateAsync(int id, Service data)
    {
        var service = await _db.Services.FirstOrDefaultAsync(s => s.Id == id);
        if (service == null) return false;

        service.Name = data.Name;
        service.Description = data.Description;
        service.DurationMinutes = data.DurationMinutes;
        service.Price = data.Price;
        service.IsActive = data.IsActive;

        await _db.SaveChangesAsync();
        return true;
    }
}