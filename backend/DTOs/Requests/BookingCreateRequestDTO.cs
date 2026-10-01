using System.ComponentModel.DataAnnotations;

namespace ServiceBooking.Api.DTOs.Requests;

public class BookingCreateRequestDTO
{
    [Range(1, int.MaxValue)]
    public int ServiceId { get; set; }

    [Range(1, int.MaxValue)]
    public int StaffId { get; set; }

    [Required]
    public DateOnly? Date { get; set; }

    [Required]
    public TimeOnly? StartTime { get; set; }

    [StringLength(1000)]
    public string? CustomerNote { get; set; }
}