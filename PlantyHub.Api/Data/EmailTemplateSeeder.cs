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
            "Потвърждение на имейл",
            "След регистрация, за потвърждаване на акаунта.",
            "Потвърди акаунта си в PlantyHub",
            VerifyEmailHtml(),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["verifyUrl"] = "https://plantyhub.com/verify-email?userId=demo&token=demo",
                ["logoUrl"] = "https://media.plantyhub.com/logo.png",
                ["siteUrl"] = "https://plantyhub.com",
            });

        yield return T(
            "password-reset",
            "Нова парола",
            "Когато клиент поиска нова парола.",
            "Нова парола за PlantyHub",
            Wrap("""
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">Акаунт</p>
                <h1 class="h1" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">Нова парола</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#68706A;">Избери нова парола и влизаш отново.</p>
                <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1C231E;">Здравей {{name}},</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#68706A;">Получихме заявка за нова парола в PlantyHub. Връзката отдолу важи, докато я използваш.</p>
                __BUTTON__
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0 0;background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Бутонът не работи?</p>
                      <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{resetUrl}}" style="color:#2F7D53;text-decoration:underline;">{{resetUrl}}</a></p>
                    </td>
                  </tr>
                </table>
                <p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:#68706A;">Ако не си поискал това, можеш спокойно да игнорираш съобщението.</p>
                """.Replace("__BUTTON__", Button("{{resetUrl}}", "Нова парола"), StringComparison.Ordinal)),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["resetUrl"] = "https://plantyhub.com/reset-password?email=elena%40email.com&token=demo",
            });

        yield return T(
            "welcome",
            "Добре дошли",
            "След като клиентът потвърди имейла си.",
            "Добре дошъл в PlantyHub",
            Wrap("""
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">Добре дошъл</p>
                <h1 class="h1" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">Градината започва оттук</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#68706A;">Пресни билки у дома са на няколко капсули разстояние.</p>
                <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1C231E;">Здравей {{name}},</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#68706A;">Акаунтът ти е готов. Разгледай магазина, избери градина и започни първата реколта.</p>
                __BUTTON__
                """.Replace("__BUTTON__", Button("{{siteUrl}}", "Към магазина"), StringComparison.Ordinal)),
            new Dictionary<string, string> { ["name"] = "Elena" });

        yield return T(
            "order-confirmation",
            "Потвърждение",
            "До клиента при нова поръчка. Артикули, сума, плащане, куриер и доставка.",
            "Поръчка {{orderId}} е потвърдена",
            Wrap(ConfirmationHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-invoice",
            "Фактура",
            "Фактура заедно с потвърждението. Продавач, ДДС номер, адрес, артикули и данък.",
            "Фактура {{invoiceNumber}} за поръчка {{orderId}}",
            Wrap(InvoiceHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-processing",
            "Подготовка",
            "Когато поръчката се подготвя.",
            "Поръчка {{orderId}} се подготвя",
            Wrap(ProcessingHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-shipped",
            "Изпратена",
            "Когато поръчката е изпратена или е създадена товарителница.",
            "Поръчка {{orderId}} пътува към теб",
            Wrap(ShippedHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-delivered",
            "Доставена",
            "Когато поръчката е отбелязана като доставена.",
            "Поръчка {{orderId}} е доставена",
            Wrap(DeliveredHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-return-label",
            "Товарителница за връщане",
            "До клиента със стикер за връщане, когато вече е получил продукта или е открил рекламация.",
            "Товарителница за връщане · {{orderId}}",
            Wrap(ReturnLabelHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-replacement",
            "Замяна",
            "Когато е създадена товарителница за замяна.",
            "Замяна по поръчка {{orderId}}",
            Wrap(ReplacementHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-cancelled",
            "Отказана",
            "Когато поръчката е отказана.",
            "Поръчка {{orderId}} е отказана",
            Wrap(CancelledHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "order-admin",
            "Нова поръчка (админ)",
            "До админа и поддръжката, когато клиент направи поръчка.",
            "Нова поръчка {{orderId}} · {{total}}",
            Wrap(AdminOrderHtml()),
            OrderEmailService.SampleVariables());

        yield return T(
            "review-request",
            "Покана за отзив",
            "Ръчно изпратена покана клиентът да оцени конкретен продукт, с текст и снимки.",
            "Оцени {{productName}}",
            Wrap("""
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">Отзив</p>
                <h1 class="h1" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">Оцени {{productName}}</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#68706A;">Оценка, отзив и снимки за този продукт.</p>
                <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1C231E;">Здравей {{name}},</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#68706A;">Оцени <strong style="color:#1C231E;">{{productName}}</strong>. Напиши как ти се стори и добави снимки. Отзивът влиза в магазина веднага.</p>
                __BUTTON__
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0 0;background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Бутонът не работи?</p>
                      <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{reviewUrl}}" style="color:#2F7D53;text-decoration:underline;">{{reviewUrl}}</a></p>
                    </td>
                  </tr>
                </table>
                """.Replace("__BUTTON__", Button("{{reviewUrl}}", "Оцени {{productName}}"), StringComparison.Ordinal)),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["productName"] = "HomeGarder One",
                ["reviewUrl"] = "https://plantyhub.com/review/demo",
            });

        yield return T(
            "newsletter",
            "Бюлетин",
            "Шаблон за бюлетин към абонатите.",
            "{{headline}}",
            Wrap("""
                <h1 class="h1" style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">{{headline}}</h1>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#1C231E;">Здравей {{name}},</p>
                <div style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#68706A;">{{bodyHtml}}</div>
                __BUTTON__
                """.Replace("__BUTTON__", Button("{{ctaUrl}}", "Към магазина"), StringComparison.Ordinal)),
            new Dictionary<string, string>
            {
                ["name"] = "Elena",
                ["headline"] = "Свежи съвети за домашната градина",
                ["bodyHtml"] = "<p>Тази седмица: как да обереш босилека, без да забавиш растежа.</p>",
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
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">Акаунт</p>
        <h1 class="h1" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">Потвърди имейла си</h1>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#68706A;">Едно натискане и акаунтът в PlantyHub е готов.</p>
        <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1C231E;">Здравей {{name}},</p>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#68706A;">Благодарим, че се присъедини. Потвърди имейла, за да отключиш акаунта, да следиш поръчките и да започнеш домашната градина.</p>
        __BUTTON__
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0 0;background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Бутонът не работи?</p>
              <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{verifyUrl}}" style="color:#2F7D53;text-decoration:underline;">{{verifyUrl}}</a></p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:#68706A;">Ако не си създавал акаунт в PlantyHub, можеш спокойно да игнорираш съобщението.</p>
        """.Replace("__BUTTON__", Button("{{verifyUrl}}", "Потвърди имейла"), StringComparison.Ordinal));

    private static string ConfirmationHtml() => OrderIntro(
        "Поръчка",
        "Благодарим за поръчката",
        "Получихме я. По-долу са артикулите, сумата и доставката.",
        Highlight("Номер", "{{orderId}}", "{{orderDate}} · {{paymentLabel}}"),
        "Здравей {{name}},") + LineItems("Артикули", "Бр.", "Сума", "{{totalsHtmlBg}}") + Card("""
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Доставка</p>
        {{deliveryHtml}}
        """, "0 0 12px") + """
        {{notesHtml}}
        __NEXT__
        <div style="margin:28px 0 0;">__BUTTON__</div>
        """
        .Replace("__NEXT__", NextSteps(), StringComparison.Ordinal)
        .Replace("__BUTTON__", Button("{{orderUrl}}", "Виж поръчката"), StringComparison.Ordinal);

    private static string NextSteps() => """
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 0;background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
          <tr>
            <td style="padding:18px 18px 8px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2F7D53;">Докато чакаш</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#1C231E;">Влез в групата за съвети от други градинари или мина обучението, преди градината да пристигне.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 18px 8px;">
              <a href="https://facebook.com/plantyhub" style="font-size:15px;font-weight:700;color:#2F7D53;text-decoration:none;">Присъедини се във Facebook →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 18px 18px;">
              <a href="{{siteUrl}}/learn" style="font-size:15px;font-weight:700;color:#2F7D53;text-decoration:none;">Виж обучението →</a>
            </td>
          </tr>
        </table>
        """;

    private static string InvoiceHtml() => """
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">Фактура</p>
        <h1 class="h1" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">Фактура {{invoiceNumber}}</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.55;color:#68706A;">Запази този имейл като фактура за поръчка {{orderId}}.</p>
        """ + Split(
            Card("""
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Продавач</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;"><strong>{{sellerName}}</strong><br/>ДДС: {{sellerVatNumber}}<br/>{{sellerAddress}}<br/>{{sellerEmail}}</p>
                """, "0"),
            Card("""
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Получател</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{billingAddress}}</p>
                """, "0")) + """
        <p style="margin:4px 0 20px;font-size:14px;line-height:1.6;color:#68706A;">Дата: <strong style="color:#1C231E;">{{orderDate}}</strong> · Плащане: <strong style="color:#1C231E;">{{paymentLabel}}</strong></p>
        """ + LineItems("Артикули", "Бр.", "Сума", "{{totalsHtmlBg}}") + Card("""
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Доставка до</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{shippingAddress}}</p>
        """, "0 0 16px") + """
        <p style="margin:0;font-size:12px;line-height:1.55;color:#68706A;">Сумите са в евро. Цената е с ДДС.</p>
        """;

    private static string ProcessingHtml() => OrderIntro(
        "Поръчка",
        "Подготвяме поръчката",
        "Плащането е прието и градината се опакова.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">Поръчка <strong style="color:#1C231E;">{{orderId}}</strong> се подготвя. Ще получиш товарителница, щом я предадем на куриера.</p>
        <div style="margin:0 0 8px;">{{trackingBlock}}</div>
        """) + OrderDetails() + ViewOrderButton();

    private static string ShippedHtml() => OrderIntro(
        "Доставка",
        "Поръчката пътува към теб",
        "Куриерът има пратката.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">Поръчка <strong style="color:#1C231E;">{{orderId}}</strong> е предадена на {{courier}}.</p>
        <div style="margin:0 0 8px;">{{trackingBlock}}</div>
        """) + OrderDetails() + ViewOrderButton();

    private static string DeliveredHtml() => OrderIntro(
        "Доставена",
        "Поръчката пристигна",
        "Надяваме се първата реколта да е близо.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">Поръчка <strong style="color:#1C231E;">{{orderId}}</strong> е отбелязана като доставена. Ако нещо липсва, отговори на този имейл.</p>
        <div style="margin:0 0 8px;">{{trackingBlock}}</div>
        """) + OrderDetails() + ViewOrderButton();

    private static string ReturnLabelHtml() => OrderIntro(
        "Връщане",
        "Товарителница за връщане",
        "Принтирай я и предай пратката на куриера.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">По поръчка <strong style="color:#1C231E;">{{orderId}}</strong> ти изпращаме товарителница за връщане. Предай пратката на {{courier}}.</p>
        <div style="margin:0 0 8px;">{{trackingBlock}}</div>
        """,
        "Здравей {{name}},");

    private static string ReplacementHtml() => OrderIntro(
        "Замяна",
        "Замяната е изпратена",
        "Новата пратка пътува към теб.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">Замяната по поръчка <strong style="color:#1C231E;">{{orderId}}</strong> е предадена на {{courier}}.</p>
        <div style="margin:0 0 8px;">{{trackingBlock}}</div>
        """,
        "Здравей {{name}},") + ViewOrderButton();

    private static string CancelledHtml() => OrderIntro(
        "Отказана",
        "Поръчката е отказана",
        "Няма да бъде изпратена.",
        """
        <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#68706A;">Поръчка <strong style="color:#1C231E;">{{orderId}}</strong> за <strong style="color:#1C231E;">{{total}}</strong> е отказана. Ако това е грешка, отговори на този имейл и ще помогнем.</p>
        <div style="margin:0 0 8px;">{{trackingBlock}}</div>
        """) + OrderDetails();

    private static string AdminOrderHtml() => """
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">Админ</p>
        <h1 class="h1" style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">Нова поръчка</h1>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#1F5A3B;border-radius:14px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A8D4B8;">Сума</p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.1;font-weight:600;color:#ffffff;">{{total}}</p>
              <p style="margin:8px 0 0;font-size:13px;line-height:1.45;color:#D5E8DC;">{{orderId}} · {{orderDate}} · {{paymentLabel}}</p>
            </td>
          </tr>
        </table>
        """ + Card("""
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Клиент</p>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#1C231E;"><strong>{{name}}</strong><br/><a href="mailto:{{email}}" style="color:#2F7D53;text-decoration:none;">{{email}}</a><br/>{{phone}}</p>
        """, "0 0 20px") + LineItems("Артикули", "Бр.", "Сума", "{{totalsHtmlBg}}") + Split(
            Card("""
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Доставка</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{courier}}<br/>{{delivery}}<br/>Офис: {{officeCode}}</p>
                """, "0"),
            Card("""
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Промо код</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{promoCode}}<br/>Отстъпка: {{discount}}</p>
                """, "0")) + Card("""
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Фактуриране</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{billingAddress}}</p>
        """, "12px 0 12px") + Card("""
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Бележка</p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#1C231E;">{{notes}}</p>
        """, "0 0 8px") + """
        <div style="margin:20px 0 0;">__BUTTON__</div>
        """.Replace("__BUTTON__", Button("{{adminUrl}}", "Отвори поръчката"), StringComparison.Ordinal);

    private static string OrderIntro(string eyebrow, string title, string subtitle, string body, string greeting = "Здравей {{name}},") =>
        """
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F7D53;">__EYEBROW__</p>
        <h1 class="h1" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#1C231E;">__TITLE__</h1>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.55;color:#68706A;">__SUBTITLE__</p>
        <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#1C231E;">__GREETING__</p>
        __BODY__
        """
        .Replace("__EYEBROW__", eyebrow, StringComparison.Ordinal)
        .Replace("__TITLE__", title, StringComparison.Ordinal)
        .Replace("__SUBTITLE__", subtitle, StringComparison.Ordinal)
        .Replace("__BODY__", body, StringComparison.Ordinal)
        .Replace("__GREETING__", greeting, StringComparison.Ordinal);

    private static string OrderDetails() =>
        LineItems("Артикули", "Бр.", "Сума", "{{totalsHtmlBg}}") + Split(
            Card("""
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Доставка до</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{shippingAddress}}</p>
                """, "0"),
            Card("""
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Плащане</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1C231E;">{{paymentLabel}}</p>
                """, "0"));

    private static string ViewOrderButton() =>
        """<div style="margin:28px 0 0;">""" + Button("{{orderUrl}}", "Виж поръчката") + "</div>";

    private static string Highlight(string label, string value, string meta) => """
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 22px;background:#E7F3EB;border-radius:14px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1F5A3B;">__LABEL__</p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.25;font-weight:600;color:#1C231E;">__VALUE__</p>
              <p style="margin:8px 0 0;font-size:13px;line-height:1.45;color:#3E5346;">__META__</p>
            </td>
          </tr>
        </table>
        """
        .Replace("__LABEL__", label, StringComparison.Ordinal)
        .Replace("__VALUE__", value, StringComparison.Ordinal)
        .Replace("__META__", meta, StringComparison.Ordinal);

    private static string LineItems(string items, string qty, string amount, string totals) => """
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 4px;">
          <tr>
            <td style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">__ITEMS__</td>
            <td style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;text-align:center;width:52px;">__QTY__</td>
            <td style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;text-align:right;width:92px;">__AMOUNT__</td>
          </tr>
          {{itemsHtml}}
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 22px;background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
          <tr>
            <td style="padding:8px 16px 12px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">__TOTALS__</table>
            </td>
          </tr>
        </table>
        """
        .Replace("__ITEMS__", items, StringComparison.Ordinal)
        .Replace("__QTY__", qty, StringComparison.Ordinal)
        .Replace("__AMOUNT__", amount, StringComparison.Ordinal)
        .Replace("__TOTALS__", totals, StringComparison.Ordinal);

    private static string Card(string inner, string margin) => """
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:__MARGIN__;background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
          <tr>
            <td style="padding:16px 18px;">__INNER__</td>
          </tr>
        </table>
        """
        .Replace("__MARGIN__", margin, StringComparison.Ordinal)
        .Replace("__INNER__", inner, StringComparison.Ordinal);

    private static string Split(string left, string right) => """
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px;">
          <tr>
            <td class="stack stack-gap" valign="top" width="50%" style="width:50%;padding-right:6px;">__LEFT__</td>
            <td class="stack" valign="top" width="50%" style="width:50%;padding-left:6px;">__RIGHT__</td>
          </tr>
        </table>
        """
        .Replace("__LEFT__", left, StringComparison.Ordinal)
        .Replace("__RIGHT__", right, StringComparison.Ordinal);

    private static string Button(string href, string label) => """
        <table role="presentation" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" bgcolor="#2F7D53" style="border-radius:999px;background-color:#2F7D53;">
              <a href="__HREF__" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:999px;">__LABEL__</a>
            </td>
          </tr>
        </table>
        """
        .Replace("__HREF__", href, StringComparison.Ordinal)
        .Replace("__LABEL__", label, StringComparison.Ordinal);

    private static string Wrap(string inner)
    {
        var socials = string.Join(
            """<span style="color:#98A199;"> · </span>""",
            new[]
            {
                SocialLink("Instagram", "https://instagram.com/plantyhub.official"),
                SocialLink("TikTok", "https://tiktok.com/@plantyhub.official"),
                SocialLink("Facebook", "https://facebook.com/plantyhub"),
                SocialLink("YouTube", "https://youtube.com/@plantyhub"),
            });

        return """
            <!DOCTYPE html>
            <html lang="bg">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="color-scheme" content="light only" />
              <meta name="supported-color-schemes" content="light only" />
              <meta name="x-apple-disable-message-reformatting" />
              <title>PlantyHub</title>
              <style type="text/css">
                @media only screen and (max-width: 620px) {
                  .email-card { width: 100% !important; max-width: 100% !important; }
                  .email-pad { padding: 28px 20px 26px !important; }
                  .email-header { padding: 26px 20px 18px !important; }
                  .email-footer { padding: 24px 20px 26px !important; }
                  .stack { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
                  .stack-gap { padding-bottom: 12px !important; }
                  .h1 { font-size: 26px !important; line-height: 1.2 !important; }
                }
              </style>
            </head>
            <body style="margin:0;padding:0;background:#E7EFE6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#E7EFE6;padding:40px 12px;">
                <tr>
                  <td align="center">
                    <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
                    <table role="presentation" class="email-card" align="center" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #D5E0D6;border-radius:18px;overflow:hidden;">
                      <tr>
                        <td class="email-header" align="center" style="padding:32px 36px 20px;background:#ffffff;">
                          <a href="{{siteUrl}}" style="text-decoration:none;">
                            <img src="{{logoUrl}}" width="156" alt="PlantyHub" style="display:block;width:156px;max-width:156px;height:auto;border:0;outline:none;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td bgcolor="#2F7D53" style="height:4px;background-color:#2F7D53;background-image:linear-gradient(90deg,#1F5A3B 0%,#2F7D53 55%,#4CA374 100%);font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td class="email-pad" style="padding:36px 36px 32px;">__INNER__</td>
                      </tr>
                      <tr>
                        <td class="email-footer" style="padding:20px 36px 22px;background:#F6F8F4;border-top:1px solid #E3EAE3;" align="center">
                          <p style="margin:0 0 8px;font-size:13px;line-height:1.7;text-align:center;">__SOCIALS__</p>
                          <p style="margin:0;font-size:12px;line-height:1.5;text-align:center;color:#68706A;">
                            <a href="{{siteUrl}}" style="color:#2F7D53;text-decoration:none;font-weight:700;">plantyhub.com</a>
                            <span style="color:#98A199;"> · </span>Отгледано в България
                          </p>
                        </td>
                      </tr>
                    </table>
                    <!--[if mso]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """
            .Replace("__INNER__", inner, StringComparison.Ordinal)
            .Replace("__SOCIALS__", socials, StringComparison.Ordinal);
    }

    private static string SocialLink(string label, string href) =>
        $"""<a href="{href}" target="_blank" style="font-size:13px;font-weight:700;color:#2F7D53;text-decoration:none;">{label}</a>""";
}
