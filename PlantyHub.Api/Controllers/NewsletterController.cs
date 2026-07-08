using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/newsletter")]
public class NewsletterController(AppDbContext db) : ControllerBase
{
    [HttpPost("subscribe")]
    public async Task<ActionResult> Subscribe([FromBody] NewsletterSubscribeRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Email is required." });

        var existing = await db.NewsletterSubscribers.FirstOrDefaultAsync(s => s.Email == email, ct);
        if (existing is not null)
        {
            if (!existing.Active)
            {
                existing.Active = true;
                existing.SubscribedAt = DateTime.UtcNow;
                await db.SaveChangesAsync(ct);
            }

            return Ok(new { message = "Already subscribed." });
        }

        db.NewsletterSubscribers.Add(new NewsletterSubscriber { Email = email });
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Subscribed successfully." });
    }
}
