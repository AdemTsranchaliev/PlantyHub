using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class EmailTemplateService(AppDbContext db, IEmailSender emailSender, IOptions<AppSettings> appOptions)
{
    private static readonly Regex PlaceholderRegex = new(@"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}", RegexOptions.Compiled);
    private readonly AppSettings _app = appOptions.Value;

    public async Task<IReadOnlyList<EmailTemplate>> GetAllAsync(CancellationToken ct = default) =>
        await db.EmailTemplates.OrderBy(t => t.Name).ToListAsync(ct);

    public async Task<EmailTemplate?> GetByKeyAsync(string key, CancellationToken ct = default) =>
        await db.EmailTemplates.FirstOrDefaultAsync(t => t.Key == key, ct);

    public async Task<EmailTemplate?> UpdateAsync(string key, UpdateEmailTemplateRequest request, CancellationToken ct = default)
    {
        var template = await GetByKeyAsync(key, ct);
        if (template is null) return null;

        if (request.Name is not null) template.Name = request.Name.Trim();
        if (request.Description is not null) template.Description = request.Description.Trim();
        if (request.Subject is not null) template.Subject = request.Subject;
        if (request.HtmlBody is not null) template.HtmlBody = request.HtmlBody;
        if (request.SampleData is not null)
            template.SampleDataJson = JsonSerializer.Serialize(request.SampleData, JsonDefaults.Options);

        template.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return template;
    }

    public async Task<(string Subject, string Html)?> PreviewAsync(
        string key,
        Dictionary<string, string>? variables,
        CancellationToken ct = default)
    {
        var template = await GetByKeyAsync(key, ct);
        if (template is null) return null;

        var merged = MergeVariables(template, variables);
        return (Render(template.Subject, merged), Render(template.HtmlBody, merged));
    }

    public async Task SendTemplatedAsync(
        string key,
        string to,
        Dictionary<string, string>? variables = null,
        CancellationToken ct = default)
    {
        var preview = await PreviewAsync(key, variables, ct);
        if (preview is null)
            throw new InvalidOperationException($"Email template '{key}' was not found.");

        await emailSender.SendAsync(to, preview.Value.Subject, preview.Value.Html, ct);
    }

    public static Dictionary<string, string> ParseSampleData(EmailTemplate template)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(template.SampleDataJson, JsonDefaults.Options)
                   ?? new Dictionary<string, string>();
        }
        catch
        {
            return new Dictionary<string, string>();
        }
    }

    public static EmailTemplateDetailDto ToDetail(EmailTemplate template) =>
        new(
            template.Key,
            template.Name,
            template.Description,
            template.Subject,
            template.HtmlBody,
            ParseSampleData(template),
            template.UpdatedAt);

    public static EmailTemplateSummaryDto ToSummary(EmailTemplate template) =>
        new(template.Key, template.Name, template.Description, template.Subject, template.UpdatedAt);

    private Dictionary<string, string> MergeVariables(EmailTemplate template, Dictionary<string, string>? overrides)
    {
        var merged = ParseSampleData(template);
        if (overrides is not null)
        {
            foreach (var (k, v) in overrides)
                merged[k] = v;
        }

        var frontend = _app.FrontendUrl.TrimEnd('/');
        merged.TryAdd("siteUrl", frontend);
        merged.TryAdd("logoUrl", $"{frontend}/logo.png");
        return merged;
    }

    public static string Render(string template, IReadOnlyDictionary<string, string> variables) =>
        PlaceholderRegex.Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            return variables.TryGetValue(key, out var value)
                ? value
                : match.Value;
        });

    public static string HtmlEncode(string? value) =>
        WebUtility.HtmlEncode(value ?? string.Empty);
}
