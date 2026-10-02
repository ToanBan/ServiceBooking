namespace ServiceBooking.Api.DTOs.Events;

public sealed record BookingChangedEvent(int BookingId, string Status);
