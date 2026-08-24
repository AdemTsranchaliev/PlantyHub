using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class CourierRateService(
    CourierService couriers,
    CourierLocationService locations,
    IHttpClientFactory httpFactory,
    ILogger<CourierRateService> logger)
{
    const decimal BgnPerEur = 1.95583m;

    public async Task<IReadOnlyList<ShippingQuoteDto>> QuoteAsync(ShippingQuoteRequest request, CancellationToken ct)
    {
        var context = await couriers.GetQuoteContextAsync(ct);
        var weight = request.WeightKg is > 0 ? request.WeightKg.Value : 1.5m;
        var courier = request.Courier?.Trim().ToLowerInvariant();
        var tasks = new List<Task<ShippingQuoteDto?>>();
        if (QuoteRequested(courier, "econt"))
        {
            tasks.Add(SafeQuote(() => QuoteEcontAsync(context, request, "address", weight, ct), ct));
            tasks.Add(SafeQuote(() => QuoteEcontAsync(context, request, "office", weight, ct), ct));
        }
        if (QuoteRequested(courier, "speedy"))
        {
            tasks.Add(SafeQuote(() => QuoteSpeedyAsync(context, request, "address", weight, ct), ct));
            tasks.Add(SafeQuote(() => QuoteSpeedyAsync(context, request, "office", weight, ct), ct));
        }
        if (QuoteRequested(courier, "dhl"))
            tasks.Add(SafeQuote(() => QuoteDhlAsync(context, request, weight, ct), ct));
        if (QuoteRequested(courier, "boxnow"))
            tasks.Add(SafeQuote(() => QuoteBoxNowAsync(context, request, ct), ct));
        var quotes = await Task.WhenAll(tasks);
        var items = quotes.Where(q => q is not null).Cast<ShippingQuoteDto>();
        if (!request.IncludeUnavailable)
        {
            items = items.Where(q => string.IsNullOrWhiteSpace(q.Message) && q.PriceEur >= 0);
        }
        return items
            .OrderBy(q => string.IsNullOrWhiteSpace(q.Message) ? 0 : 1)
            .ThenBy(q => q.PriceEur)
            .ToList();
    }

    async Task<ShippingQuoteDto?> SafeQuote(Func<Task<ShippingQuoteDto?>> run, CancellationToken ct)
    {
        try
        {
            return await run();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Shipping quote failed");
            _ = ct;
            return null;
        }
    }

    async Task<ShippingQuoteDto?> QuoteEcontAsync(
        CourierQuoteContext context,
        ShippingQuoteRequest request,
        string delivery,
        decimal weight,
        CancellationToken ct)
    {
        var account = context.Econt;
        if (!account.Enabled || !account.Configured) return Unavailable("econt", delivery, "needsCredentials");

        var sender = context.Sender;
        var (street, num) = SplitStreet(string.IsNullOrWhiteSpace(request.Street) ? "ул. 1" : request.Street);
        var (senderStreet, senderNum) = SplitStreet(string.IsNullOrWhiteSpace(sender.Street) ? "ул. 1" : sender.Street);
        var iso3 = await locations.ToIso3Async(request.Country, ct);
        var senderIso3 = await locations.ToIso3Async(sender.Country, ct);

        object? receiverOffice = null;
        object? receiverAddress = null;
        string? officeCode = request.OfficeCode;
        if (delivery == "office")
        {
            officeCode = await ResolveOfficeAsync(CourierId.Econt, request, officeCode, ct);
            if (string.IsNullOrWhiteSpace(officeCode))
                return Unavailable("econt", "office", "needsOffice");
            receiverOffice = officeCode;
        }
        else
        {
            object city = int.TryParse(request.CityId, out var cityId)
                ? new { id = cityId, name = request.City, postCode = request.PostalCode, country = new { code3 = iso3 } }
                : new { name = request.City, postCode = request.PostalCode, country = new { code3 = iso3 } };
            receiverAddress = new
            {
                city,
                street,
                num,
            };
        }

        var label = new Dictionary<string, object?>
        {
            ["senderClient"] = new { name = First(sender.ContactName, sender.Company, "PlantyHub"), phones = new[] { First(sender.Phone, "0888000000") } },
            ["receiverClient"] = new { name = "Клиент", phones = new[] { "0888000000" } },
            ["packCount"] = 1,
            ["shipmentType"] = "PACK",
            ["weight"] = weight,
            ["shipmentDescription"] = First(account.Contents, "градина / семена"),
        };
        if (!string.IsNullOrWhiteSpace(account.OfficeCode))
            label["senderOfficeCode"] = account.OfficeCode;
        else
            label["senderAddress"] = new
            {
                city = new { name = sender.City, postCode = sender.PostalCode, country = new { code3 = senderIso3 } },
                street = senderStreet,
                num = senderNum,
            };
        if (receiverOffice is not null) label["receiverOfficeCode"] = receiverOffice;
        if (receiverAddress is not null) label["receiverAddress"] = receiverAddress;

        var root = string.IsNullOrWhiteSpace(account.ApiUrl)
            ? (account.TestMode ? "https://demo.econt.com/ee/services" : "https://ee.econt.com/services")
            : account.ApiUrl.TrimEnd('/');
        var json = await PostAuthenticatedJsonAsync(
            $"{root}/Shipments/LabelService.createLabel.json",
            account.Username,
            account.Password,
            new { mode = "calculate", label },
            ct);

        var price = Money(json, "label", "totalPrice") ?? Money(json, "label", "senderDueAmount");
        var currency = Text(json, "label", "currency") ?? "BGN";
        if (price is null) return Unavailable("econt", delivery, "quoteFailed");
        return Quote("econt", delivery, officeCode, price.Value, currency);
    }

    async Task<ShippingQuoteDto?> QuoteSpeedyAsync(
        CourierQuoteContext context,
        ShippingQuoteRequest request,
        string delivery,
        decimal weight,
        CancellationToken ct)
    {
        var account = context.Speedy;
        if (!account.Enabled || !account.Configured) return Unavailable("speedy", delivery, "needsCredentials");

        var countryId = await SpeedyCountryIdAsync(request.Country, ct);
        if (countryId is null) return Unavailable("speedy", delivery, "quoteFailed");
        var sender = new Dictionary<string, object?>();
        if (int.TryParse(account.OfficeCode, out var dropoffId))
            sender["dropoffOfficeId"] = dropoffId;
        if (long.TryParse(account.ClientId, out var clientId))
            sender["clientId"] = clientId;

        var recipient = new Dictionary<string, object?> { ["privatePerson"] = true };
        string? officeCode = request.OfficeCode;
        if (delivery == "office")
        {
            officeCode = await ResolveOfficeAsync(CourierId.Speedy, request, officeCode, ct);
            if (!int.TryParse(officeCode, out var pickupId))
                return Unavailable("speedy", "office", "needsOffice");
            recipient["pickupOfficeId"] = pickupId;
        }
        else
        {
            var siteId = await ResolveSpeedySiteIdAsync(request, countryId.Value, ct);
            recipient["addressLocation"] = siteId is int site
                ? new { countryId = countryId.Value, siteId = site, postCode = request.PostalCode }
                : new { countryId = countryId.Value, siteName = request.City, postCode = request.PostalCode };
        }

        var serviceIds = new List<int>();
        if (int.TryParse(account.ServiceType, out var serviceId))
            serviceIds.Add(serviceId);
        else
            serviceIds.Add(505);

        var body = new Dictionary<string, object?>
        {
            ["userName"] = account.Username,
            ["password"] = account.Password,
            ["language"] = "BG",
            ["sender"] = sender,
            ["recipient"] = recipient,
            ["service"] = new { autoAdjustPickupDate = true, serviceIds },
            ["content"] = new
            {
                parcelsCount = Math.Max(1, account.DefaultPackages),
                totalWeight = weight,
                contents = First(account.Contents, "градина"),
                package = "BOX",
            },
            ["payment"] = new { courierServicePayer = account.Payer == "receiver" ? "RECIPIENT" : "SENDER" },
        };

        var baseUrl = string.IsNullOrWhiteSpace(account.ApiUrl) ? "https://api.speedy.bg/v1" : account.ApiUrl.TrimEnd('/');
        var json = await PostJsonAsync($"{baseUrl}/calculate", body, ct);
        var calculations = ArrayProp(json, "calculations");
        decimal? best = null;
        string currency = "BGN";
        foreach (var calc in calculations)
        {
            if (calc.TryGetProperty("error", out var err) && err.ValueKind is JsonValueKind.Object)
                continue;
            var priceEl = calc.TryGetProperty("price", out var p) ? p : default;
            var total = Money(priceEl, "total") ?? Money(priceEl, "amount");
            if (total is null) continue;
            var curr = Text(priceEl, "currency") ?? currency;
            if (best is null || ToEuro(total.Value, curr) < ToEuro(best.Value, currency))
            {
                best = total;
                currency = curr;
            }
        }
        if (best is null) return Unavailable("speedy", delivery, "quoteFailed");
        return Quote("speedy", delivery, officeCode, best.Value, currency);
    }

    async Task<ShippingQuoteDto?> QuoteDhlAsync(CourierQuoteContext context, ShippingQuoteRequest request, decimal weight, CancellationToken ct)
    {
        var account = context.Dhl;
        if (!account.Enabled || !account.Configured) return Unavailable("dhl", "address", "needsCredentials");

        var sender = context.Sender;
        var origin = await locations.ToIso2Async(string.IsNullOrWhiteSpace(sender.Country) ? "BG" : sender.Country, ct);
        var dest = await locations.ToIso2Async(request.Country, ct);
        var date = NextShipDate();
        var root = string.IsNullOrWhiteSpace(account.ApiUrl)
            ? (account.TestMode ? "https://express.api.dhl.com/mydhlapi/test" : "https://express.api.dhl.com/mydhlapi")
            : account.ApiUrl.TrimEnd('/');

        var query = new StringBuilder($"{root}/rates?")
            .Append("accountNumber=").Append(Uri.EscapeDataString(First(account.AccountNumber, account.SiteId)))
            .Append("&originCountryCode=").Append(Uri.EscapeDataString(origin))
            .Append("&originCityName=").Append(Uri.EscapeDataString(First(sender.City, "Sofia")))
            .Append("&originPostalCode=").Append(Uri.EscapeDataString(sender.PostalCode))
            .Append("&destinationCountryCode=").Append(Uri.EscapeDataString(dest))
            .Append("&destinationCityName=").Append(Uri.EscapeDataString(request.City))
            .Append("&destinationPostalCode=").Append(Uri.EscapeDataString(request.PostalCode))
            .Append("&weight=").Append(weight.ToString("0.###", CultureInfo.InvariantCulture))
            .Append("&length=40&width=30&height=20")
            .Append("&plannedShippingDate=").Append(date)
            .Append("&isCustomsDeclarable=").Append(dest == "BG" ? "false" : "true")
            .Append("&unitOfMeasurement=metric&nextBusinessDay=true");

        var user = First(account.SiteId, account.Username);
        using var http = new HttpRequestMessage(HttpMethod.Get, query.ToString());
        var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{user}:{account.Password}"));
        http.Headers.Authorization = new AuthenticationHeaderValue("Basic", token);
        http.Headers.TryAddWithoutValidation("Message-Reference", Guid.NewGuid().ToString("N"));
        var response = await Client().SendAsync(http, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            return Unavailable("dhl", "address", "quoteFailed");

        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        decimal? best = null;
        var currency = "EUR";
        foreach (var product in ArrayProp(doc.RootElement, "products"))
        {
            var prices = product.TryGetProperty("totalPrice", out var tp) && tp.ValueKind == JsonValueKind.Array
                ? tp.EnumerateArray()
                : Enumerable.Empty<JsonElement>();
            foreach (var price in prices)
            {
                var amount = Money(price, "price") ?? Money(price, "priceAfterTax");
                if (amount is null) continue;
                var curr = Text(price, "priceCurrency") ?? currency;
                if (best is null || ToEuro(amount.Value, curr) < ToEuro(best.Value, currency))
                {
                    best = amount;
                    currency = curr;
                }
            }
        }
        if (best is null) return Unavailable("dhl", "address", "quoteFailed");
        return Quote("dhl", "address", null, best.Value, currency);
    }

    async Task<ShippingQuoteDto?> QuoteBoxNowAsync(CourierQuoteContext context, ShippingQuoteRequest request, CancellationToken ct)
    {
        if (!context.BoxNow.Enabled) return null;
        var dest = await locations.ToIso2Async(request.Country, ct);
        if (!dest.Equals("BG", StringComparison.OrdinalIgnoreCase))
            return Unavailable("boxnow", "locker", "quoteFailed");

        var offices = await locations.GetOfficesAsync(CourierId.Boxnow, "BG", request.CityId, request.City, false, ct);
        if (offices.Items.Count == 0)
            return Unavailable("boxnow", "locker", "needsOffice");

        var officeCode = request.OfficeCode?.Trim();
        if (string.IsNullOrWhiteSpace(officeCode)
            || !offices.Items.Any(o => o.Id.Equals(officeCode, StringComparison.OrdinalIgnoreCase)
                || o.Code.Equals(officeCode, StringComparison.OrdinalIgnoreCase)))
        {
            officeCode = offices.Items[0].Code;
        }

        // Official BOX NOW Address → APM list price (VAT included).
        return Quote("boxnow", "locker", officeCode, 2.04m, "EUR");
    }

    async Task<string?> ResolveOfficeAsync(CourierId courier, ShippingQuoteRequest request, string? officeCode, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(officeCode)) return officeCode.Trim();
        var countryId = await CourierCountryIdAsync(courier, request.Country, ct);
        if (string.IsNullOrWhiteSpace(countryId)) return null;
        var cityId = courier == CourierId.Econt
            && !OnlyCourier(request.Courier, "speedy")
            && !OnlyCourier(request.Courier, "dhl")
            && !OnlyCourier(request.Courier, "boxnow")
            ? request.CityId
            : null;
        if (courier == CourierId.Speedy)
        {
            if (OnlyCourier(request.Courier, "speedy") && !string.IsNullOrWhiteSpace(request.CityId))
                cityId = request.CityId;
            else if (int.TryParse(countryId, out var speedyCountryId))
                cityId = (await ResolveSpeedySiteIdAsync(request, speedyCountryId, ct))?.ToString();
        }
        var offices = await locations.GetOfficesAsync(courier, countryId, cityId, request.City, false, ct);
        return offices.Items.FirstOrDefault()?.Code ?? offices.Items.FirstOrDefault()?.Id;
    }

    async Task<int?> ResolveSpeedySiteIdAsync(ShippingQuoteRequest request, int countryId, CancellationToken ct)
    {
        if (OnlyCourier(request.Courier, "speedy") && int.TryParse(request.CityId, out var selected) && selected > 0)
            return selected;
        var cities = await locations.GetCitiesAsync(CourierId.Speedy, countryId.ToString(), false, ct);
        var city = request.City.Trim();
        var postal = request.PostalCode.Trim();
        var match = cities.Items.FirstOrDefault(item =>
                NamesMatch(item.Name, city) || NamesMatch(item.NameEn, city))
            ?? cities.Items.FirstOrDefault(item =>
                !string.IsNullOrWhiteSpace(postal) && item.Code.Equals(postal, StringComparison.OrdinalIgnoreCase));
        return int.TryParse(match?.Id, out var id) ? id : null;
    }

    async Task<string?> CourierCountryIdAsync(CourierId courier, string iso2, CancellationToken ct)
    {
        var countries = await locations.GetCountriesAsync(courier, false, ct);
        var code = iso2.Trim().ToUpperInvariant();
        return countries.Items.FirstOrDefault(item =>
            item.Code.Equals(code, StringComparison.OrdinalIgnoreCase)
            || item.Id.Equals(code, StringComparison.OrdinalIgnoreCase)
            || (code == "BG" && (item.Id is "BGR" or "100")))?.Id;
    }

    async Task<int?> SpeedyCountryIdAsync(string iso2, CancellationToken ct)
    {
        var id = await CourierCountryIdAsync(CourierId.Speedy, iso2, ct);
        return int.TryParse(id, out var n) ? n : iso2.Equals("BG", StringComparison.OrdinalIgnoreCase) ? 100 : null;
    }

    async Task<JsonElement> PostAuthenticatedJsonAsync(string url, string user, string password, object body, CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{user}:{password}")));
        request.Content = JsonContent.Create(body);
        var response = await Client().SendAsync(request, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"HTTP {(int)response.StatusCode}: {Trim(text, 200)}");
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        return doc.RootElement.Clone();
    }

    async Task<JsonElement> PostJsonAsync(string url, object body, CancellationToken ct)
    {
        var response = await Client().PostAsJsonAsync(url, body, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"HTTP {(int)response.StatusCode}: {Trim(text, 200)}");
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        return doc.RootElement.Clone();
    }

    HttpClient Client() => httpFactory.CreateClient("couriers");

    static ShippingQuoteDto Quote(string courier, string delivery, string? office, decimal price, string currency) =>
        new($"{courier}-{delivery}", courier, delivery, office, price, currency.ToUpperInvariant(), ToEuro(price, currency), null);

    static ShippingQuoteDto Unavailable(string courier, string delivery, string message) =>
        new($"{courier}-{delivery}", courier, delivery, null, 0, "EUR", 0, message);

    static decimal ToEuro(decimal amount, string currency) => currency.ToUpperInvariant() switch
    {
        "BGN" => Math.Round(amount / BgnPerEur, 2, MidpointRounding.AwayFromZero),
        _ => Math.Round(amount, 2, MidpointRounding.AwayFromZero),
    };

    static (string Street, string Num) SplitStreet(string value)
    {
        var parts = value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length >= 2 && parts[^1].Any(char.IsDigit))
            return (string.Join(' ', parts[..^1]), parts[^1]);
        return (value.Trim(), "1");
    }

    static bool QuoteRequested(string? courier, string id) =>
        string.IsNullOrWhiteSpace(courier) || courier.Equals(id, StringComparison.OrdinalIgnoreCase);

    static bool OnlyCourier(string? courier, string id) =>
        !string.IsNullOrWhiteSpace(courier) && courier.Equals(id, StringComparison.OrdinalIgnoreCase);

    static bool NamesMatch(string? left, string right) =>
        !string.IsNullOrWhiteSpace(left)
        && left.Trim().Equals(right.Trim(), StringComparison.OrdinalIgnoreCase);

    static string First(params string?[] values) =>
        values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? "";

    static string NextShipDate()
    {
        var date = DateTime.UtcNow.Date;
        if (date.DayOfWeek is DayOfWeek.Saturday) date = date.AddDays(2);
        else if (date.DayOfWeek is DayOfWeek.Sunday) date = date.AddDays(1);
        return date.ToString("yyyy-MM-dd");
    }

    static IEnumerable<JsonElement> ArrayProp(JsonElement root, string name)
    {
        if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Array)
            return prop.EnumerateArray();
        return [];
    }

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
        return current.ValueKind == JsonValueKind.String ? current.GetString() : current.ToString();
    }

    static string Trim(string value, int max) => value.Length <= max ? value : value[..max];
}
