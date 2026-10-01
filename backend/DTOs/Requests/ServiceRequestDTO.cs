using System.ComponentModel.DataAnnotations;

namespace ServiceBooking.Api.DTOs.Requests;

public class ServiceRequestDTO
{
    [Required(ErrorMessage = "Tên dịch vụ không được để trống")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Tên dịch vụ phải từ 2 đến 200 ký tự")]
    public required string Name { get; set; }

    [StringLength(1000, ErrorMessage = "Mô tả tối đa 1000 ký tự")]
    public string? Description { get; set; }

    [Range(1, 1440, ErrorMessage = "Thời lượng phải từ 1 đến 1440 phút")]
    public int DurationMinutes { get; set; }

    [Range(0, 999999999999, ErrorMessage = "Giá tiền không được âm")]
    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;
}