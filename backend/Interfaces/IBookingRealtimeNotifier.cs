namespace ServiceBooking.Api.Interfaces;

public interface IBookingRealtimeNotifier
{
    Task NotifyBookingCreatedAsync(int bookingId, int customerId);

    Task NotifyBookingCancelledAsync(int bookingId, int customerId);

    Task NotifyBookingStatusChangedAsync(int bookingId, int customerId, string status);
}
