using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/email-templates")]
public class AdminEmailTemplatesController(EmailTemplateService templates) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmailTemplateSummaryDto>>> List(CancellationToken ct)
    {
        var items = await templates.GetAllAsync(ct);
        return Ok(items.Select(EmailTemplateService.ToSummary).ToList());
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<EmailTemplateDetailDto>> Get(string key, CancellationToken ct)
    {
        var template = await templates.GetByKeyAsync(key, ct);
        return template is null ? NotFound() : Ok(EmailTemplateService.ToDetail(template));
    }

    [HttpPut("{key}")]
    public async Task<ActionResult<EmailTemplateDetailDto>> Update(
        string key,
        UpdateEmailTemplateRequest request,
        CancellationToken ct)
    {
        var template = await templates.UpdateAsync(key, request, ct);
        return template is null ? NotFound() : Ok(EmailTemplateService.ToDetail(template));
    }

    [HttpPost("{key}/preview")]
    public async Task<ActionResult<EmailPreviewResponse>> Preview(
        string key,
        EmailPreviewRequest request,
        CancellationToken ct)
    {
        var preview = await templates.PreviewAsync(key, request.Variables, ct);
        return preview is null
            ? NotFound()
            : Ok(new EmailPreviewResponse(preview.Value.Subject, preview.Value.Html));
    }

    [HttpPost("{key}/send-test")]
    public async Task<ActionResult<MessageResponse>> SendTest(
        string key,
        EmailSendTestRequest request,
        CancellationToken ct)
    {
        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return BadRequest(new { message = "A valid email is required." });

        var template = await templates.GetByKeyAsync(key, ct);
        if (template is null) return NotFound();

        await templates.SendTemplatedAsync(key, email, request.Variables, ct);
        return Ok(new MessageResponse($"Test email sent to {email}."));
    }
}
