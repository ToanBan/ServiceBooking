using System.ComponentModel.DataAnnotations;

namespace ServiceBooking.Api.DTOs.Requests;

public class WorkScheduleRequestDTO
{
    [Required(ErrorMessage = "Ngày làm việc là bắt buộc")]
    public DateOnly? WorkDate { get; set; }

    [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc")]
    public TimeOnly? StartTime { get; set; }

    [Required(ErrorMessage = "Giờ kết thúc là bắt buộc")]
    public TimeOnly? EndTime { get; set; }
}