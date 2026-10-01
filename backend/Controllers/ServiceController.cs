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
    private const int DefaultLimit = 20;
    private const int MaxLimit = 100;

    private readonly ServiceService _serviceService;

    public ServiceController(ServiceService serviceService)
    {
        _serviceService = serviceService;
    }

    /// Danh sách dịch vụ (có phân trang). Ai cũng xem được.
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<ServiceResponseDTO>>> GetAll(
        [FromQuery] int offset = 0,
        [FromQuery] int limit = DefaultLimit)
    {
        // Chặn tham số âm / quá lớn để không làm cạn DB.
        var safeOffset = Math.Max(offset, 0);
        var safeLimit = Math.Clamp(limit, 1, MaxLimit);

        return Ok(await _serviceService.GetAllAsync(safeOffset, safeLimit));
    }

    /// Chi tiết một dịch vụ. Ai cũng xem được.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceResponseDTO>> GetById(int id)
        => Ok(await _serviceService.GetByIdAsync(id));

    /// Tạo dịch vụ mới — chỉ Admin.
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceResponseDTO>> Create(ServiceRequestDTO request)
    {
        var created = await _serviceService.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// Cập nhật dịch vụ — chỉ Admin. Dùng cho cả sửa thông tin lẫn bật/tắt IsActive.
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServiceResponseDTO>> Update(int id, ServiceRequestDTO request)
        => Ok(await _serviceService.UpdateAsync(id, request));
}