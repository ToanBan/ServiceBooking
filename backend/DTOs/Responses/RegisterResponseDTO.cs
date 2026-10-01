namespace ServiceBooking.Api.DTOs.Responses;

public class RegisterResponseDTO
{
    public string Message { get; init; } = string.Empty;

    public UserResponseDTO User { get; init; } = new();

    public static RegisterResponseDTO From(string message, UserResponseDTO user) => new()
    {
        Message = message,
        User = user
    };
}
