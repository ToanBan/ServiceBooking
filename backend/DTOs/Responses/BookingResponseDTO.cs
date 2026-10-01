using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.DTOs.Responses;

public class BookingResponseDTO
{
    public int Id { get; init; }

    public string BookingCode { get; init; } = string.Empty;

    public int CustomerId { get; init; }

    public string CustomerName { get; init; } = string.Empty;

    public int ServiceId { get; init; }

    public string ServiceName { get; init; } = string.Empty;

    public int StaffId { get; init; }

    public string StaffName { get; init; } = string.Empty;

    public DateTime StartTime { get; init; }

    public DateTime EndTime { get; init; }

    public string Status { get; init; } = string.Empty;

    public string? CustomerNote { get; init; }

    public string? CancellationReason { get; init; }

    public static BookingResponseDTO FromEntity(Booking booking) => new()
    {
        Id = booking.Id,
        BookingCode = booking.BookingCode,
        CustomerId = booking.CustomerId,
        CustomerName = booking.Customer.FullName,
        ServiceId = booking.ServiceId,
        ServiceName = booking.Service.Name,
        StaffId = booking.StaffId,
        StaffName = booking.Staff.FullName,
        StartTime = booking.StartTime,
        EndTime = booking.EndTime,
        Status = booking.Status.ToString(),
        CustomerNote = booking.CustomerNote,
        CancellationReason = booking.CancellationReason
    };
}