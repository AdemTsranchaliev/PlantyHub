using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(
    IEmailSender emailSender,
    IOptions<EmailSettings> emailOptions,
    ILogger<ContactController> logger) : ControllerBase
{
    private static readonly HashSet<string> AllowedSubjects = new(StringComparer.OrdinalIgnoreCase)
    {
        "general",
        "order",
        "shipping",
        "returns",
        "warranty",
        "pods",
        "wholesale",
        "other",
    };

    [HttpPost]
    public async Task<ActionResult> SendInquiry([FromBody] ContactInquiryRequest request, CancellationToken ct)
    {
        var name = (request.Name ?? string.Empty).Trim();
        var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        var subjectKey = (request.Subject ?? string.Empty).Trim().ToLowerInvariant();
        var message = (request.Message ?? string.Empty).Trim();
        var orderNumber = string.IsNullOrWhiteSpace(request.OrderNumber)
            ? null
            : request.OrderNumber.Trim();

        if (string.IsNullOrWhiteSpace(name) || name.Length > 120)
            return BadRequest(new { message = "Name is required." });

        if (string.IsNullOrWhiteSpace(email) || email.Length > 254 || !email.Contains('@'))
            return BadRequest(new { message = "A valid email is required." });

        if (string.IsNullOrWhiteSpace(subjectKey) || !AllowedSubjects.Contains(subjectKey))
            return BadRequest(new { message = "Subject is required." });

        if (string.IsNullOrWhiteSpace(message) || message.Length < 10 || message.Length > 4000)
            return BadRequest(new { message = "Message must be between 10 and 4000 characters." });

        if (orderNumber is { Length: > 64 })
            return BadRequest(new { message = "Order number is too long." });

        var settings = emailOptions.Value;
        var to = string.IsNullOrWhiteSpace(settings.SupportAddress)
            ? "support@plantyhub.com"
            : settings.SupportAddress.Trim();

        var subjectLabel = SubjectLabel(subjectKey);
        var mailSubject = $"[PlantyHub] {subjectLabel} — {name}";

        var body = new StringBuilder();
        body.Append("<div style=\"font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a\">");
        body.Append("<p><strong>New contact inquiry</strong></p>");
        body.Append("<table style=\"border-collapse:collapse;width:100%;max-width:560px\">");
        AppendRow(body, "Name", name);
        AppendRow(body, "Email", email);
        AppendRow(body, "Subject", subjectLabel);
        if (orderNumber is not null)
            AppendRow(body, "Order number", orderNumber);
        body.Append("</table>");
        body.Append("<p style=\"margin-top:20px\"><strong>Message</strong></p>");
        body.Append("<p style=\"white-space:pre-wrap;background:#f6f4ef;padding:14px;border-radius:10px\">");
        body.Append(WebUtility.HtmlEncode(message));
        body.Append("</p>");
        body.Append($"<p style=\"margin-top:16px;color:#666;font-size:13px\">Reply to: {WebUtility.HtmlEncode(email)}</p>");
        body.Append("</div>");

        try
        {
            await emailSender.SendAsync(to, mailSubject, body.ToString(), ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send contact inquiry from {Email}", email);
            return StatusCode(500, new { message = "Could not send your message. Please try again later." });
        }

        return Ok(new { message = "Inquiry sent." });
    }

    private static void AppendRow(StringBuilder body, string label, string value)
    {
        body.Append("<tr>");
        body.Append($"<td style=\"padding:6px 12px 6px 0;color:#666;vertical-align:top;width:140px\">{WebUtility.HtmlEncode(label)}</td>");
        body.Append($"<td style=\"padding:6px 0;font-weight:600\">{WebUtility.HtmlEncode(value)}</td>");
        body.Append("</tr>");
    }

    private static string SubjectLabel(string key) => key switch
    {
        "order" => "Order",
        "shipping" => "Shipping",
        "returns" => "Returns",
        "warranty" => "Warranty",
        "pods" => "Pods & growing",
        "wholesale" => "Wholesale",
        "other" => "Other",
        _ => "General",
    };
}
