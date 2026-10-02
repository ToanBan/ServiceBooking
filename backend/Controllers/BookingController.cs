using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace ServiceBooking.Api.Controllers;

using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Models;
using ServiceBooking.Api.Services;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingController : ControllerBase
{
    private const int DefaultLimit = 10;

    private readonly BookingService _bookingService;

    public BookingController(BookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet("available-slots")]
    public async Task<ActionResult<List<AvailableSlotResponseDTO>>> GetAvailableSlots(
        [FromQuery] int serviceId,
        [FromQuery] int staffId,
        [FromQuery] DateOnly? date)
    {
        if (serviceId <= 0 || staffId <= 0 || !date.HasValue)
            throw AppException.BadRequest("serviceId, staffId và date là bắt buộc.");

        return Ok(await _bookingService.GetAvailableSlotsAsync(
            serviceId,
            staffId,
            date.Value));
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Customer))]
    public async Task<ActionResult<BookingResponseDTO>> Create(BookingCreateRequestDTO request)
    {
        var created = await _bookingService.CreateAsync(GetCurrentCustomerId(), request);

        return CreatedAtAction(
            nameof(GetMyBookings),
            new { page = 1 },
            created);
    }

    [HttpGet]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<PagedResponseDTO<BookingResponseDTO>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] BookingStatus? status = null,
        [FromQuery] string? search = null,
        [FromQuery] DateOnly? date = null)
    {
        var safeOffset = GetOffset(page);

        return Ok(await _bookingService.GetAllAsync(
            status,
            search,
            date,
            safeOffset,
            DefaultLimit));
    }

    [HttpGet("my-bookings")]
    [Authorize(Roles = nameof(UserRole.Customer))]
    public async Task<ActionResult<PagedResponseDTO<BookingResponseDTO>>> GetMyBookings(
        [FromQuery] int page = 1,
        [FromQuery] BookingStatus? status = null,
        [FromQuery] DateOnly? date = null)
    {
        var safeOffset = GetOffset(page);

        return Ok(await _bookingService.GetMyBookingsAsync(
            GetCurrentCustomerId(),
            status,
            date,
            safeOffset,
            DefaultLimit));
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<BookingResponseDTO>> UpdateStatus(
        int id,
        BookingStatusUpdateRequestDTO request)
        => Ok(await _bookingService.UpdateStatusAsync(id, request.Status));

    [HttpPost("{id:int}/cancel")]
    [Authorize(Roles = nameof(UserRole.Customer))]
    public async Task<ActionResult<BookingResponseDTO>> Cancel(
        int id,
        BookingCancelRequestDTO request)
        => Ok(await _bookingService.CancelAsync(
            id,
            GetCurrentCustomerId(),
            request.Reason));

    private int GetCurrentCustomerId()
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!int.TryParse(subject, out var customerId))
            throw AppException.Unauthorized("Không xác định được khách hàng đăng nhập.");

        return customerId;
    }

    private static int GetOffset(int page) =>
        (int)Math.Min(((long)Math.Max(page, 1) - 1) * DefaultLimit, int.MaxValue);
}