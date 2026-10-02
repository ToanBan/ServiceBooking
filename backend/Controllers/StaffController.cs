using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ServiceBooking.Api.Controllers;

using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.Models;
using ServiceBooking.Api.Services;

[ApiController]
[Route("api/staffs")]
public class StaffController : ControllerBase
{
    private const int DefaultLimit = 10;

    private readonly StaffService _staffService;

    public StaffController(StaffService staffService)
    {
        _staffService = staffService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<StaffResponseDTO>>> GetAll(
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1)
    {
        var safeOffset = GetOffset(page);

        return Ok(await _staffService.GetAllAsync(isActive, safeOffset, DefaultLimit));
    }

    [HttpGet("{id:int}/schedules")]
    public async Task<ActionResult<List<WorkScheduleResponseDTO>>> GetSchedules(
        int id,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to)
        => Ok(await _staffService.GetSchedulesAsync(id, from, to));

    [HttpPost("{id:int}/schedules")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<WorkScheduleResponseDTO>> CreateSchedule(
        int id,
        [FromBody] WorkScheduleRequestDTO request)
    {
        var created = await _staffService.CreateScheduleAsync(id, new WorkSchedule
        {
            WorkDate = request.WorkDate!.Value,
            StartTime = request.StartTime!.Value,
            EndTime = request.EndTime!.Value
        });


        return CreatedAtAction(nameof(GetSchedules), new { id }, created);
    }

    private static int GetOffset(int page) =>
        (int)Math.Min(((long)Math.Max(page, 1) - 1) * DefaultLimit, int.MaxValue);
}