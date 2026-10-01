using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ServiceBooking.Api.Controllers;

using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.Services;

[ApiController]
[Route("api/services")]
public class ServiceController : ControllerBase
{
    private const int DefaultLimit = 10;

    private readonly ServiceService _serviceService;

    public ServiceController(ServiceService serviceService)
    {
        _serviceService = serviceService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<ServiceResponseDTO>>> GetAll(
        [FromQuery] int page = 1)
    {
        var safeOffset = GetOffset(page);

        return Ok(await _serviceService.GetAllAsync(safeOffset, DefaultLimit));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceResponseDTO>> GetById(int id)
        => Ok(await _serviceService.GetByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceResponseDTO>> Create(ServiceRequestDTO request)
    {
        var created = await _serviceService.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceResponseDTO>> Update(int id, ServiceRequestDTO request)
        => Ok(await _serviceService.UpdateAsync(id, request));

    private static int GetOffset(int page) =>
        (int)Math.Min(((long)Math.Max(page, 1) - 1) * DefaultLimit, int.MaxValue);
}