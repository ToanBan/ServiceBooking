using System.ComponentModel.DataAnnotations;

namespace ServiceBooking.Api.DTOs.Requests;

public class BookingStatusUpdateRequestDTO
{
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty;
}