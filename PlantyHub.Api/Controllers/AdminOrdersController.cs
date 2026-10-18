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
            var order = await orders.UpdateStatusAsync(id, request.Status, request.Note, ct);
            return order is null ? NotFound() : Ok(OrderMapper.ToDetail(order));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
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

    [HttpPost("{id}/econt/check")]
    public async Task<ActionResult<EcontCheckDto>> CheckEcont(string id, [FromBody] EcontCheckRequest? request, CancellationToken ct)
    {
        try
        {
            var check = await orders.CheckEcontAsync(id, new CreateWaybillRequest(
                request?.Courier ?? "econt",
                request?.WeightKg > 0 ? request.WeightKg : 1.5m,
                request?.Packages > 0 ? request.Packages : 1,
                null,
                null), ct);
            return check is null ? NotFound() : Ok(check);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/econt/status")]
    public async Task<ActionResult<EcontStatusResponse>> RefreshEcontStatus(string id, [FromQuery] string? number, CancellationToken ct)
    {
        try
        {
            var result = await orders.RefreshEcontStatusAsync(id, number, ct);
            return result is null
                ? NotFound()
                : Ok(new EcontStatusResponse(OrderMapper.ToDetail(result.Value.Order), result.Value.Status));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/waybill")]
    public async Task<ActionResult<OrderDetailDto>> DeleteWaybill(string id, [FromQuery] string? number, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(number))
            return BadRequest(new { message = "Липсва номер на товарителница." });
        try
        {
            var order = await orders.DeleteWaybillAsync(id, number, ct);
            return order is null ? NotFound() : Ok(OrderMapper.ToDetail(order));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/waybill/label")]
    public async Task<IActionResult> Label(string id, [FromQuery] string? number, CancellationToken ct)
    {
        try
        {
            var label = await orders.GetLabelAsync(id, number, ct);
            if (label is null) return NotFound();
            return File(label.Value.Bytes, label.Value.ContentType, label.Value.FileName);
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
