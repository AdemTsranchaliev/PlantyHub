using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController(ReviewService reviews) : ControllerBase
{
    private const long MaxBody = 40 * 1024 * 1024;

    [HttpGet("product/{slug}")]
    public async Task<ActionResult<PublicReviewsDto>> ForProduct(
        string slug,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int? rating = null,
        [FromQuery] bool summary = false,
        CancellationToken ct = default) =>
        Ok(await reviews.ForProductAsync(slug, sort, page, rating, summary, ct));

    [HttpGet("invite/{token}")]
    public async Task<ActionResult<ReviewInviteDto>> Invite(string token, CancellationToken ct)
    {
        var invite = await reviews.GetInviteAsync(token, ct);
        return invite is null ? NotFound(new { message = "missing" }) : Ok(invite);
    }

    [HttpPost("invite/{token}")]
    [RequestSizeLimit(MaxBody)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxBody)]
    public async Task<ActionResult<object>> Submit(string token, [FromForm] SubmitReviewForm form, CancellationToken ct)
    {
        try
        {
            var id = await reviews.SubmitAsync(
                token,
                form.Rating,
                form.Body,
                form.AuthorName,
                form.Photos ?? [],
                ct);
            return Ok(new { id });
        }
        catch (InvalidOperationException ex)
        {
            var missing = ex.Message == "missing";
            return missing
                ? NotFound(new { message = ex.Message })
                : BadRequest(new { message = ex.Message });
        }
    }
}

public class SubmitReviewForm
{
    public int Rating { get; set; }
    public string? Body { get; set; }
    public string? AuthorName { get; set; }
    public List<IFormFile>? Photos { get; set; }
}
