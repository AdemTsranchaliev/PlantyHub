using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/reviews")]
public class AdminReviewsController(ReviewService reviews) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminReviewsDto>> List(CancellationToken ct) =>
        Ok(await reviews.ListAsync(ct));

    [HttpPost("requests")]
    public async Task<ActionResult<AdminReviewRequestDto>> Send(SendReviewRequestDto request, CancellationToken ct)
    {
        try
        {
            return Ok(await reviews.SendAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{id:guid}/resend")]
    public async Task<ActionResult<AdminReviewRequestDto>> Resend(Guid id, CancellationToken ct)
    {
        try
        {
            return Ok(await reviews.ResendAsync(id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<AdminReviewDto>> SetStatus(Guid id, UpdateReviewStatusRequest request, CancellationToken ct)
    {
        var review = await reviews.SetStatusAsync(id, request.Status, ct);
        return review is null ? NotFound() : Ok(review);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await reviews.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
