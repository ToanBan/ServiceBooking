using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.DTOs.Responses;

public class UserResponseDTO
{
    public int Id { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public UserRole Role { get; init; }

    public static UserResponseDTO FromEntity(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role
    };
}
