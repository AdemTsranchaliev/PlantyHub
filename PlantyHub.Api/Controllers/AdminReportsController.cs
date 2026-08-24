using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/reports")]
public class AdminReportsController(AccountingReportService reports) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AccountingReportPreviewDto>> Preview(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] bool includeCancelled = false,
        CancellationToken ct = default) =>
        Ok(await reports.PreviewAsync(from, to, includeCancelled, ct));

    [HttpGet("{kind}")]
    public async Task<IActionResult> Download(
        string kind,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] bool includeCancelled = false,
        CancellationToken ct = default)
    {
        try
        {
            var file = await reports.DownloadAsync(kind, from, to, includeCancelled, ct);
            return File(file.Bytes, file.ContentType, file.FileName);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
