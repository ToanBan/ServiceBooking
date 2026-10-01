using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.DTOs.Responses;

public class ServiceResponseDTO
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public int DurationMinutes { get; init; }

    public decimal Price { get; init; }

    public bool IsActive { get; init; }

    public static ServiceResponseDTO FromEntity(Service service) => new()
    {
        Id = service.Id,
        Name = service.Name,
        Description = service.Description,
        DurationMinutes = service.DurationMinutes,
        Price = service.Price,
        IsActive = service.IsActive
    };
}