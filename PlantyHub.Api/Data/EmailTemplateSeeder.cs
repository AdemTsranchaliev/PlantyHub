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
            "Sent when a customer places an order. Includes items, totals, addresses and a link to the order.",
            "Order {{orderId}} confirmed",
            Wrap(ConfirmationHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-invoice",
            "Invoice",
            "Formal invoice sent with the order confirmation. Includes seller VAT number, buyer address, items and tax.",
            "Invoice {{invoiceNumber}} for order {{orderId}}",
            Wrap(InvoiceHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-processing",
            "Order processing",
            "Sent when the order is being prepared.",
            "Order {{orderId}} is being prepared",
            Wrap(ProcessingHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-shipped",
            "Order shipped",
            "Sent when the order is marked shipped or a waybill is created.",
            "Order {{orderId}} is on the way",
            Wrap(ShippedHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-delivered",
            "Order delivered",
            "Sent when the order is marked delivered.",
            "Order {{orderId}} has been delivered",
            Wrap(DeliveredHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-cancelled",
            "Order cancelled",
            "Sent when the order is cancelled.",
            "Order {{orderId}} cancelled",
            Wrap(CancelledHtml()),
            OrderEmailService.SampleVariables());

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

    private static string ConfirmationHtml() => OrderIntro(
        "Order",
        "Thanks for your order",
        "We received your order and a separate invoice is on its way to this inbox.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">
          Order <strong style="color:#1C231E;">{{orderId}}</strong> · {{orderDate}} · {{paymentMethod}}
        </p>
        """) + OrderDetails() + ViewOrderButton();

    private static string InvoiceHtml() => """
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#2F7D53;">
          Invoice / Фактура
        </p>
        <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:600;color:#1C231E;">
          Invoice {{invoiceNumber}}
        </h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.55;color:#68706A;">
          Keep this email as your invoice for order {{orderId}}.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
          <tr>
            <td valign="top" style="width:50%;padding-right:12px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;">Seller</p>
              <p style="margin:0;font-size:14px;line-height:1.55;color:#1C231E;">
                <strong>{{sellerName}}</strong><br/>
                VAT: {{sellerVatNumber}}<br/>
                {{sellerAddress}}<br/>
                {{sellerEmail}}
              </p>
            </td>
            <td valign="top" style="width:50%;padding-left:12px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;">Bill to</p>
              <p style="margin:0;font-size:14px;line-height:1.55;color:#1C231E;">{{billingAddress}}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#68706A;">
          Date: <strong style="color:#1C231E;">{{orderDate}}</strong> · Payment: <strong style="color:#1C231E;">{{paymentMethod}}</strong>
        </p>
        """ + OrderDetails() + """
        <p style="margin:20px 0 0;font-size:12px;line-height:1.55;color:#68706A;">
          Amounts are in EUR. VAT is the standard rate of the shipping country. Taxable amount = total − VAT.
        </p>
        """;

    private static string ProcessingHtml() => OrderIntro(
        "Order",
        "We are preparing your order",
        "Your payment is in and the garden is being packed.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">
          Order <strong style="color:#1C231E;">{{orderId}}</strong> is now being prepared. You will get tracking as soon as it ships.
        </p>
        """) + OrderDetails() + ViewOrderButton();

    private static string ShippedHtml() => OrderIntro(
        "Shipping",
        "Your order is on the way",
        "The courier has the parcel.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">
          Order <strong style="color:#1C231E;">{{orderId}}</strong> has shipped with {{courier}}.
        </p>
        <div style="margin:0 0 24px;">{{trackingBlock}}</div>
        """) + OrderDetails() + ViewOrderButton();

    private static string DeliveredHtml() => OrderIntro(
        "Delivered",
        "Your order has arrived",
        "We hope the first harvest is close.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">
          Order <strong style="color:#1C231E;">{{orderId}}</strong> is marked as delivered. If something is missing, reply to this email.
        </p>
        """) + OrderDetails() + ViewOrderButton();

    private static string CancelledHtml() => OrderIntro(
        "Cancelled",
        "Order cancelled",
        "This order will not be shipped.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">
          Order <strong style="color:#1C231E;">{{orderId}}</strong> for <strong style="color:#1C231E;">{{total}}</strong> has been cancelled.
          If this was a mistake, reply to this email and we will help.
        </p>
        """) + OrderDetails();

    private static string OrderIntro(string eyebrow, string title, string subtitle, string body) =>
        """
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#2F7D53;">
          __EYEBROW__
        </p>
        <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:600;color:#1C231E;">
          __TITLE__
        </h1>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.55;color:#68706A;">
          __SUBTITLE__
        </p>
        <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#1C231E;">
          Hi {{name}},
        </p>
        __BODY__
        """
        .Replace("__EYEBROW__", eyebrow, StringComparison.Ordinal)
        .Replace("__TITLE__", title, StringComparison.Ordinal)
        .Replace("__SUBTITLE__", subtitle, StringComparison.Ordinal)
        .Replace("__BODY__", body, StringComparison.Ordinal);

    private static string OrderDetails() => """
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
          <tr>
            <td style="padding:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;">Items</td>
            <td style="padding:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;text-align:center;width:48px;">Qty</td>
            <td style="padding:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;text-align:right;width:88px;">Total</td>
          </tr>
          {{itemsHtml}}
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
          {{totalsHtml}}
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
          <tr>
            <td valign="top" style="width:50%;padding-right:12px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;">Ship to</p>
              <p style="margin:0;font-size:14px;line-height:1.55;color:#1C231E;">{{shippingAddress}}</p>
            </td>
            <td valign="top" style="width:50%;padding-left:12px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#68706A;">Payment</p>
              <p style="margin:0;font-size:14px;line-height:1.55;color:#1C231E;">{{paymentMethod}}</p>
            </td>
          </tr>
        </table>
        """;

    private static string ViewOrderButton() => """
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 0;">
          <tr>
            <td style="border-radius:12px;background:#2F7D53;">
              <a href="{{orderUrl}}" style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">View order</a>
            </td>
          </tr>
        </table>
        """;

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
