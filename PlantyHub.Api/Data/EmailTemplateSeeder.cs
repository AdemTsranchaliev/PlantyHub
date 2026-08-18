using System.Text.Json;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Data;

public static class EmailTemplateSeeder
{
    public static IEnumerable<EmailTemplate> DefaultTemplates()
    {
        // Reference template — keep structure/CSS consistent when editing other keys.
        yield return T(
            "verify-email",
            "Verify email",
            "Sent after registration to confirm the account. Reference layout for other templates.",
            "Confirm your PlantyHub account",
            VerifyEmailHtml(),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["verifyUrl"] = "https://plantyhub.com/verify-email?userId=demo&token=demo",
                ["logoUrl"] = "http://localhost:5281/email/logo.png",
                ["siteUrl"] = "https://plantyhub.com",
            });

        yield return T(
            "password-reset",
            "Password reset",
            "Sent when a customer requests a password reset.",
            "Reset your PlantyHub password",
            Wrap("""
                <h1 style="margin:0 0 16px;font-size:22px;color:#1C231E;">Reset your password</h1>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Hi {{name}},</p>
                <p style="margin:0 0 20px;color:#4A554E;line-height:1.6;">We received a request to reset your PlantyHub password.</p>
                <p style="margin:0 0 24px;"><a href="{{resetUrl}}" style="display:inline-block;background:#2F7D53;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">Reset password</a></p>
                <p style="margin:0;color:#7A857E;font-size:13px;line-height:1.5;">If you did not request this, you can ignore this message.</p>
                """),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["resetUrl"] = "https://plantyhub.com/reset-password?email=elena%40email.com&token=demo",
            });

        yield return T(
            "welcome",
            "Welcome",
            "Sent after a customer verifies their email.",
            "Welcome to PlantyHub",
            Wrap("""
                <h1 style="margin:0 0 16px;font-size:22px;color:#1C231E;">Welcome to PlantyHub</h1>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Hi {{name}},</p>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Your account is ready. Fresh herbs at home are only a few pods away.</p>
                <p style="margin:0;color:#4A554E;line-height:1.6;">Explore the store, pick your garden, and start your first harvest.</p>
                """),
            new Dictionary<string, string> { ["name"] = "Elena" });

        yield return T(
            "order-confirmation",
            "Order confirmation",
            "Sent when a new order is placed.",
            "Order {{orderId}} confirmed",
            Wrap("""
                <h1 style="margin:0 0 16px;font-size:22px;color:#1C231E;">Thanks for your order</h1>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Hi {{name}},</p>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">We received order <strong>{{orderId}}</strong> for <strong>{{total}}</strong>.</p>
                <p style="margin:0 0 8px;color:#4A554E;line-height:1.6;"><strong>Items</strong></p>
                <p style="margin:0;color:#4A554E;line-height:1.6;">{{itemsSummary}}</p>
                """),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["orderId"] = "PH-1042",
                ["total"] = "€108.99",
                ["itemsSummary"] = "HomeGarder One × 1<br/>Basil Seed Pods × 1",
            });

        yield return T(
            "order-shipped",
            "Order shipped",
            "Sent when an order is marked shipped / waybill created.",
            "Order {{orderId}} is on the way",
            Wrap("""
                <h1 style="margin:0 0 16px;font-size:22px;color:#1C231E;">Your order has shipped</h1>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Hi {{name}},</p>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Order <strong>{{orderId}}</strong> is on its way.</p>
                <p style="margin:0;color:#4A554E;line-height:1.6;">Tracking: <strong>{{trackingNumber}}</strong></p>
                """),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["orderId"] = "PH-1042",
                ["trackingNumber"] = "SP-998877",
            });

        yield return T(
            "order-cancelled",
            "Order cancelled",
            "Sent when an order is cancelled.",
            "Order {{orderId}} cancelled",
            Wrap("""
                <h1 style="margin:0 0 16px;font-size:22px;color:#1C231E;">Order cancelled</h1>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Hi {{name}},</p>
                <p style="margin:0;color:#4A554E;line-height:1.6;">Order <strong>{{orderId}}</strong> has been cancelled. If this was a mistake, reply to this email and we will help.</p>
                """),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["orderId"] = "PH-1042",
            });

        yield return T(
            "newsletter",
            "Newsletter campaign",
            "Broadcast template for newsletter subscribers.",
            "{{headline}}",
            Wrap("""
                <h1 style="margin:0 0 16px;font-size:22px;color:#1C231E;">{{headline}}</h1>
                <p style="margin:0 0 12px;color:#4A554E;line-height:1.6;">Hi {{name}},</p>
                <div style="margin:0 0 20px;color:#4A554E;line-height:1.6;">{{bodyHtml}}</div>
                <p style="margin:0;"><a href="{{ctaUrl}}" style="display:inline-block;background:#2F7D53;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">Shop now</a></p>
                """),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["headline"] = "Fresh tips for your indoor garden",
                ["bodyHtml"] = "<p>This week: how to harvest basil without slowing growth.</p>",
                ["ctaUrl"] = "https://plantyhub.com/pods",
            });
    }

    private static EmailTemplate T(
        string key,
        string name,
        string description,
        string subject,
        string html,
        Dictionary<string, string> sample) =>
        new()
        {
            Key = key,
            Name = name,
            Description = description,
            Subject = subject,
            HtmlBody = html,
            SampleDataJson = JsonSerializer.Serialize(sample, JsonDefaults.Options),
            UpdatedAt = DateTime.UtcNow,
        };

    /// <summary>
    /// Canonical email layout for PlantyHub. Copy this structure for other templates:
    /// soft canvas → logo header → content → dark footer with socials.
    /// Variables: {{name}}, {{verifyUrl}}, {{logoUrl}}, {{siteUrl}}
    /// </summary>
    private static string VerifyEmailHtml() => Wrap("""
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#2F7D53;">
          Account
        </p>
        <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:600;color:#1C231E;">
          Confirm your email
        </h1>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#68706A;">
          One click and your PlantyHub account is ready to grow.
        </p>
        <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1C231E;">
          Hi {{name}},
        </p>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#68706A;">
          Thanks for joining PlantyHub. Confirm your email address to unlock your account,
          track orders, and start your indoor garden.
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
          <tr>
            <td style="border-radius:12px;background:#2F7D53;">
              <a href="{{verifyUrl}}"
                 style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;letter-spacing:0.01em;color:#ffffff;text-decoration:none;">
                Verify email
              </a>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px;background:#F4F6F1;border-radius:12px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;">
                Button not working?
              </p>
              <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="{{verifyUrl}}" style="color:#2F7D53;text-decoration:underline;">{{verifyUrl}}</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;line-height:1.55;color:#68706A;">
          If you did not create a PlantyHub account, you can safely ignore this message.
        </p>
        """);

    private static string Wrap(string inner)
    {
        var socials = string.Concat(
            SocialIcon("Instagram", "https://instagram.com/plantyhub.official", "instagram"),
            SocialIcon("TikTok", "https://tiktok.com/@plantyhub.official", "tiktok"),
            SocialIcon("Facebook", "https://facebook.com/plantyhub", "facebook"),
            SocialIcon("YouTube", "https://youtube.com/@plantyhub", "youtube"));

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="color-scheme" content="light" />
              <title>PlantyHub</title>
            </head>
            <body style="margin:0;padding:0;background:#E8EFE8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#E8EFE8;background-image:linear-gradient(160deg,#E8EFE8 0%,#F4F6F1 45%,#E4EDE5 100%);padding:48px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid #D9E3D9;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(31,90,59,0.10);">
                      <tr>
                        <td align="center" style="padding:28px 32px 22px;background:#FAFBF8;">
                          <a href="{{siteUrl}}" style="text-decoration:none;">
                            <img src="{{logoUrl}}" width="168" height="42" alt="PlantyHub"
                                 style="display:block;width:168px;height:auto;border:0;outline:none;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="height:3px;background:#2F7D53;background-image:linear-gradient(90deg,#1F5A3B 0%,#2F7D53 50%,#4CA374 100%);font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="padding:36px 32px 34px;">__INNER__</td>
                      </tr>
                      <tr>
                        <td style="padding:28px 32px 32px;background:#1C231E;">
                          <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4CA374;">
                            Follow us
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
                            <tr>
                              __SOCIALS__
                            </tr>
                          </table>
                          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.72);">
                            Grown with care in Bulgaria
                          </p>
                          <p style="margin:0;font-size:13px;line-height:1.5;">
                            <a href="{{siteUrl}}" style="color:#4CA374;text-decoration:none;font-weight:600;">plantyhub.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
            .Replace("__INNER__", inner, StringComparison.Ordinal)
            .Replace("__SOCIALS__", socials, StringComparison.Ordinal);
    }

    private static string SocialIcon(string label, string href, string slug) => $"""
        <td style="padding-right:10px;">
          <a href="{href}" target="_blank" rel="noopener noreferrer" title="{label}"
             style="display:inline-block;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);text-align:center;line-height:40px;text-decoration:none;">
            <img src="https://cdn.simpleicons.org/{slug}/FFFFFF" width="18" height="18" alt="{label}"
                 style="display:inline-block;vertical-align:middle;border:0;outline:none;" />
          </a>
        </td>
        """;
}
