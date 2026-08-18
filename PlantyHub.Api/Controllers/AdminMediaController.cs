using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/media")]
public class AdminMediaController(IR2StorageService storage) : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    };

    private const long MaxBytes = 8 * 1024 * 1024;

    [HttpPost("upload")]
    [RequestSizeLimit(MaxBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxBytes)]
    public async Task<ActionResult<object>> Upload(IFormFile file, CancellationToken ct)
    {
        if (!storage.IsConfigured)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Cloudflare R2 is not configured. Set R2 settings in appsettings or environment variables.",
            });

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (file.Length > MaxBytes)
            return BadRequest(new { message = "File exceeds 8 MB limit." });

        var contentType = file.ContentType;
        if (string.IsNullOrWhiteSpace(contentType) || !AllowedContentTypes.Contains(contentType))
            return BadRequest(new { message = "Only JPEG, PNG, WebP and GIF images are allowed." });

        await using var stream = file.OpenReadStream();
        var (url, key) = await storage.UploadAsync(stream, file.FileName, contentType, ct);

        return Ok(new { url, key });
    }
}
