using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/newsletter")]
public class AdminNewsletterController(NewsletterService newsletter) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<NewsletterStatsDto>> Stats(CancellationToken ct) =>
        Ok(new NewsletterStatsDto(await newsletter.GetActiveCountAsync(ct)));

    [HttpGet("subscribers")]
    public async Task<ActionResult> Subscribers(CancellationToken ct) =>
        Ok(await newsletter.GetAllAsync(ct));

    [HttpDelete("subscribers/{email}")]
    public async Task<IActionResult> Delete(string email, CancellationToken ct)
    {
        var deleted = await newsletter.DeleteAsync(email, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("subscribers/{email}/unsubscribe")]
    public async Task<IActionResult> Unsubscribe(string email, CancellationToken ct)
    {
        var ok = await newsletter.UnsubscribeAsync(email, ct);
        return ok ? NoContent() : NotFound();
    }
}
