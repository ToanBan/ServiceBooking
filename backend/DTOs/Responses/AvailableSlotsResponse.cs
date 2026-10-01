namespace ServiceBooking.Api.Models.Dtos;

public class SlotResponse
{
    public string StartTime { get; set; } = string.Empty;   // "08:00"
    public string EndTime { get; set; } = string.Empty;     // "08:30"
}

public class AvailableSlotsResponse
{
    public int StaffId { get; set; }
    public int ServiceId { get; set; }
    public DateOnly Date { get; set; }
    public int DurationMinutes { get; set; }
    public List<SlotResponse> Slots { get; set; } = new();
}