namespace ServiceBooking.Api.Services;

using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;


public class ServiceService
{
    private readonly IServiceRepository _serviceRepository;

    public ServiceService(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<PagedResponseDTO<ServiceResponseDTO>> GetAllAsync(int offset, int limit)
    {
        var (items, totalCount) = await _serviceRepository.GetAsync(offset, limit);

        return new PagedResponseDTO<ServiceResponseDTO>
        {
            Items = items.Select(ServiceResponseDTO.FromEntity).ToList(),
            TotalCount = totalCount,
            Offset = offset,
            Limit = limit
        };
    }

    public async Task<ServiceResponseDTO> GetByIdAsync(int id)
    {
        var service = await _serviceRepository.GetByIdAsync(id)
            ?? throw AppException.NotFound($"Không tìm thấy dịch vụ có id {id}");

        return ServiceResponseDTO.FromEntity(service);
    }

    public async Task<ServiceResponseDTO> CreateAsync(ServiceRequestDTO request)
    {
        var created = await _serviceRepository.CreateAsync(new Service
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            DurationMinutes = request.DurationMinutes,
            Price = request.Price,
            IsActive = request.IsActive
        });

        return ServiceResponseDTO.FromEntity(created);
    }

    public async Task<ServiceResponseDTO> UpdateAsync(int id, ServiceRequestDTO request)
    {
        var data = new Service
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            DurationMinutes = request.DurationMinutes,
            Price = request.Price,
            IsActive = request.IsActive
        };

        if (!await _serviceRepository.UpdateAsync(id, data))
        {
            throw AppException.NotFound($"Không tìm thấy dịch vụ có id {id}");
        }


        var updated = await _serviceRepository.GetByIdAsync(id)
            ?? throw AppException.NotFound($"Không tìm thấy dịch vụ có id {id}");

        return ServiceResponseDTO.FromEntity(updated);
    }
}