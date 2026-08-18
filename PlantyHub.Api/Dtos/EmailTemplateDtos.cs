namespace PlantyHub.Api.Dtos;

public record EmailTemplateSummaryDto(
    string Key,
    string Name,
    string Description,
    string Subject,
    DateTime UpdatedAt);

public record EmailTemplateDetailDto(
    string Key,
    string Name,
    string Description,
    string Subject,
    string HtmlBody,
    Dictionary<string, string> SampleData,
    DateTime UpdatedAt);

public record UpdateEmailTemplateRequest(
    string? Name,
    string? Description,
    string? Subject,
    string? HtmlBody,
    Dictionary<string, string>? SampleData);

public record EmailPreviewRequest(Dictionary<string, string>? Variables);

public record EmailPreviewResponse(string Subject, string Html);

public record EmailSendTestRequest(string Email, Dictionary<string, string>? Variables);

public record NewsletterSendRequest(string? Subject, string? HtmlBody, string? Headline, string? CtaUrl);

public record NewsletterSendResult(int Sent, int Failed, IReadOnlyList<string> Errors);
