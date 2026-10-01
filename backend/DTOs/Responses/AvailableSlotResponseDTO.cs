namespace ServiceBooking.Api.DTOs.Responses;

public class AvailableSlotResponseDTO
{
    public TimeOnly StartTime { get; init; }

    public TimeOnly EndTime { get; init; }
}