using System.ComponentModel.DataAnnotations;

namespace ServiceBooking.Api.DTOs.Requests;

public class BookingCancelRequestDTO
{
    [Required(ErrorMessage = "Lý do hủy lịch là bắt buộc")]
    [StringLength(1000, MinimumLength = 2, ErrorMessage = "Lý do hủy phải từ 2 đến 1000 ký tự")]
    public required string Reason { get; set; }
}