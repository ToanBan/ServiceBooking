namespace ServiceBooking.Api.DTOs.Responses;

public class MessageResponseDTO
{
    public string Message { get; init; } = string.Empty;

    public static MessageResponseDTO From(string message) => new() { Message = message };
}
