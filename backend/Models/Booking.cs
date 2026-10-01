namespace ServiceBooking.Api.Models;
public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Completed = 3,
    Cancelled = 4
}

public class Booking
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = string.Empty;

    public int CustomerId { get; set; }
    public int ServiceId { get; set; }
    public int StaffId { get; set; }

    public DateTime StartTime { get; set; }  
    public DateTime EndTime { get; set; }    

    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? CustomerNote { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Customer { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public Staff Staff { get; set; } = null!;
}