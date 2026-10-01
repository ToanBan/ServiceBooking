namespace ServiceBooking.Api.DTOs.Responses;

public class LoginResponseDTO
{
    public string Message { get; init; } = string.Empty;

    public UserResponseDTO User { get; init; } = new();

    public static LoginResponseDTO From(string message, UserResponseDTO user) => new()
    {
        Message = message,
        User = user
    };
}
