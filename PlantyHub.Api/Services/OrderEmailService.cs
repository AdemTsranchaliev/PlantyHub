using System.Globalization;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class OrderEmailService(
    EmailTemplateService templates,
    CourierService couriers,
    VatService vat,
    EcontLabelService econt,
    UserManager<ApplicationUser> users,
    IOptions<EmailSettings> emailOptions,
    IOptions<AppSettings> appOptions,
    ILogger<OrderEmailService> logger)
{
    public const string Confirmation = "order-confirmation";
    public const string Invoice = "order-invoice";
    public const string Processing = "order-processing";
    public const string Shipped = "order-shipped";
    public const string Delivered = "order-delivered";
    public const string Cancelled = "order-cancelled";
    public const string ReturnLabel = "order-return-label";
    public const string ReplacementShipped = "order-replacement";
    public const string AdminNotice = "order-admin";

    static readonly TimeZoneInfo Sofia = ResolveSofia();

    public async Task TrySendCheckoutAsync(Order order, CancellationToken ct = default)
    {
        await TrySendAsync(order, Confirmation, ct);
        await TrySendAsync(order, Invoice, ct);
        await TrySendAdminAsync(order, ct);
    }

    public async Task TrySendAdminAsync(Order order, CancellationToken ct = default)
    {
        try
        {
            var recipients = await AdminRecipientsAsync();
            if (recipients.Count == 0)
            {
                logger.LogWarning("No admin recipient for order {OrderId}", order.Id);
                return;
            }

            var variables = await BuildVariablesAsync(order, ct);
            foreach (var to in recipients)
            {
                try
                {
                    await templates.SendTemplatedAsync(AdminNotice, to, variables, ct);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Admin email for order {OrderId} was not sent to {To}", order.Id, to);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Admin email for order {OrderId} was not sent", order.Id);
        }
    }

    public async Task TrySendStatusAsync(Order order, CancellationToken ct = default)
    {
        var key = order.Status switch
        {
            OrderStatus.Processing => Processing,
            OrderStatus.Shipped => Shipped,
            OrderStatus.Delivered => Delivered,
            OrderStatus.Cancelled => Cancelled,
            OrderStatus.ReturnShipped => ReturnLabel,
            OrderStatus.ReplacementShipped => ReplacementShipped,
            _ => null,
        };
        if (key is not null)
            await TrySendAsync(order, key, ct);
    }

    public async Task TrySendAsync(Order order, string key, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(order.Email)) return;
        try
        {
            var variables = await BuildVariablesAsync(order, ct);
            EmailAttachment? attachment = null;
            if (key == Confirmation)
            {
                var safeId = string.Concat(order.Id.Select(ch => Path.GetInvalidFileNameChars().Contains(ch) ? '_' : ch));
                attachment = new EmailAttachment(
                    Encoding.UTF8.GetBytes(OrderSheetDocument.Render(order)),
                    $"PlantyHub-{safeId}.html",
                    "text/html");
            }
            else if (AttachWaybill(key) && !string.IsNullOrWhiteSpace(order.Waybill?.LabelUrl))
            {
                try
                {
                    var pdf = await econt.DownloadLabelAsync(order.Waybill.LabelUrl, ct);
                    var file = string.Concat(order.Waybill.Number.Select(ch => Path.GetInvalidFileNameChars().Contains(ch) ? '-' : ch));
                    var ext = pdf.ContentType.Contains("pdf", StringComparison.OrdinalIgnoreCase) ? "pdf" : "html";
                    var prefix = key switch
                    {
                        ReturnLabel => "vryshtane",
                        ReplacementShipped => "zamyana",
                        _ => "tovaritelnitsa",
                    };
                    attachment = new EmailAttachment(pdf.Bytes, $"{prefix}-{file}.{ext}", pdf.ContentType);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Waybill label for {OrderId} was not attached", order.Id);
                }
            }
            await templates.SendTemplatedAsync(key, order.Email, variables, ct, attachment);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Email {Template} for order {OrderId} was not sent", key, order.Id);
        }
    }

    public async Task<Dictionary<string, string>> BuildVariablesAsync(Order order, CancellationToken ct = default)
    {
        var frontend = appOptions.Value.FrontendUrl.TrimEnd('/');
        var seller = await LoadSellerAsync(ct);
        var net = order.Total - order.Tax;
        var trackingUrl = order.Waybill?.TrackingUrl?.Trim() ?? "";
        var trackingNumber = order.Waybill?.Number ?? "";

        return new Dictionary<string, string>
        {
            ["name"] = Enc(First(order.BillingName, order.CustomerName, "there")),
            ["email"] = Enc(order.Email),
            ["orderId"] = Enc(order.Id),
            ["invoiceNumber"] = Enc(order.Id),
            ["orderDate"] = Date(order.CreatedAt),
            ["orderUrl"] = $"{frontend}/order/{Uri.EscapeDataString(order.Id)}",
            ["total"] = PriceHelper.FormatEuro(order.Total),
            ["subtotal"] = PriceHelper.FormatEuro(order.Subtotal),
            ["shippingCost"] = PriceHelper.FormatEuro(order.ShippingCost),
            ["tax"] = PriceHelper.FormatEuro(order.Tax),
            ["taxRate"] = (order.TaxRate ?? 0m).ToString("0.##", CultureInfo.InvariantCulture),
            ["net"] = PriceHelper.FormatEuro(net),
            ["paymentMethod"] = Enc(Payment(order.PaymentMethod)),
            ["paymentLabel"] = Enc(PaymentBg(order.PaymentMethod)),
            ["phone"] = Enc(First(order.Phone, order.ShippingPhone)),
            ["notes"] = Notes(order.Notes),
            ["promoCode"] = Enc(string.IsNullOrWhiteSpace(order.PromoCode) ? "—" : order.PromoCode),
            ["discount"] = PriceHelper.FormatEuro(order.Discount),
            ["delivery"] = Enc(Delivery(order.ShippingDelivery)),
            ["officeCode"] = Enc(string.IsNullOrWhiteSpace(order.ShippingOfficeCode) ? "—" : order.ShippingOfficeCode),
            ["adminUrl"] = $"{frontend}/admin/orders/{Uri.EscapeDataString(order.Id)}",
            ["itemsSummary"] = ItemsSummary(order),
            ["itemsHtml"] = ItemsTable(order),
            ["totalsHtml"] = TotalsTable(order),
            ["totalsHtmlBg"] = TotalsTableBg(order),
            ["deliveryHtml"] = DeliveryDetailsHtml(
                Courier(order.Waybill?.Courier.ToString() ?? order.ShippingCourier),
                Delivery(order.ShippingDelivery),
                order.ShippingOfficeCode,
                FormatAddress(
                    First(order.ShippingName, order.CustomerName),
                    First(order.ShippingPhone, order.Phone),
                    order.ShippingStreet,
                    order.ShippingCity,
                    order.ShippingPostalCode,
                    First(order.ShippingCountry, order.Country))),
            ["notesHtml"] = NotesBlock(order.Notes),
            ["shippingAddress"] = FormatAddress(
                First(order.ShippingName, order.CustomerName),
                First(order.ShippingPhone, order.Phone),
                order.ShippingStreet,
                order.ShippingCity,
                order.ShippingPostalCode,
                First(order.ShippingCountry, order.Country)),
            ["billingAddress"] = FormatAddress(
                First(order.BillingName, order.CustomerName),
                First(order.BillingPhone, order.Phone),
                order.BillingStreet,
                order.BillingCity,
                order.BillingPostalCode,
                First(order.BillingCountry, order.Country)),
            ["sellerName"] = Enc(seller.Name),
            ["sellerVatNumber"] = Enc(string.IsNullOrWhiteSpace(seller.VatNumber) ? "—" : seller.VatNumber),
            ["sellerAddress"] = Enc(seller.Address),
            ["sellerEmail"] = Enc(seller.Email),
            ["sellerPhone"] = Enc(seller.Phone),
            ["trackingNumber"] = Enc(string.IsNullOrWhiteSpace(trackingNumber) ? "—" : trackingNumber),
            ["trackingUrl"] = Enc(trackingUrl),
            ["trackingBlock"] = TrackingBlock(trackingNumber, trackingUrl, !string.IsNullOrWhiteSpace(order.Waybill?.LabelUrl)),
            ["courier"] = Enc(Courier(order.Waybill?.Courier.ToString() ?? order.ShippingCourier)),
        };
    }

    public static Dictionary<string, string> SampleVariables()
    {
        var items = ItemRow("HomeGarder One", "Подарък: Basil", "1", "€99.00");
        var totals = string.Concat(
            MoneyRow("Subtotal", "€99.00"),
            MoneyRow("Shipping", "€4.99"),
            MoneyRow("Total", "€103.99", final: true),
            VatNote("Price includes VAT."));
        var totalsBg = string.Concat(
            MoneyRow("Междинна сума", "€99.00"),
            MoneyRow("Доставка", "€4.99"),
            MoneyRow("Общо", "€103.99", final: true),
            VatNote("Цената е с ДДС."));

        return new Dictionary<string, string>
        {
            ["name"] = "Elena",
            ["email"] = "elena@email.com",
            ["orderId"] = "PH-260820120000",
            ["invoiceNumber"] = "PH-260820120000",
            ["orderDate"] = "20.08.2026",
            ["orderUrl"] = "https://plantyhub.com/order/PH-260820120000",
            ["total"] = "€103.99",
            ["subtotal"] = "€99.00",
            ["shippingCost"] = "€4.99",
            ["tax"] = "€17.33",
            ["taxRate"] = "20",
            ["net"] = "€86.66",
            ["paymentMethod"] = "Card",
            ["paymentLabel"] = "Карта",
            ["phone"] = "0888 000 000",
            ["notes"] = "Оставете пред вратата.",
            ["promoCode"] = "WELCOME",
            ["discount"] = "€0.00",
            ["delivery"] = "До адрес",
            ["officeCode"] = "—",
            ["adminUrl"] = "https://plantyhub.com/admin/orders/PH-260820120000",
            ["itemsSummary"] = "HomeGarder One × 1 (+ Basil)",
            ["itemsHtml"] = items,
            ["totalsHtml"] = totals,
            ["totalsHtmlBg"] = totalsBg,
            ["deliveryHtml"] = DeliveryDetailsHtml(
                "Speedy",
                "До адрес",
                null,
                "Elena Petrova<br/>0888 000 000<br/>ul. Example 12<br/>Sofia 1000<br/>BG"),
            ["notesHtml"] = NotesBlock("Оставете пред вратата."),
            ["shippingAddress"] = "Elena Petrova<br/>0888 000 000<br/>ul. Example 12<br/>Sofia 1000<br/>BG",
            ["billingAddress"] = "Elena Petrova<br/>0888 000 000<br/>ul. Example 12<br/>Sofia 1000<br/>BG",
            ["sellerName"] = "PlantyHub",
            ["sellerVatNumber"] = "BG123456789",
            ["sellerAddress"] = "Pazardzhik, Bulgaria",
            ["sellerEmail"] = "support@plantyhub.com",
            ["sellerPhone"] = "",
            ["trackingNumber"] = "SP-998877",
            ["trackingUrl"] = "https://www.speedy.bg/track/SP-998877",
            ["trackingBlock"] = TrackingBlock("SP-998877", "https://www.speedy.bg/track/SP-998877", labelAttached: true),
            ["courier"] = "Speedy",
        };
    }

    async Task<(string Name, string VatNumber, string Address, string Email, string Phone)> LoadSellerAsync(CancellationToken ct)
    {
        var company = "PlantyHub";
        var address = "Pazardzhik, Bulgaria";
        var email = "support@plantyhub.com";
        var phone = "";
        var vatNumber = "";
        try
        {
            var settings = await couriers.GetAsync(ct);
            var sender = settings.Sender;
            if (!string.IsNullOrWhiteSpace(sender.Company)) company = sender.Company.Trim();
            email = First(sender.Email, email);
            phone = sender.Phone?.Trim() ?? "";
            var line = string.Join(", ", new[] { sender.Street, sender.PostalCode, sender.City, sender.Country }
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s!.Trim()));
            if (!string.IsNullOrWhiteSpace(line))
                address = line;
        }
        catch { }

        try
        {
            var vatSettings = await vat.GetSettingsAsync(ct);
            vatNumber = vatSettings.VatNumber ?? "";
        }
        catch { }

        return (company, vatNumber, address, email, phone);
    }

    static string ItemsSummary(Order order) =>
        string.Join("<br/>", order.Items.Select(i =>
        {
            var line = $"{Enc(i.Name)} × {i.Quantity}";
            if (!string.IsNullOrWhiteSpace(i.GiftName))
                line += $" (+ {Enc(i.GiftName)})";
            return line;
        }));

    static string ItemsTable(Order order)
    {
        var sb = new StringBuilder();
        foreach (var item in order.Items)
        {
            var gift = string.IsNullOrWhiteSpace(item.GiftName) ? null : $"Подарък: {Enc(item.GiftName)}";
            sb.Append(ItemRow(Enc(item.Name), gift, item.Quantity.ToString(CultureInfo.InvariantCulture), PriceHelper.FormatEuro(item.Total)));
        }
        return sb.ToString();
    }

    static string ItemRow(string name, string? gift, string quantity, string total)
    {
        var giftHtml = string.IsNullOrWhiteSpace(gift)
            ? ""
            : $"""<p style="margin:4px 0 0;font-size:12px;line-height:1.4;color:#2F7D53;">{gift}</p>""";
        return $"""
            <tr>
              <td style="padding:13px 0;border-bottom:1px solid #E6EBE4;vertical-align:top;">
                <p style="margin:0;font-size:15px;line-height:1.35;font-weight:700;color:#1C231E;">{name}</p>
                {giftHtml}
              </td>
              <td style="padding:13px 8px;border-bottom:1px solid #E6EBE4;vertical-align:top;text-align:center;font-size:14px;color:#68706A;width:52px;">{quantity}</td>
              <td style="padding:13px 0;border-bottom:1px solid #E6EBE4;vertical-align:top;text-align:right;font-size:14px;font-weight:700;color:#1C231E;width:92px;">{total}</td>
            </tr>
            """;
    }

    static string MoneyRow(string label, string value, bool final = false, bool discount = false)
    {
        if (final)
        {
            return $"""
                <tr>
                  <td style="padding:14px 0 4px;border-top:1px solid #D7E2D8;font-size:15px;font-weight:800;color:#1C231E;">{label}</td>
                  <td style="padding:14px 0 4px;border-top:1px solid #D7E2D8;text-align:right;font-size:18px;line-height:1;font-weight:800;color:#1F5A3B;">{value}</td>
                </tr>
                """;
        }

        var color = discount ? "#1F5A3B" : "#1C231E";
        var labelColor = discount ? "#1F5A3B" : "#68706A";
        return $"""<tr><td style="padding:5px 0;font-size:14px;line-height:1.4;color:{labelColor};">{label}</td><td style="padding:5px 0;text-align:right;font-size:14px;line-height:1.4;color:{color};">{value}</td></tr>""";
    }

    static string VatNote(string text) =>
        $"""<tr><td colspan="2" style="padding:6px 0 0;font-size:12px;line-height:1.4;color:#68706A;">{text}</td></tr>""";

    static string TotalsTable(Order order)
    {
        return string.Concat(
            MoneyRow("Subtotal", PriceHelper.FormatEuro(order.Subtotal)),
            DiscountRow(order),
            MoneyRow("Shipping", PriceHelper.FormatEuro(order.ShippingCost)),
            CodFeeRow(order, "Cash on delivery fee"),
            MoneyRow("Total", PriceHelper.FormatEuro(order.Total), final: true),
            order.Tax > 0 ? VatNote("Price includes VAT.") : "");
    }

    static bool AttachWaybill(string key) =>
        key is Shipped or ReturnLabel or ReplacementShipped;

    static string TrackingBlock(string number, string url, bool labelAttached = false)
    {
        if (string.IsNullOrWhiteSpace(number) && string.IsNullOrWhiteSpace(url))
            return "";

        var label = Enc(string.IsNullOrWhiteSpace(number) ? "—" : number);
        var note = labelAttached
            ? """<p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#68706A;">Стикерът е прикачен към този имейл.</p>"""
            : "";
        var button = string.IsNullOrWhiteSpace(url)
            ? ""
            : $"""
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:14px 0 0;">
                  <tr>
                    <td style="border-radius:999px;background:#2F7D53;">
                      <a href="{Enc(url)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Проследи пратката</a>
                    </td>
                  </tr>
                </table>
                """;

        return Panel($"""
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Товарителница</p>
            <p style="margin:0;font-size:20px;line-height:1.3;font-weight:700;letter-spacing:0.01em;color:#1C231E;">{label}</p>
            {note}
            {button}
            """);
    }

    static string Panel(string inner, string margin = "0") => $"""
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:{margin};background:#F6F8F4;border:1px solid #E3EAE3;border-radius:14px;">
          <tr>
            <td style="padding:16px 18px;">{inner}</td>
          </tr>
        </table>
        """;

    static string FormatAddress(string? name, string? phone, string? street, string? city, string? postal, string? country)
    {
        var parts = new[] { name, phone, street, string.Join(" ", new[] { postal, city }.Where(s => !string.IsNullOrWhiteSpace(s))), country }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => Enc(s!.Trim()));
        return string.Join("<br/>", parts);
    }

    async Task<List<string>> AdminRecipientsAsync()
    {
        var recipients = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var support = emailOptions.Value.SupportAddress?.Trim();
        if (IsEmail(support))
            recipients.Add(support!);

        try
        {
            foreach (var admin in await users.GetUsersInRoleAsync("Admin"))
            {
                var email = admin.Email?.Trim();
                if (IsEmail(email))
                    recipients.Add(email!);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Admin users could not be loaded for order notifications");
        }

        return recipients.ToList();
    }

    static string TotalsTableBg(Order order)
    {
        return string.Concat(
            MoneyRow("Междинна сума", PriceHelper.FormatEuro(order.Subtotal)),
            DiscountRow(order, "Отстъпка"),
            MoneyRow("Доставка", PriceHelper.FormatEuro(order.ShippingCost)),
            CodFeeRow(order, "Такса наложен платеж"),
            MoneyRow("Общо", PriceHelper.FormatEuro(order.Total), final: true),
            order.Tax > 0 ? VatNote("Цената е с ДДС.") : "");
    }

    static string DeliveryDetailsHtml(string courier, string delivery, string? officeCode, string addressHtml)
    {
        var office = string.IsNullOrWhiteSpace(officeCode)
            ? ""
            : $"""<br/><span style="color:#68706A;">Офис / автомат: {Enc(officeCode.Trim())}</span>""";
        return $"""
            <p style="margin:0;font-size:15px;line-height:1.45;font-weight:700;color:#1C231E;">{Enc(courier)}</p>
            <p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:#68706A;">{Enc(delivery)}{office}</p>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#1C231E;">{addressHtml}</p>
            """;
    }

    static string NotesBlock(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes)) return "";
        return Panel($"""
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#68706A;">Бележка</p>
            <p style="margin:0;font-size:14px;line-height:1.55;color:#1C231E;">{Notes(notes)}</p>
            """, "16px 0 0");
    }

    static string CodFeeRow(Order order, string label) =>
        order.CodFee > 0 ? MoneyRow(label, PriceHelper.FormatEuro(order.CodFee)) : "";

    static string DiscountRow(Order order) => DiscountRow(order, "Discount");

    static string DiscountRow(Order order, string label)
    {
        if (order.Discount <= 0) return "";
        var text = string.IsNullOrWhiteSpace(order.PromoCode)
            ? label
            : $"{label} ({Enc(order.PromoCode)})";
        return MoneyRow(text, "−" + PriceHelper.FormatEuro(order.Discount), discount: true);
    }

    static string Notes(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes)) return "—";
        return Enc(notes.Trim()).Replace("\r\n", "<br/>", StringComparison.Ordinal).Replace("\n", "<br/>", StringComparison.Ordinal);
    }

    static string Delivery(string? delivery) => delivery?.Trim().ToLowerInvariant() switch
    {
        "address" => "До адрес",
        "office" => "До офис",
        "locker" => "До автомат",
        null or "" => "—",
        _ => delivery.Trim(),
    };

    static string Courier(string? courier) => courier?.Trim().ToLowerInvariant() switch
    {
        "econt" => "Econt",
        "speedy" => "Speedy",
        "dhl" => "DHL",
        "boxnow" => "BoxNow",
        null or "" => "—",
        _ => courier.Trim(),
    };

    static string Payment(PaymentMethod method) => method switch
    {
        PaymentMethod.Card => "Card",
        PaymentMethod.Cod => "Cash on delivery",
        PaymentMethod.Paypal => "PayPal",
        _ => method.ToString(),
    };

    static string PaymentBg(PaymentMethod method) => method switch
    {
        PaymentMethod.Card => "Карта",
        PaymentMethod.Cod => "Наложен платеж",
        PaymentMethod.Paypal => "PayPal",
        _ => method.ToString(),
    };

    static bool IsEmail(string? value) =>
        !string.IsNullOrWhiteSpace(value) && value.Contains('@');

    static string Enc(string? value) => WebUtility.HtmlEncode(value ?? "");

    static string First(params string?[] values) =>
        values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? "";

    static string Date(DateTime value)
    {
        var utc = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };
        return TimeZoneInfo.ConvertTimeFromUtc(utc, Sofia).ToString("dd.MM.yyyy", CultureInfo.InvariantCulture);
    }

    static TimeZoneInfo ResolveSofia()
    {
        foreach (var id in new[] { "Europe/Sofia", "FLE Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
            catch (InvalidTimeZoneException) { }
        }
        return TimeZoneInfo.Utc;
    }
}
