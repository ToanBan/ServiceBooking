namespace ServiceBooking.Api.DTOs.Responses;

using ServiceBooking.Api.Models;

public class StaffResponseDTO
{
    public int Id { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public bool IsActive { get; init; }

    public static StaffResponseDTO FromEntity(Staff staff) => new()
    {
        Id = staff.Id,
        FullName = staff.FullName,
        Email = staff.Email,
        IsActive = staff.IsActive
    };
}