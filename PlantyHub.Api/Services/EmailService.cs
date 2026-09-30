namespace PlantyHub.Api.Services;

using Azure;
using Azure.Communication.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MimeKit;
using PlantyHub.Api.Models;

public class EmailSettings
{
    public const string SectionName = "Email";
    public string FromAddress { get; set; } = "DoNotReply@plantyhub.com";
    public string FromName { get; set; } = "PlantyHub";
    public string SupportAddress { get; set; } = "support@plantyhub.com";
    public string ConnectionString { get; set; } = string.Empty;
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;

    public bool IsAcsConfigured => !string.IsNullOrWhiteSpace(ConnectionString);
    public bool IsSmtpConfigured => !string.IsNullOrWhiteSpace(SmtpHost);
}

public class AppSettings
{
    public const string SectionName = "App";
    public string FrontendUrl { get; set; } = "http://localhost:5173";
}

public record EmailAttachment(byte[] Bytes, string FileName, string ContentType);

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default, EmailAttachment? attachment = null);
}

public class DevEmailSender(ILogger<DevEmailSender> logger, IOptions<EmailSettings> options) : IEmailSender
{
    private readonly EmailSettings _settings = options.Value;

    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default, EmailAttachment? attachment = null)
    {
        logger.LogInformation(
            "DEV EMAIL\nTo: {To}\nFrom: {From}\nSubject: {Subject}\nAttachment: {Attachment}\n{Body}",
            to,
            $"{_settings.FromName} <{_settings.FromAddress}>",
            subject,
            attachment is null ? "—" : $"{attachment.FileName} ({attachment.Bytes.Length} bytes)",
            htmlBody);

        return Task.CompletedTask;
    }
}

public class SmtpEmailSender(IOptions<EmailSettings> options, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    private readonly EmailSettings _settings = options.Value;

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default, EmailAttachment? attachment = null)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        var body = new BodyBuilder { HtmlBody = htmlBody };
        if (attachment is { Bytes.Length: > 0 })
            body.Attachments.Add(attachment.FileName, attachment.Bytes, ContentType.Parse(attachment.ContentType));
        message.Body = body.ToMessageBody();

        using var client = new SmtpClient();
        var secure = _settings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;
        await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, secure, ct);

        if (!string.IsNullOrWhiteSpace(_settings.SmtpUser))
            await client.AuthenticateAsync(_settings.SmtpUser, _settings.SmtpPassword, ct);

        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);

        logger.LogInformation("SMTP email sent to {To} subject {Subject}", to, subject);
    }
}

public class AcsEmailSender(IOptions<EmailSettings> options, ILogger<AcsEmailSender> logger) : IEmailSender
{
    private readonly EmailSettings _settings = options.Value;
    private readonly EmailClient _client = new(options.Value.ConnectionString);

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default, EmailAttachment? attachment = null)
    {
        var content = new EmailContent(subject) { Html = htmlBody };
        var message = new EmailMessage(_settings.FromAddress, to, content);
        if (attachment is { Bytes.Length: > 0 })
        {
            message.Attachments.Add(new Azure.Communication.Email.EmailAttachment(
                attachment.FileName,
                attachment.ContentType,
                BinaryData.FromBytes(attachment.Bytes)));
        }

        var operation = await _client.SendAsync(WaitUntil.Completed, message, ct);
        logger.LogInformation(
            "ACS email sent to {To} subject {Subject} status {Status} id {Id}",
            to,
            subject,
            operation.Value.Status,
            operation.Id);
    }
}

public class AuthEmailService(
    UserManager<ApplicationUser> userManager,
    EmailTemplateService templates,
    IOptions<AppSettings> appOptions)
{
    private readonly AppSettings _app = appOptions.Value;

    public async Task SendVerificationEmailAsync(ApplicationUser user, CancellationToken ct = default)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var link = BuildLink("/verify-email", new Dictionary<string, string?>
        {
            ["userId"] = user.Id,
            ["token"] = token,
        });

        await templates.SendTemplatedAsync(
            "verify-email",
            user.Email ?? string.Empty,
            new Dictionary<string, string>
            {
                ["name"] = EmailTemplateService.HtmlEncode(user.FullName ?? user.Email),
                ["verifyUrl"] = link,
                ["siteUrl"] = _app.FrontendUrl.TrimEnd('/'),
                ["logoUrl"] = "https://media.plantyhub.com/logo.png",
            },
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

        await templates.SendTemplatedAsync(
            "password-reset",
            user.Email ?? string.Empty,
            new Dictionary<string, string>
            {
                ["name"] = EmailTemplateService.HtmlEncode(user.FullName ?? user.Email),
                ["resetUrl"] = link,
            },
            ct);
    }

    public async Task SendWelcomeEmailAsync(ApplicationUser user, CancellationToken ct = default)
    {
        await templates.SendTemplatedAsync(
            "welcome",
            user.Email ?? string.Empty,
            new Dictionary<string, string>
            {
                ["name"] = EmailTemplateService.HtmlEncode(user.FullName ?? user.Email),
            },
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
