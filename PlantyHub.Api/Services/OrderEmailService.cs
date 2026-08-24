using System.Globalization;
using System.Net;
using System.Text;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class OrderEmailService(
    EmailTemplateService templates,
    CourierService couriers,
    VatService vat,
    IOptions<AppSettings> appOptions)
{
    public const string Confirmation = "order-confirmation";
    public const string Invoice = "order-invoice";
    public const string Processing = "order-processing";
    public const string Shipped = "order-shipped";
    public const string Delivered = "order-delivered";
    public const string Cancelled = "order-cancelled";

    static readonly TimeZoneInfo Sofia = ResolveSofia();

    public async Task TrySendCheckoutAsync(Order order, CancellationToken ct = default)
    {
        await TrySendAsync(order, Confirmation, ct);
        await TrySendAsync(order, Invoice, ct);
    }

    public async Task TrySendStatusAsync(Order order, CancellationToken ct = default)
    {
        var key = order.Status switch
        {
            OrderStatus.Processing => Processing,
            OrderStatus.Shipped => Shipped,
            OrderStatus.Delivered => Delivered,
            OrderStatus.Cancelled => Cancelled,
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
            await templates.SendTemplatedAsync(key, order.Email, variables, ct);
        }
        catch
        {
            // Order/status already saved — email must not roll that back.
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
            ["itemsSummary"] = ItemsSummary(order),
            ["itemsHtml"] = ItemsTable(order),
            ["totalsHtml"] = TotalsTable(order, net),
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
            ["trackingBlock"] = TrackingBlock(trackingNumber, trackingUrl),
            ["courier"] = Enc(order.Waybill?.Courier.ToString() ?? order.ShippingCourier ?? "—"),
        };
    }

    public static Dictionary<string, string> SampleVariables()
    {
        var items = """
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #ECEEE8;color:#1C231E;font-size:14px;">
                HomeGarder One<br/><span style="color:#68706A;font-size:12px;">Gift: Basil</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #ECEEE8;color:#68706A;font-size:14px;text-align:center;width:48px;">1</td>
              <td style="padding:10px 0;border-bottom:1px solid #ECEEE8;color:#1C231E;font-size:14px;text-align:right;font-weight:700;width:88px;">€99.00</td>
            </tr>
            """;
        var totals = """
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">Subtotal</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">€99.00</td></tr>
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">Shipping</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">€4.99</td></tr>
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">VAT 20%</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">€17.33</td></tr>
            <tr><td style="padding:10px 0 0;color:#1C231E;font-size:16px;font-weight:800;border-top:1px solid #ECEEE8;">Total</td><td style="padding:10px 0 0;text-align:right;color:#1C231E;font-size:16px;font-weight:800;border-top:1px solid #ECEEE8;">€103.99</td></tr>
            """;

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
            ["itemsSummary"] = "HomeGarder One × 1 (+ Basil)",
            ["itemsHtml"] = items,
            ["totalsHtml"] = totals,
            ["shippingAddress"] = "Elena Petrova<br/>0888 000 000<br/>ul. Example 12<br/>Sofia 1000<br/>BG",
            ["billingAddress"] = "Elena Petrova<br/>0888 000 000<br/>ul. Example 12<br/>Sofia 1000<br/>BG",
            ["sellerName"] = "PlantyHub",
            ["sellerVatNumber"] = "BG123456789",
            ["sellerAddress"] = "Pazardzhik, Bulgaria",
            ["sellerEmail"] = "support@plantyhub.com",
            ["sellerPhone"] = "",
            ["trackingNumber"] = "SP-998877",
            ["trackingUrl"] = "https://www.speedy.bg/track/SP-998877",
            ["trackingBlock"] = TrackingBlock("SP-998877", "https://www.speedy.bg/track/SP-998877"),
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
            var gift = string.IsNullOrWhiteSpace(item.GiftName)
                ? ""
                : $"<br/><span style=\"color:#68706A;font-size:12px;\">Gift: {Enc(item.GiftName)}</span>";
            sb.Append($"""
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #ECEEE8;color:#1C231E;font-size:14px;">{Enc(item.Name)}{gift}</td>
                  <td style="padding:10px 0;border-bottom:1px solid #ECEEE8;color:#68706A;font-size:14px;text-align:center;width:48px;">{item.Quantity}</td>
                  <td style="padding:10px 0;border-bottom:1px solid #ECEEE8;color:#1C231E;font-size:14px;text-align:right;font-weight:700;width:88px;">{PriceHelper.FormatEuro(item.Total)}</td>
                </tr>
                """);
        }
        return sb.ToString();
    }

    static string TotalsTable(Order order, decimal net)
    {
        var vatLabel = order.TaxRate is > 0 ? $"VAT {order.TaxRate.Value.ToString("0.##", CultureInfo.InvariantCulture)}%" : "VAT";
        return $"""
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">Subtotal</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">{PriceHelper.FormatEuro(order.Subtotal)}</td></tr>
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">Shipping</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">{PriceHelper.FormatEuro(order.ShippingCost)}</td></tr>
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">Taxable amount</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">{PriceHelper.FormatEuro(net)}</td></tr>
            <tr><td style="padding:6px 0;color:#68706A;font-size:14px;">{vatLabel}</td><td style="padding:6px 0;text-align:right;color:#1C231E;font-size:14px;">{PriceHelper.FormatEuro(order.Tax)}</td></tr>
            <tr><td style="padding:10px 0 0;color:#1C231E;font-size:16px;font-weight:800;border-top:1px solid #ECEEE8;">Total</td><td style="padding:10px 0 0;text-align:right;color:#1C231E;font-size:16px;font-weight:800;border-top:1px solid #ECEEE8;">{PriceHelper.FormatEuro(order.Total)}</td></tr>
            """;
    }

    static string TrackingBlock(string number, string url)
    {
        if (string.IsNullOrWhiteSpace(number) && string.IsNullOrWhiteSpace(url))
            return """<p style="margin:0;font-size:14px;line-height:1.6;color:#68706A;">Tracking details will appear here once the courier label is created.</p>""";

        var label = Enc(string.IsNullOrWhiteSpace(number) ? "Track shipment" : number);
        if (string.IsNullOrWhiteSpace(url))
            return $"""<p style="margin:0;font-size:16px;line-height:1.6;color:#1C231E;">Tracking: <strong>{label}</strong></p>""";

        var safeUrl = Enc(url);
        return $"""
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1C231E;">Tracking: <strong>{label}</strong></p>
            <table role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <td style="border-radius:12px;background:#2F7D53;">
                  <a href="{safeUrl}" style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Track shipment</a>
                </td>
              </tr>
            </table>
            """;
    }

    static string FormatAddress(string? name, string? phone, string? street, string? city, string? postal, string? country)
    {
        var parts = new[] { name, phone, street, string.Join(" ", new[] { postal, city }.Where(s => !string.IsNullOrWhiteSpace(s))), country }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => Enc(s!.Trim()));
        return string.Join("<br/>", parts);
    }

    static string Payment(PaymentMethod method) => method switch
    {
        PaymentMethod.Card => "Card",
        PaymentMethod.Cod => "Cash on delivery",
        PaymentMethod.Paypal => "PayPal",
        _ => method.ToString(),
    };

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
