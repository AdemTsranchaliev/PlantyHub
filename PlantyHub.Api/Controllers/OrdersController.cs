using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(OrderService orders) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderDetailDto>> Checkout([FromBody] CheckoutRequest request, CancellationToken ct)
    {
        try
        {
            if (request.Items.Count == 0)
                return BadRequest(new { message = "Cart is empty." });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await orders.CreateFromCheckoutAsync(request, userId, ct);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, OrderMapper.ToDetail(order));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDetailDto>> GetById(string id, CancellationToken ct)
    {
        var order = await orders.GetByIdAsync(id, ct);
        if (order is null) return NotFound();

        var email = User.FindFirstValue(ClaimTypes.Email);
        var isAdmin = User.IsInRole("Admin");
        if (email is not null && !isAdmin && !string.Equals(order.Email, email, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        return Ok(OrderMapper.ToDetail(order));
    }

    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> GetMyOrders(CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null) return Unauthorized();

        var items = await orders.GetByEmailAsync(email, ct);
        return Ok(items.Select(OrderMapper.ToSummary).ToList());
    }
}
