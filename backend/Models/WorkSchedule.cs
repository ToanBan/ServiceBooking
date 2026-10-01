namespace ServiceBooking.Api.Models;

public class WorkSchedule
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public DateOnly WorkDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    public Staff Staff { get; set; } = null!;
}