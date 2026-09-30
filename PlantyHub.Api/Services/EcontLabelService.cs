using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class EcontLabelService(
    CourierService couriers,
    CourierLocationService locations,
    IHttpClientFactory httpFactory,
    ILogger<EcontLabelService> logger)
{
    public async Task<EcontCheckDto> CheckAsync(Order order, CreateWaybillRequest request, string purpose, CancellationToken ct = default)
    {
        var cod = CodAmount(order, purpose);
        var issues = LocalIssues(order, cod, purpose);
        decimal? price = null;
        string? currency = null;

        var courier = string.IsNullOrWhiteSpace(request.Courier) ? order.ShippingCourier : request.Courier;
        if (!string.Equals(courier, "econt", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(courier))
        {
            issues.Add(new EcontCheckIssueDto("courier", "warning", null));
        }
        else
        {
            try
            {
                var connection = await couriers.GetEcontConnectionAsync(ct);
                if (string.IsNullOrWhiteSpace(connection.Username) || string.IsNullOrWhiteSpace(connection.Password))
                {
                    issues.Add(new EcontCheckIssueDto("credentials", "error", null));
                }
                else if (!issues.Any(i => i.Severity == "error"))
                {
                    var context = await couriers.GetQuoteContextAsync(ct);
                    if (!SenderReady(context) && !connection.BuiltInDemo)
                        issues.Add(new EcontCheckIssueDto("senderAddress", "error", null));
                    else if (!string.IsNullOrWhiteSpace(context.Sender.City) && !HasCyrillic(context.Sender.City))
                        issues.Add(new EcontCheckIssueDto("senderCity", "warning", null));
                    if (issues.Any(i => i.Severity == "error"))
                        return new EcontCheckDto(false, cod is > 0, cod is > 0 ? PriceHelper.FormatEuro(cod.Value) : null, issues, null, null);
                    var label = await BuildLabelAsync(order, context, request, cod, connection.BuiltInDemo, purpose, ct);
                    var json = await PostAsync(connection, "Shipments/LabelService.createLabel.json", new { mode = "validate", label }, ct);
                    var apiError = ReadError(json);
                    if (apiError is not null && !HasPrice(json))
                        issues.Add(new EcontCheckIssueDto("econt", "error", apiError));
                    else
                    {
                        price = Money(json, "label", "totalPrice") ?? Money(json, "label", "senderDueAmount");
                        currency = Text(json, "label", "currency");
                    }
                }
            }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Econt validate failed for {OrderId}", order.Id);
            issues.Add(new EcontCheckIssueDto("econt", "error", ex.Message.Trim()));
        }
        }

        return new EcontCheckDto(
            issues.All(i => i.Severity != "error"),
            cod is > 0,
            cod is > 0 ? PriceHelper.FormatEuro(cod.Value) : null,
            issues,
            price,
            currency);
    }

    public async Task<CourierShipmentResult> CreateAsync(Order order, CreateWaybillRequest request, string purpose, CancellationToken ct = default)
    {
        var connection = await couriers.GetEcontConnectionAsync(ct);
        if (string.IsNullOrWhiteSpace(connection.Username) || string.IsNullOrWhiteSpace(connection.Password))
            throw new InvalidOperationException("Няма връзка с Еконт. Попълни потребител и парола в Куриери.");

        var context = await couriers.GetQuoteContextAsync(ct);
        var cod = CodAmount(order, purpose);
        var blocking = LocalIssues(order, cod, purpose).Where(i => i.Severity == "error").ToList();
        if (blocking.Count > 0)
            throw new InvalidOperationException("Данните за наложения платеж или адреса не са коректни. Натисни „Провери“.");
        if (!SenderReady(context) && !connection.BuiltInDemo)
            throw new InvalidOperationException("Попълни град и улица на подателя, или код на офис, в Куриери.");

        var label = await BuildLabelAsync(order, context, request, cod, connection.BuiltInDemo, purpose, ct);
        var json = await PostAsync(connection, "Shipments/LabelService.createLabel.json", new { mode = "create", label }, ct);
        var apiError = ReadError(json);
        var number = Text(json, "label", "shipmentNumber");
        if (string.IsNullOrWhiteSpace(number))
            throw new InvalidOperationException(apiError ?? "Еконт не върна номер на товарителница.");

        var pdf = Text(json, "label", "pdfURL") ?? Text(json, "label", "pdfUrl");
        var price = Money(json, "label", "totalPrice") ?? Money(json, "label", "senderDueAmount");
        var mode = connection.TestMode ? "sandbox" : "live";
        return new CourierShipmentResult(
            number,
            mode,
            $"https://www.econt.com/tracking/{Uri.EscapeDataString(number)}",
            number,
            pdf,
            price);
    }

    public async Task<EcontStatusDto> GetStatusAsync(string shipmentNumber, CancellationToken ct = default)
    {
        var connection = await couriers.GetEcontConnectionAsync(ct);
        if (string.IsNullOrWhiteSpace(connection.Username) || string.IsNullOrWhiteSpace(connection.Password))
            throw new InvalidOperationException("Няма връзка с Еконт. Попълни потребител и парола в Куриери.");

        var json = await PostAsync(
            connection,
            "Shipments/ShipmentService.getShipmentStatuses.json",
            new { shipmentNumbers = new[] { shipmentNumber } },
            ct);

        if (!json.TryGetProperty("shipmentStatuses", out var list) || list.ValueKind != JsonValueKind.Array)
            throw new InvalidOperationException(ReadError(json) ?? "Еконт не върна статус.");

        var first = list.EnumerateArray().FirstOrDefault();
        if (first.ValueKind != JsonValueKind.Object || !first.TryGetProperty("status", out var status))
            throw new InvalidOperationException(ReadError(first) ?? "Еконт не върна статус за тази товарителница.");
        var events = new List<EcontStatusEventDto>();
        if (status.TryGetProperty("trackingEvents", out var tracking) && tracking.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in tracking.EnumerateArray())
            {
                var place = Text(item, "destinationDetails");
                var name = Text(item, "event");
                var eventLabel = string.IsNullOrWhiteSpace(name)
                    ? place ?? ""
                    : string.IsNullOrWhiteSpace(place) ? name : $"{name} — {place}";
                if (string.IsNullOrWhiteSpace(eventLabel) && string.IsNullOrWhiteSpace(Text(item, "time")))
                    continue;
                events.Add(new EcontStatusEventDto(Text(item, "time") ?? "", eventLabel, place));
            }
        }

        var label = Text(status, "shortDeliveryStatus") ?? Text(status, "shortDeliveryStatusEn") ?? "Няма статус";
        return new EcontStatusDto(label, Text(status, "shortDeliveryStatusEn"), events);
    }

    public async Task<(byte[] Bytes, string ContentType)> DownloadLabelAsync(string labelUrl, CancellationToken ct = default)
    {
        if (!Uri.TryCreate(labelUrl, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))
            throw new InvalidOperationException("Еконт не върна стикер за тази товарителница.");

        var client = httpFactory.CreateClient("couriers");
        using var response = await client.GetAsync(uri, ct);
        if (response.StatusCode is System.Net.HttpStatusCode.Unauthorized or System.Net.HttpStatusCode.Forbidden)
        {
            var connection = await couriers.GetEcontConnectionAsync(ct);
            using var authed = new HttpRequestMessage(HttpMethod.Get, uri);
            if (!string.IsNullOrWhiteSpace(connection.Username))
            {
                authed.Headers.Authorization = new AuthenticationHeaderValue(
                    "Basic",
                    Convert.ToBase64String(Encoding.UTF8.GetBytes($"{connection.Username}:{connection.Password}")));
            }
            using var retry = await client.SendAsync(authed, ct);
            if (!retry.IsSuccessStatusCode)
                throw new InvalidOperationException("Стикерът от Еконт не можа да се изтегли.");
            return (await retry.Content.ReadAsByteArrayAsync(ct), ContentType(retry));
        }
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("Стикерът от Еконт не можа да се изтегли.");
        return (await response.Content.ReadAsByteArrayAsync(ct), ContentType(response));
    }

    static string ContentType(HttpResponseMessage response)
    {
        var type = response.Content.Headers.ContentType?.MediaType ?? "application/pdf";
        return type.Contains("pdf", StringComparison.OrdinalIgnoreCase) ? "application/pdf" : type;
    }

    public static bool IsDelivered(EcontStatusDto status)
    {
        var text = $"{status.Status} {status.StatusEn}".ToLowerInvariant();
        return text.Contains("доставен") || text.Contains("delivered");
    }

    async Task<Dictionary<string, object?>> BuildLabelAsync(
        Order order,
        CourierQuoteContext context,
        CreateWaybillRequest request,
        decimal? cod,
        bool builtInDemo,
        string purpose,
        CancellationToken ct)
    {
        var account = context.Econt;
        var sender = context.Sender;
        var returning = purpose == "return";
        var country = string.IsNullOrWhiteSpace(order.ShippingCountry) ? "BG" : order.ShippingCountry;
        var iso3 = await locations.ToIso3Async(country, ct);
        var senderIso3 = await locations.ToIso3Async(string.IsNullOrWhiteSpace(sender.Country) ? "BG" : sender.Country, ct);
        var (street, num) = SplitStreet(order.ShippingStreet);
        var senderStreetSource = First(sender.Street, builtInDemo ? CourierService.EcontDemoSenderStreet : "");
        var (senderStreet, senderNum) = SplitStreet(senderStreetSource);
        if (builtInDemo && string.IsNullOrWhiteSpace(sender.Street))
            senderNum = CourierService.EcontDemoSenderNum;
        var phone = First(order.ShippingPhone, order.Phone);
        var delivery = order.ShippingDelivery?.Trim().ToLowerInvariant();
        var office = order.ShippingOfficeCode?.Trim();
        var shopName = First(sender.ContactName, sender.Company, "PlantyHub");
        var shopPhone = First(sender.Phone, builtInDemo ? CourierService.EcontDemoSenderPhone : "");
        var customerName = First(order.ShippingName, order.CustomerName);
        var shopCity = First(sender.City, builtInDemo ? CourierService.EcontDemoSenderCity : "");
        var shopPost = First(sender.PostalCode, builtInDemo ? CourierService.EcontDemoSenderPost : "");

        var label = new Dictionary<string, object?>
        {
            ["senderClient"] = new
            {
                name = returning ? customerName : shopName,
                phones = new[] { returning ? phone : shopPhone },
            },
            ["receiverClient"] = new
            {
                name = returning ? shopName : customerName,
                phones = new[] { returning ? shopPhone : phone },
            },
            ["packCount"] = Math.Max(1, request.Packages),
            ["shipmentType"] = "PACK",
            ["weight"] = request.WeightKg > 0 ? request.WeightKg : account.DefaultWeightKg,
            ["shipmentDescription"] = returning
                ? First(request.Notes, "Връщане по рекламация")
                : First(account.Contents, request.Notes, "Поръчка PlantyHub"),
            ["orderNumber"] = order.Id,
        };

        if (returning)
        {
            if (delivery == "office" && !string.IsNullOrWhiteSpace(office))
                label["senderOfficeCode"] = office;
            else
                label["senderAddress"] = Address(iso3, order.ShippingCity, order.ShippingPostalCode, street, num);

            if (!string.IsNullOrWhiteSpace(account.OfficeCode))
                label["receiverOfficeCode"] = account.OfficeCode;
            else
                label["receiverAddress"] = Address(senderIso3, shopCity, shopPost, senderStreet, senderNum);
        }
        else if (!string.IsNullOrWhiteSpace(account.OfficeCode))
            label["senderOfficeCode"] = account.OfficeCode;
        else
            label["senderAddress"] = Address(senderIso3, shopCity, shopPost, senderStreet, senderNum);

        if (!returning)
        {
            if (delivery == "office" && !string.IsNullOrWhiteSpace(office))
                label["receiverOfficeCode"] = office;
            else
                label["receiverAddress"] = Address(iso3, order.ShippingCity, order.ShippingPostalCode, street, num);
        }

        if (cod is > 0)
        {
            label["services"] = new
            {
                cdAmount = cod.Value,
                cdCurrency = "EUR",
                cdType = "get",
            };
            label["payAfterAccept"] = true;
        }

        return label;
    }

    static bool SenderReady(CourierQuoteContext context) =>
        !string.IsNullOrWhiteSpace(context.Econt.OfficeCode)
        || (!string.IsNullOrWhiteSpace(context.Sender.City) && !string.IsNullOrWhiteSpace(context.Sender.Street));

    static List<EcontCheckIssueDto> LocalIssues(Order order, decimal? cod, string purpose)
    {
        var issues = new List<EcontCheckIssueDto>();
        var country = (string.IsNullOrWhiteSpace(order.ShippingCountry) ? order.Country : order.ShippingCountry).ToUpperInvariant();
        var phone = First(order.ShippingPhone, order.Phone);
        var delivery = order.ShippingDelivery?.Trim().ToLowerInvariant();
        var office = !string.IsNullOrWhiteSpace(order.ShippingOfficeCode);

        if (country == "BG" && !IsBulgarianPhone(phone))
            issues.Add(new EcontCheckIssueDto("bgPhone", "error", string.IsNullOrWhiteSpace(phone) ? null : phone.Trim()));
        if (delivery == "office" && !office)
            issues.Add(new EcontCheckIssueDto("office", "error", null));
        if (delivery != "office")
        {
            if (string.IsNullOrWhiteSpace(order.ShippingCity))
                issues.Add(new EcontCheckIssueDto("city", "error", null));
            if (string.IsNullOrWhiteSpace(order.ShippingStreet))
                issues.Add(new EcontCheckIssueDto("street", "error", null));
        }
        if (country == "BG")
        {
            if (!string.IsNullOrWhiteSpace(order.ShippingCity) && !HasCyrillic(order.ShippingCity))
                issues.Add(new EcontCheckIssueDto("bgCity", "warning", null));
            if (!string.IsNullOrWhiteSpace(order.ShippingStreet) && !HasCyrillic(order.ShippingStreet))
                issues.Add(new EcontCheckIssueDto("bgStreet", "warning", null));
            var name = First(order.ShippingName, order.CustomerName);
            if (!string.IsNullOrWhiteSpace(name) && !HasCyrillic(name))
                issues.Add(new EcontCheckIssueDto("bgName", "warning", null));
        }
        if (purpose == "shipment" && order.PaymentMethod == PaymentMethod.Cod && cod is not > 0)
            issues.Add(new EcontCheckIssueDto("codAmount", "error", null));
        return issues;
    }

    static decimal? CodAmount(Order order, string purpose) =>
        purpose == "shipment" && order.PaymentMethod == PaymentMethod.Cod && order.Total > 0 ? order.Total : null;

    static bool IsBulgarianPhone(string phone)
    {
        var digits = Regex.Replace(phone, @"\D", "");
        if (digits.StartsWith("00359", StringComparison.Ordinal)) digits = digits[5..];
        else if (digits.StartsWith("359", StringComparison.Ordinal)) digits = digits[3..];
        else if (digits.StartsWith('0')) digits = digits[1..];
        return digits.Length is 8 or 9 && digits[0] is >= '2' and <= '9';
    }

    static bool HasCyrillic(string value) => value.Any(c => c is >= '\u0400' and <= '\u04FF');

    static object Address(string iso3, string city, string postCode, string street, string num) => new
    {
        city = new { name = city, postCode, country = new { code3 = iso3 } },
        street,
        num,
    };

    async Task<JsonElement> PostAsync(EcontApiConnection connection, string path, object body, CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{connection.Root.TrimEnd('/')}/{path}");
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{connection.Username}:{connection.Password}")));
        request.Content = JsonContent.Create(body);
        using var response = await httpFactory.CreateClient("couriers").SendAsync(request, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        JsonElement root;
        try
        {
            using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
            root = doc.RootElement.Clone();
        }
        catch
        {
            throw new InvalidOperationException(Trim(text, 240));
        }

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(ReadError(root) ?? Trim(text, 240));
        return root;
    }

    static bool HasPrice(JsonElement root) => Money(root, "label", "totalPrice") is not null;

    static string? ReadError(JsonElement root)
    {
        if (root.ValueKind != JsonValueKind.Object) return null;
        var lines = FlattenErrors(root);
        var text = string.Join(" ", lines.Where(line => !string.IsNullOrWhiteSpace(line)).Distinct());
        return string.IsNullOrWhiteSpace(text) ? null : FixBulgarian(text);
    }

    static List<string> FlattenErrors(JsonElement el)
    {
        if (el.ValueKind != JsonValueKind.Object) return [];
        var own = el.TryGetProperty("message", out var message) && message.ValueKind == JsonValueKind.String
            ? message.GetString()?.Trim() ?? ""
            : "";
        var children = new List<string>();
        if (el.TryGetProperty("innerErrors", out var inner) && inner.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in inner.EnumerateArray())
                children.AddRange(FlattenErrors(item));
        }
        if (el.TryGetProperty("error", out var error) && error.ValueKind == JsonValueKind.Object)
            children.AddRange(FlattenErrors(error));

        if (string.IsNullOrWhiteSpace(own)) return children;
        if (own.EndsWith(':') && children.Count > 0)
            return children.Select(child => $"{own} {child}").ToList();
        if (children.Count == 0) return [own];
        return [own, .. children];
    }

    static string FixBulgarian(string value) =>
        value.Replace("Невалиднo", "Невалидно", StringComparison.Ordinal)
            .Replace("невалиднo", "невалидно", StringComparison.Ordinal);

    static (string Street, string Num) SplitStreet(string value)
    {
        var trimmed = value.Trim();
        if (string.IsNullOrWhiteSpace(trimmed)) return ("", "");
        var parts = trimmed.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length >= 2 && parts[^1].Any(char.IsDigit))
            return (string.Join(' ', parts[..^1]), parts[^1]);
        return (trimmed, "1");
    }

    static string First(params string?[] values) =>
        values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? "";

    static string Trim(string value, int max) =>
        string.IsNullOrWhiteSpace(value) ? "Еконт не върна отговор." : value.Length <= max ? value : value[..max];

    static decimal? Money(JsonElement el, params string[] path)
    {
        var current = el;
        foreach (var key in path)
        {
            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(key, out current))
                return null;
        }
        return current.ValueKind switch
        {
            JsonValueKind.Number => current.GetDecimal(),
            JsonValueKind.String when decimal.TryParse(current.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var n) => n,
            _ => null,
        };
    }

    static string? Text(JsonElement el, params string[] path)
    {
        var current = el;
        foreach (var key in path)
        {
            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(key, out current))
                return null;
        }
        return current.ValueKind == JsonValueKind.String ? current.GetString() : null;
    }
}
