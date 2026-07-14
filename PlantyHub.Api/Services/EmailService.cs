namespace PlantyHub.Api.Services;

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Models;

public class EmailSettings
{
    public const string SectionName = "Email";
    public string FromAddress { get; set; } = "noreply@plantyhub.com";
    public string FromName { get; set; } = "PlantyHub";
}

public class AppSettings
{
    public const string SectionName = "App";
    public string FrontendUrl { get; set; } = "http://localhost:5173";
}

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
}

public class DevEmailSender(ILogger<DevEmailSender> logger, IOptions<EmailSettings> options) : IEmailSender
{
    private readonly EmailSettings _settings = options.Value;

    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        logger.LogInformation(
            "DEV EMAIL\nTo: {To}\nFrom: {From}\nSubject: {Subject}\n{Body}",
            to,
            $"{_settings.FromName} <{_settings.FromAddress}>",
            subject,
            htmlBody);

        return Task.CompletedTask;
    }
}

public class AuthEmailService(
    UserManager<ApplicationUser> userManager,
    IEmailSender emailSender,
    IOptions<AppSettings> appOptions,
    IOptions<EmailSettings> emailOptions)
{
    private readonly AppSettings _app = appOptions.Value;
    private readonly EmailSettings _email = emailOptions.Value;

    public async Task SendVerificationEmailAsync(ApplicationUser user, CancellationToken ct = default)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var link = BuildLink("/verify-email", new Dictionary<string, string?>
        {
            ["userId"] = user.Id,
            ["token"] = token,
        });

        var body = $"""
            <p>Hi {System.Net.WebUtility.HtmlEncode(user.FullName ?? user.Email)},</p>
            <p>Please confirm your PlantyHub account:</p>
            <p><a href="{link}">Verify email</a></p>
            <p>If you did not create this account, you can ignore this message.</p>
            """;

        await emailSender.SendAsync(
            user.Email ?? string.Empty,
            "Verify your PlantyHub account",
            body,
            ct);
    }

    public async Task SendPasswordResetEmailAsync(ApplicationUser user, CancellationToken ct = default)
    {
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var link = BuildLink("/reset-password", new Dictionary<string, string?>
        {
            ["email"] = user.Email,
            ["token"] = token,
        });

        var body = $"""
            <p>Hi {System.Net.WebUtility.HtmlEncode(user.FullName ?? user.Email)},</p>
            <p>We received a request to reset your PlantyHub password.</p>
            <p><a href="{link}">Reset password</a></p>
            <p>If you did not request this, you can ignore this message.</p>
            """;

        await emailSender.SendAsync(
            user.Email ?? string.Empty,
            "Reset your PlantyHub password",
            body,
            ct);
    }

    private string BuildLink(string path, IDictionary<string, string?> query)
    {
        var baseUrl = _app.FrontendUrl.TrimEnd('/');
        var qs = string.Join("&", query
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value!)}"));

        return $"{baseUrl}{path}?{qs}";
    }
}
