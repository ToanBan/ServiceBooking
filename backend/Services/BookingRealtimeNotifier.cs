using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ServiceBooking.Api.Data;
using ServiceBooking.Api.DTOs.Events;
using ServiceBooking.Api.Hubs;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Services;

public sealed class BookingRealtimeNotifier : IBookingRealtimeNotifier
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BookingHub> _hub;
    private readonly ILogger<BookingRealtimeNotifier> _logger;

    public BookingRealtimeNotifier(
        AppDbContext db,
        IHubContext<BookingHub> hub,
        ILogger<BookingRealtimeNotifier> logger)
    {
        _db = db;
        _hub = hub;
        _logger = logger;
    }

    public async Task NotifyBookingCreatedAsync(int bookingId, int customerId)
    {
        var notification = new BookingChangedEvent(bookingId, "Pending");
        await NotifyAdminsAsync("BookingCreated", notification);
        await NotifyCustomerAsync(customerId, "BookingCreated", notification);
    }

    public async Task NotifyBookingCancelledAsync(int bookingId, int customerId)
    {
        var notification = new BookingChangedEvent(bookingId, "Cancelled");
        await NotifyAdminsAsync("BookingCancelled", notification);
        await NotifyCustomerAsync(customerId, "BookingCancelled", notification);
    }

    public async Task NotifyBookingStatusChangedAsync(
        int bookingId,
        int customerId,
        string status)
    {
        var notification = new BookingChangedEvent(bookingId, status);

        await NotifyAdminsAsync("BookingStatusChanged", notification);
        await NotifyCustomerAsync(customerId, "BookingStatusChanged", notification);
    }

    private async Task NotifyAdminsAsync(string eventName, BookingChangedEvent notification)
    {
        try
        {
            var adminId = await _db.Users
                .AsNoTracking()
                .Where(user => user.Role == UserRole.Admin)
                .Select(user => user.Id)
                .FirstOrDefaultAsync();

            if (adminId == 0)
            {
                _logger.LogWarning(
                    "Could not publish {EventName} for booking {BookingId}: no admin account exists",
                    eventName,
                    notification.BookingId);
                return;
            }

            await _hub.Clients.User(adminId.ToString())
                .SendAsync(eventName, notification);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Could not publish {EventName} for booking {BookingId}",
                eventName,
                notification.BookingId);
        }
    }

    private async Task NotifyCustomerAsync(
        int customerId,
        string eventName,
        BookingChangedEvent notification)
    {
        try
        {
            await _hub.Clients.User(customerId.ToString())
                .SendAsync(eventName, notification);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Could not publish {EventName} to customer {CustomerId} for booking {BookingId}",
                eventName,
                customerId,
                notification.BookingId);
        }
    }
}
