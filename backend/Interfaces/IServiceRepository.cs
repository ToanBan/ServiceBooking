using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Interfaces;

public interface IServiceRepository
{
    Task<(List<Service> Items, int TotalCount)> GetAsync(int offset, int limit);
    Task<Service?> GetByIdAsync(int id);
    Task<Service> CreateAsync(Service service);
    Task<bool> UpdateAsync(int id, Service data);
}