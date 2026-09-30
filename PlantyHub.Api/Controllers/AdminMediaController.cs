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
        "video/mp4",
        "video/webm",
        "video/quicktime",
    };

    private const long MaxImageBytes = 80 * 1024 * 1024;
    private const long MaxVideoBytes = 80 * 1024 * 1024;

    [HttpPost("upload")]
    [RequestSizeLimit(MaxVideoBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxVideoBytes)]
    public async Task<ActionResult<object>> Upload(IFormFile file, CancellationToken ct)
    {
        if (!storage.IsConfigured)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Cloudflare R2 is not configured. Set R2 settings in appsettings or environment variables.",
            });

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var contentType = file.ContentType;
        if (string.IsNullOrWhiteSpace(contentType) || !AllowedContentTypes.Contains(contentType))
            return BadRequest(new { message = "Only JPEG, PNG, WebP, GIF images and MP4, WebM or MOV videos are allowed." });

        var isVideo = contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase);
        var maxBytes = isVideo ? MaxVideoBytes : MaxImageBytes;
        if (file.Length > maxBytes)
            return BadRequest(new { message = isVideo ? "Video exceeds 80 MB limit." : "Image exceeds 80 MB limit." });

        await using var stream = file.OpenReadStream();
        var (url, key) = await storage.UploadAsync(stream, file.FileName, contentType, ct);

        return Ok(new { url, key });
    }
}
