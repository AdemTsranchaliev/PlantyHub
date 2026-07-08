using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrdersController(OrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> GetAll(CancellationToken ct)
    {
        var items = await orders.GetAllAsync(ct);
        return Ok(items.Select(OrderMapper.ToSummary).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDetailDto>> GetById(string id, CancellationToken ct)
    {
        var order = await orders.GetByIdAsync(id, ct);
        return order is null ? NotFound() : Ok(OrderMapper.ToDetail(order));
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateStatus(string id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        try
        {
            var order = await orders.UpdateStatusAsync(id, request.Status, ct);
            return order is null ? NotFound() : Ok(OrderMapper.ToDetail(order));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<OrderDetailDto>> Cancel(string id, CancellationToken ct)
    {
        var order = await orders.CancelAsync(id, ct);
        return order is null ? NotFound() : Ok(OrderMapper.ToDetail(order));
    }

    [HttpPost("{id}/waybill")]
    public async Task<ActionResult<OrderDetailDto>> CreateWaybill(string id, [FromBody] CreateWaybillRequest request, CancellationToken ct)
    {
        try
        {
            var order = await orders.CreateWaybillAsync(id, request, ct);
            return order is null ? NotFound() : Ok(OrderMapper.ToDetail(order));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await orders.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }
}
