using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class CourierLocationService(
    AppDbContext db,
    IHttpClientFactory httpFactory,
    CourierService couriers,
    ILogger<CourierLocationService> logger)
{
    static readonly StringComparer BgComparer = StringComparer.Create(new CultureInfo("bg-BG"), ignoreCase: true);
    static readonly TimeSpan CacheTtl = TimeSpan.FromDays(7);

    static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public Task<CourierLocationListDto> GetCountriesAsync(CourierId courier, bool refresh, CancellationToken ct) =>
        GetCachedAsync(
            Key(courier, "countries-served"),
            refresh,
            () => FetchCountriesAsync(courier, ct),
            ct);

    public async Task<CourierLocationListDto> GetCitiesAsync(CourierId courier, string countryId, bool refresh, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(countryId))
            return EmptyPlaces("error", "countryRequired");
        return await GetCachedAsync(
            Key(courier, "cities", countryId.Trim()),
            refresh,
            () => FetchCitiesAsync(courier, countryId.Trim(), ct),
            ct);
    }

    public async Task<CourierPlaceDto?> FindCountryAsync(CourierId courier, string country, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(country)) return null;
        var countries = await GetCountriesAsync(courier, false, ct);
        var value = country.Trim();
        var match = countries.Items.FirstOrDefault(item =>
            item.Code.Equals(value, StringComparison.OrdinalIgnoreCase)
            || item.Id.Equals(value, StringComparison.OrdinalIgnoreCase));
        if (match is not null) return match;
        if (courier != CourierId.Econt) return null;
        var iso = await IsoCountriesAsync(ct);
        return iso.FirstOrDefault(item =>
            item.Code.Equals(value, StringComparison.OrdinalIgnoreCase)
            || item.Id.Equals(value, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<string> ToIso3Async(string country, CancellationToken ct)
    {
        var value = country.Trim().ToUpperInvariant();
        if (value.Length == 3 && value.All(char.IsAsciiLetter)) return value;
        var match = (await IsoCountriesAsync(ct)).FirstOrDefault(item =>
            item.Code.Equals(value, StringComparison.OrdinalIgnoreCase)
            || item.Id.Equals(value, StringComparison.OrdinalIgnoreCase));
        return string.IsNullOrWhiteSpace(match?.Id) ? value : match.Id.ToUpperInvariant();
    }

    public async Task<string> ToIso2Async(string country, CancellationToken ct)
    {
        var value = country.Trim().ToUpperInvariant();
        if (value.Length == 2 && value.All(char.IsAsciiLetter)) return value;
        var match = (await IsoCountriesAsync(ct)).FirstOrDefault(item =>
            item.Id.Equals(value, StringComparison.OrdinalIgnoreCase)
            || item.Code.Equals(value, StringComparison.OrdinalIgnoreCase));
        if (match is not null && match.Code.Length == 2)
            return match.Code.ToUpperInvariant();
        return value.Length >= 2 ? value[..2] : value;
    }

    async Task<IReadOnlyList<CourierPlaceDto>> IsoCountriesAsync(CancellationToken ct)
    {
        var list = await GetCachedAsync(
            Key(CourierId.Econt, "countries-iso"),
            false,
            async () => (await FetchEcontCountriesRawAsync(ct), "econt-api", null),
            ct);
        return list.Items;
    }

    public Task<CourierOfficeListDto> GetOfficesAsync(
        CourierId courier,
        string countryId,
        string? cityId,
        string? cityName,
        bool refresh,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(countryId))
            return Task.FromResult(EmptyOffices("error", "countryRequired"));

        var cityKey = !string.IsNullOrWhiteSpace(cityId) ? cityId.Trim()
            : !string.IsNullOrWhiteSpace(cityName) ? cityName.Trim()
            : "-";

        return GetCachedOfficesAsync(
            Key(courier, "offices", countryId.Trim(), cityKey),
            refresh,
            () => FetchOfficesAsync(courier, countryId.Trim(), cityId?.Trim(), cityName?.Trim(), ct),
            ct);
    }

    async Task<CourierLocationListDto> GetCachedAsync(
        string key,
        bool refresh,
        Func<Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)>> fetch,
        CancellationToken ct)
    {
        var row = await db.CourierLocationCache.FirstOrDefaultAsync(c => c.Key == key, ct);
        if (!refresh && row is not null && DateTime.UtcNow - row.FetchedAt < CacheTtl)
            return PlacesFromCache(row, "cache");

        try
        {
            var (items, source, message) = await fetch();
            if (items.Count > 0 && string.IsNullOrWhiteSpace(message))
            {
                try
                {
                    await SaveAsync(row, key, items, ct);
                }
                catch (DbUpdateException)
                {
                    // Another request cached the same key.
                }
            }
            var fetchedAt = items.Count > 0 ? DateTime.UtcNow : row?.FetchedAt;
            return new CourierLocationListDto(source, fetchedAt, message, items);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Courier location fetch failed for {Key}", key);
            if (row is not null)
                return PlacesFromCache(row, "cache", ex.Message);
            return EmptyPlaces("error", ex.Message);
        }
    }

    async Task<CourierOfficeListDto> GetCachedOfficesAsync(
        string key,
        bool refresh,
        Func<Task<(IReadOnlyList<CourierOfficeDto> Items, string Source, string? Message)>> fetch,
        CancellationToken ct)
    {
        var row = await db.CourierLocationCache.FirstOrDefaultAsync(c => c.Key == key, ct);
        if (!refresh && row is not null && DateTime.UtcNow - row.FetchedAt < CacheTtl)
            return OfficesFromCache(row, "cache");

        try
        {
            var (items, source, message) = await fetch();
            if (items.Count > 0 && string.IsNullOrWhiteSpace(message))
            {
                try
                {
                    await SaveAsync(row, key, items, ct);
                }
                catch (DbUpdateException)
                {
                    // Another request cached the same key.
                }
            }
            var fetchedAt = items.Count > 0 ? DateTime.UtcNow : row?.FetchedAt;
            return new CourierOfficeListDto(source, fetchedAt, message, items);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Courier office fetch failed for {Key}", key);
            if (row is not null)
                return OfficesFromCache(row, "cache", ex.Message);
            return EmptyOffices("error", ex.Message);
        }
    }

    async Task SaveAsync<T>(CourierLocationCache? row, string key, T data, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(data, JsonOptions);
        if (row is null)
        {
            db.CourierLocationCache.Add(new CourierLocationCache
            {
                Key = key,
                Json = json,
                FetchedAt = DateTime.UtcNow,
            });
        }
        else
        {
            row.Json = json;
            row.FetchedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
    }

    async Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)> FetchCountriesAsync(
        CourierId courier, CancellationToken ct) => courier switch
    {
        CourierId.Econt => (await FetchEcontCountriesAsync(ct), "econt-api", null),
        CourierId.Speedy => await FetchSpeedyCountriesAsync(ct),
        CourierId.Dhl => (DhlOfficialCountries(), "dhl-docs", null),
        CourierId.Boxnow => (BoxNowCountries(), "boxnow-api", null),
        _ => ([], "error", "loadFailed"),
    };

    async Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)> FetchCitiesAsync(
        CourierId courier, string countryId, CancellationToken ct) => courier switch
    {
        CourierId.Econt => (await FetchEcontCitiesAsync(countryId, ct), "econt-api", null),
        CourierId.Speedy => await FetchSpeedyCitiesAsync(countryId, ct),
        CourierId.Dhl => await FetchDhlCitiesAsync(countryId, ct),
        CourierId.Boxnow => await FetchBoxNowCitiesAsync(countryId, ct),
        _ => ([], "error", "loadFailed"),
    };

    async Task<(IReadOnlyList<CourierOfficeDto> Items, string Source, string? Message)> FetchOfficesAsync(
        CourierId courier, string countryId, string? cityId, string? cityName, CancellationToken ct) => courier switch
    {
        CourierId.Econt => (await FetchEcontOfficesAsync(countryId, cityId, ct), "econt-api", null),
        CourierId.Speedy => await FetchSpeedyOfficesAsync(countryId, cityId, ct),
        CourierId.Dhl => await FetchDhlOfficesAsync(countryId, cityName ?? cityId, ct),
        CourierId.Boxnow => await FetchBoxNowOfficesAsync(countryId, cityId, cityName, ct),
        _ => ([], "error", "loadFailed"),
    };

    async Task<IReadOnlyList<CourierPlaceDto>> FetchEcontCountriesRawAsync(CancellationToken ct)
    {
        var json = await PostEcontAsync("Nomenclatures/NomenclaturesService.getCountries.json", new { }, ct);
        return ArrayProp(json, "countries")
            .Select(el => new CourierPlaceDto(
                Text(el, "code3") ?? Text(el, "code2") ?? "",
                Text(el, "code2") ?? Text(el, "code3") ?? "",
                Text(el, "name") ?? Text(el, "nameEn") ?? "",
                Text(el, "nameEn")))
            .Where(p => p.Id.Length > 0)
            .OrderBy(p => p.Name, BgComparer)
            .ToList();
    }

    async Task<IReadOnlyList<CourierPlaceDto>> FetchEcontCountriesAsync(CancellationToken ct)
    {
        var raw = await FetchEcontCountriesRawAsync(ct);
        var bulgaria = raw.Where(p => p.Code is "BG" || p.Id is "BGR").ToList();
        var creds = await couriers.GetCredentialsAsync(CourierId.Econt, ct);
        if (string.IsNullOrWhiteSpace(creds.Username) || string.IsNullOrWhiteSpace(creds.Password))
            return bulgaria;

        var served = new System.Collections.Concurrent.ConcurrentBag<CourierPlaceDto>(bulgaria);
        using var gate = new SemaphoreSlim(6);
        await Task.WhenAll(raw
            .Where(p => p.Code is not "BG" && p.Id is not "BGR")
            .Select(async country =>
            {
                await gate.WaitAsync(ct);
                try
                {
                    var cities = await FetchEcontCitiesAsync(country.Id, ct);
                    if (cities.Count > 0)
                        served.Add(country);
                }
                catch (Exception ex)
                {
                    logger.LogDebug(ex, "Econt has no cities for {Country}", country.Id);
                }
                finally
                {
                    gate.Release();
                }
            }));

        var items = served
            .DistinctBy(p => p.Id)
            .OrderBy(p => p.Name, BgComparer)
            .ToList();
        return items.Count > 0 ? items : bulgaria;
    }

    async Task<IReadOnlyList<CourierPlaceDto>> FetchEcontCitiesAsync(string countryCode, CancellationToken ct)
    {
        var json = await PostEcontAsync("Nomenclatures/NomenclaturesService.getCities.json", new { countryCode }, ct);
        return ArrayProp(json, "cities")
            .Select(el => new CourierPlaceDto(
                Text(el, "id") ?? "",
                Text(el, "postCode") ?? "",
                Text(el, "name") ?? Text(el, "nameEn") ?? "",
                Text(el, "nameEn")))
            .Where(p => p.Id.Length > 0)
            .OrderBy(p => p.Name, BgComparer)
            .ToList();
    }

    async Task<IReadOnlyList<CourierOfficeDto>> FetchEcontOfficesAsync(string countryCode, string? cityId, CancellationToken ct)
    {
        object body = int.TryParse(cityId, out var cityNum)
            ? new { countryCode, cityID = cityNum }
            : new { countryCode };
        var json = await PostEcontAsync("Nomenclatures/NomenclaturesService.getOffices.json", body, ct);
        return ArrayProp(json, "offices")
            .Select(el =>
            {
                var code = Text(el, "code") ?? Text(el, "id") ?? "";
                var address = el.TryGetProperty("address", out var addr) ? addr : default;
                var city = address.ValueKind == JsonValueKind.Object && address.TryGetProperty("city", out var c) ? c : default;
                var cityName = Text(city, "name") ?? Text(city, "nameEn");
                var fullAddress = Text(address, "fullAddress")
                    ?? Text(address, "street")
                    ?? Text(el, "address");
                return new CourierOfficeDto(
                    code,
                    code,
                    Text(el, "name") ?? Text(el, "nameEn") ?? code,
                    Text(el, "nameEn"),
                    Text(city, "id") ?? cityId,
                    cityName,
                    fullAddress);
            })
            .Where(o => o.Id.Length > 0)
            .OrderBy(o => o.Name, BgComparer)
            .ToList();
    }

    async Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)> FetchSpeedyCountriesAsync(CancellationToken ct)
    {
        var creds = await SpeedyCredsOrMessageAsync(ct);
        if (creds.Message is not null)
            return ([], "speedy-api", creds.Message);

        var csv = await PostSpeedyTextAsync($"{creds.BaseUrl}/location/country/csv", new
        {
            userName = creds.Username,
            password = creds.Password,
            language = "BG",
        }, ct);

        var rows = ParseCsv(csv);
        if (rows.Count == 0)
            return ([], "speedy-api", null);

        var header = rows[0];
        var hasHeader = header.Length > 0 && header[0].Equals("id", StringComparison.OrdinalIgnoreCase);
        var data = hasHeader ? rows.Skip(1) : rows.AsEnumerable();
        int Col(string name, int fallback)
        {
            if (!hasHeader) return fallback;
            var index = Array.FindIndex(header, h => h.Equals(name, StringComparison.OrdinalIgnoreCase));
            return index >= 0 ? index : fallback;
        }
        var idIdx = Col("id", 0);
        var nameIdx = Col("name", 1);
        var nameEnIdx = Col("nameEn", 2);
        var iso2Idx = Col("isoAlpha2", 3);
        var nomenIdx = Col("siteNomen", hasHeader ? header.Length - 1 : -1);

        var parsed = data
            .Where(r => r.Length > Math.Max(idIdx, Math.Max(nameIdx, iso2Idx)))
            .Select(r =>
            {
                var nomen = nomenIdx >= 0 && nomenIdx < r.Length && int.TryParse(r[nomenIdx].Trim(), out var n) ? n : -1;
                return (
                    Place: new CourierPlaceDto(
                        r[idIdx].Trim(),
                        iso2Idx < r.Length ? r[iso2Idx].Trim() : "",
                        r[nameIdx].Trim(),
                        nameEnIdx < r.Length ? EmptyToNull(r[nameEnIdx].Trim()) : null),
                    SiteNomen: nomen);
            })
            .Where(x => x.Place.Id.Length > 0)
            .ToList();

        var served = parsed
            .Where(x => x.SiteNomen is 1 or 2)
            .Select(x => x.Place)
            .OrderBy(p => p.Name, BgComparer)
            .ToList();
        if (served.Count == 0)
        {
            served = parsed
                .Select(x => x.Place)
                .Where(p => p.Code.Length == 2)
                .OrderBy(p => p.Name, BgComparer)
                .ToList();
        }
        return (served, "speedy-api", null);
    }

    async Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)> FetchSpeedyCitiesAsync(string countryId, CancellationToken ct)
    {
        var creds = await SpeedyCredsOrMessageAsync(ct);
        if (creds.Message is not null)
            return ([], "speedy-api", creds.Message);

        var csv = await PostSpeedyTextAsync($"{creds.BaseUrl}/location/site/csv/{Uri.EscapeDataString(countryId)}", new
        {
            userName = creds.Username,
            password = creds.Password,
            language = "BG",
        }, ct);

        var items = ParseCsv(csv)
            .SkipWhile(r => r.Length > 0 && r[0].Equals("id", StringComparison.OrdinalIgnoreCase))
            .Where(r => r.Length >= 7)
            .Select(r => new CourierPlaceDto(
                r[0].Trim(),
                r.Length > 11 ? r[11].Trim() : "",
                r[5].Trim(),
                EmptyToNull(r[6].Trim())))
            .Where(p => p.Id.Length > 0)
            .OrderBy(p => p.Name, BgComparer)
            .ToList();
        return (items, "speedy-api", null);
    }

    async Task<(IReadOnlyList<CourierOfficeDto> Items, string Source, string? Message)> FetchSpeedyOfficesAsync(
        string countryId, string? cityId, CancellationToken ct)
    {
        var creds = await SpeedyCredsOrMessageAsync(ct);
        if (creds.Message is not null)
            return ([], "speedy-api", creds.Message);

        var body = new Dictionary<string, object?>
        {
            ["userName"] = creds.Username,
            ["password"] = creds.Password,
            ["language"] = "BG",
        };
        if (int.TryParse(countryId, out var countryNum))
            body["countryId"] = countryNum;
        if (int.TryParse(cityId, out var siteNum))
            body["siteId"] = siteNum;

        var json = await PostSpeedyJsonAsync($"{creds.BaseUrl}/location/office", body, ct);
        var items = ArrayProp(json, "offices")
            .Select(el =>
            {
                var id = Text(el, "id") ?? "";
                var address = el.TryGetProperty("address", out var addr) ? addr : default;
                return new CourierOfficeDto(
                    id,
                    id,
                    Text(el, "name") ?? Text(el, "nameEn") ?? id,
                    Text(el, "nameEn"),
                    Text(address, "siteId") ?? Text(el, "siteId") ?? cityId,
                    Text(address, "siteName") ?? Text(address, "siteNameEn"),
                    Text(address, "fullAddressString") ?? Text(address, "streetName"));
            })
            .Where(o => o.Id.Length > 0)
            .OrderBy(o => o.Name, BgComparer)
            .ToList();
        return (items, "speedy-api", null);
    }

    Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)> FetchDhlCitiesAsync(
        string countryId, CancellationToken ct)
    {
        _ = countryId;
        _ = ct;
        // DHL Location Finder has no city nomenclature. City is typed; offices come from find-by-address.
        return Task.FromResult<(IReadOnlyList<CourierPlaceDto>, string, string?)>(([], "dhl-api", "typeCity"));
    }

    async Task<(IReadOnlyList<CourierOfficeDto> Items, string Source, string? Message)> FetchDhlOfficesAsync(
        string countryId, string? cityName, CancellationToken ct)
    {
        var key = await DhlApiKeyAsync(ct);
        if (string.IsNullOrWhiteSpace(key))
            return ([], "dhl-api", "dhlNeedsKey");
        if (string.IsNullOrWhiteSpace(cityName))
            return ([], "dhl-api", "dhlNeedsCity");

        var iso2 = await ToIso2Async(countryId, ct);
        var items = await FetchDhlOfficesRawAsync(iso2, cityName, key, ct);
        return (items, "dhl-api", items.Count == 0 ? "dhlNoOffices" : null);
    }

    async Task<List<CourierOfficeDto>> FetchDhlOfficesRawAsync(string iso2, string? cityName, string apiKey, CancellationToken ct)
    {
        var url = new StringBuilder("https://api.dhl.com/location-finder/v1/find-by-address?countryCode=")
            .Append(Uri.EscapeDataString(iso2))
            .Append("&providerType=express&limit=50");
        if (!string.IsNullOrWhiteSpace(cityName))
            url.Append("&addressLocality=").Append(Uri.EscapeDataString(cityName));

        using var request = new HttpRequestMessage(HttpMethod.Get, url.ToString());
        request.Headers.TryAddWithoutValidation("DHL-API-Key", apiKey);
        var response = await Client().SendAsync(request, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(ApiError("DHL", response.StatusCode, text));

        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        return ArrayProp(doc.RootElement, "locations")
            .Select(el =>
            {
                var id = Text(el, "locationId")
                    ?? Nested(el, "location", "ids", 0, "locationId")
                    ?? Text(el, "url")
                    ?? Guid.NewGuid().ToString("N");
                var place = el.TryGetProperty("place", out var p) ? p : default;
                var address = place.ValueKind == JsonValueKind.Object && place.TryGetProperty("address", out var a) ? a : default;
                var city = Text(address, "addressLocality") ?? cityName;
                var street = Text(address, "streetAddress");
                var postal = Text(address, "postalCode");
                var addressLine = string.Join(", ", new[] { street, postal, city }.Where(s => !string.IsNullOrWhiteSpace(s)));
                return new CourierOfficeDto(
                    id,
                    id,
                    Text(el, "name") ?? id,
                    null,
                    city,
                    city,
                    addressLine);
            })
            .Where(o => o.Id.Length > 0)
            .OrderBy(o => o.Name, BgComparer)
            .ToList();
    }

    static IReadOnlyList<CourierPlaceDto> BoxNowCountries() =>
    [
        new("BG", "BG", "България", "Bulgaria"),
    ];

    async Task<(IReadOnlyList<CourierPlaceDto> Items, string Source, string? Message)> FetchBoxNowCitiesAsync(
        string countryId, CancellationToken ct)
    {
        if (!IsBulgaria(countryId))
            return ([], "boxnow-api", null);
        var apms = await FetchBoxNowApmsAsync(ct);
        var cities = apms
            .Where(o => !string.IsNullOrWhiteSpace(o.CityName))
            .GroupBy(o => o.CityName!.Trim(), BgComparer)
            .Select(g =>
            {
                var name = g.Key;
                var postal = g.Select(o => o.Address).Select(BoxNowPostal).FirstOrDefault(p => p.Length > 0) ?? "";
                return new CourierPlaceDto(name, postal, name, name);
            })
            .OrderBy(p => p.Name, BgComparer)
            .ToList();
        return (cities, "boxnow-api", null);
    }

    async Task<(IReadOnlyList<CourierOfficeDto> Items, string Source, string? Message)> FetchBoxNowOfficesAsync(
        string countryId, string? cityId, string? cityName, CancellationToken ct)
    {
        if (!IsBulgaria(countryId))
            return ([], "boxnow-api", null);
        var city = FirstNonEmpty(cityName, cityId);
        var items = (await FetchBoxNowApmsAsync(ct))
            .Where(o => string.IsNullOrWhiteSpace(city) || BoxNowCityMatches(o, city))
            .OrderBy(o => o.Name, BgComparer)
            .ToList();
        return (items, "boxnow-api", items.Count == 0 ? "needsOffice" : null);
    }

    async Task<List<CourierOfficeDto>> FetchBoxNowApmsAsync(CancellationToken ct)
    {
        var cached = await GetCachedOfficesAsync(
            Key(CourierId.Boxnow, "apms-all"),
            false,
            async () =>
            {
                var url = "https://locationapi-production.boxnow.bg/v1/apms_bg-BG.json";
                using var response = await Client().GetAsync(url, ct);
                var text = await response.Content.ReadAsStringAsync(ct);
                if (!response.IsSuccessStatusCode)
                    throw new InvalidOperationException(ApiError("BOX NOW", response.StatusCode, text));
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
                var items = ArrayProp(doc.RootElement, "data")
                    .Select(el =>
                    {
                        var id = Text(el, "id") ?? "";
                        var city = Text(el, "addressLine2") ?? Text(el, "title") ?? "";
                        var street = Text(el, "addressLine1");
                        var postal = Text(el, "postalCode");
                        var address = string.Join(", ", new[] { street, postal, city }.Where(s => !string.IsNullOrWhiteSpace(s)));
                        return new CourierOfficeDto(
                            id,
                            id,
                            Text(el, "name") ?? Text(el, "title") ?? id,
                            Text(el, "title"),
                            city,
                            city,
                            address);
                    })
                    .Where(o => o.Id.Length > 0)
                    .ToList();
                return (items, "boxnow-api", null);
            },
            ct);
        return cached.Items.ToList();
    }

    static bool IsBulgaria(string countryId)
    {
        var value = countryId.Trim().ToUpperInvariant();
        return value is "BG" or "BGR" or "100";
    }

    static bool BoxNowCityMatches(CourierOfficeDto office, string city)
    {
        var needle = city.Trim();
        if (needle.Length == 0) return true;
        return NamesLoose(office.CityName, needle)
            || NamesLoose(office.CityId, needle)
            || NamesLoose(office.Name, needle)
            || NamesLoose(office.Address, needle);
    }

    static bool NamesLoose(string? value, string needle)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        return value.Contains(needle, StringComparison.OrdinalIgnoreCase)
            || needle.Contains(value.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    static string BoxNowPostal(string? address)
    {
        if (string.IsNullOrWhiteSpace(address)) return "";
        var match = Regex.Match(address, @"\b(\d{4})\b");
        return match.Success ? match.Groups[1].Value : "";
    }

    async Task<JsonElement> PostEcontAsync(string path, object body, CancellationToken ct)
    {
        var creds = await couriers.GetCredentialsAsync(CourierId.Econt, ct);
        var root = string.IsNullOrWhiteSpace(creds.ApiUrl)
            ? (creds.TestMode ? "https://demo.econt.com/ee/services" : "https://ee.econt.com/services")
            : creds.ApiUrl.TrimEnd('/');
        // Nomenclatures are public on production even in test mode.
        if (string.IsNullOrWhiteSpace(creds.ApiUrl) && creds.TestMode)
            root = "https://ee.econt.com/services";

        var request = new HttpRequestMessage(HttpMethod.Post, $"{root}/{path}")
        {
            Content = JsonContent.Create(body),
        };
        if (!string.IsNullOrWhiteSpace(creds.Username) && !string.IsNullOrWhiteSpace(creds.Password))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue(
                "Basic",
                Convert.ToBase64String(Encoding.UTF8.GetBytes($"{creds.Username}:{creds.Password}")));
        }

        var response = await Client().SendAsync(request, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(ApiError("Econt", response.StatusCode, text));
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        return doc.RootElement.Clone();
    }

    async Task<(string Username, string Password, string BaseUrl, string? Message)> SpeedyCredsOrMessageAsync(CancellationToken ct)
    {
        var creds = await couriers.GetCredentialsAsync(CourierId.Speedy, ct);
        if (string.IsNullOrWhiteSpace(creds.Username) || string.IsNullOrWhiteSpace(creds.Password))
            return ("", "", "", "needsCredentials");
        var baseUrl = string.IsNullOrWhiteSpace(creds.ApiUrl) ? "https://api.speedy.bg/v1" : creds.ApiUrl.TrimEnd('/');
        return (creds.Username, creds.Password, baseUrl, null);
    }

    async Task<string?> DhlApiKeyAsync(CancellationToken ct)
    {
        var creds = await couriers.GetCredentialsAsync(CourierId.Dhl, ct);
        return FirstNonEmpty(creds.Password, creds.SiteId);
    }

    async Task<string> PostSpeedyTextAsync(string url, object body, CancellationToken ct)
    {
        var response = await Client().PostAsJsonAsync(url, body, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(ApiError("Speedy", response.StatusCode, text));
        return text;
    }

    async Task<JsonElement> PostSpeedyJsonAsync(string url, object body, CancellationToken ct)
    {
        var response = await Client().PostAsJsonAsync(url, body, ct);
        var text = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(ApiError("Speedy", response.StatusCode, text));
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(text) ? "{}" : text);
        return doc.RootElement.Clone();
    }

    HttpClient Client() => httpFactory.CreateClient("couriers");

    static CourierLocationListDto PlacesFromCache(CourierLocationCache row, string source, string? message = null)
    {
        var items = JsonSerializer.Deserialize<List<CourierPlaceDto>>(row.Json, JsonOptions) ?? [];
        return new CourierLocationListDto(source, row.FetchedAt, message, items);
    }

    static CourierOfficeListDto OfficesFromCache(CourierLocationCache row, string source, string? message = null)
    {
        var items = JsonSerializer.Deserialize<List<CourierOfficeDto>>(row.Json, JsonOptions) ?? [];
        return new CourierOfficeListDto(source, row.FetchedAt, message, items);
    }

    static CourierLocationListDto EmptyPlaces(string source, string message) =>
        new(source, null, message, []);

    static CourierOfficeListDto EmptyOffices(string source, string message) =>
        new(source, null, message, []);

    static string Key(CourierId courier, params string[] parts) =>
        string.Join(':', new[] { courier.ToString().ToLowerInvariant() }.Concat(parts.Select(p => p.Trim().ToLowerInvariant())));

    static IEnumerable<JsonElement> ArrayProp(JsonElement root, string name)
    {
        if (root.ValueKind == JsonValueKind.Array)
            return root.EnumerateArray();
        if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Array)
            return prop.EnumerateArray();
        return [];
    }

    static string? Text(JsonElement el, string name)
    {
        if (el.ValueKind != JsonValueKind.Object || !el.TryGetProperty(name, out var prop))
            return null;
        return prop.ValueKind switch
        {
            JsonValueKind.String => EmptyToNull(prop.GetString()),
            JsonValueKind.Number => prop.ToString(),
            JsonValueKind.True or JsonValueKind.False => prop.GetBoolean().ToString(),
            _ => null,
        };
    }

    static string? Nested(JsonElement el, string a, string b, int index, string c)
    {
        if (el.ValueKind != JsonValueKind.Object || !el.TryGetProperty(a, out var one) || one.ValueKind != JsonValueKind.Object)
            return null;
        if (!one.TryGetProperty(b, out var two) || two.ValueKind != JsonValueKind.Array)
            return null;
        var i = 0;
        foreach (var item in two.EnumerateArray())
        {
            if (i++ == index)
                return Text(item, c);
        }
        return null;
    }

    static string? EmptyToNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    static string? FirstNonEmpty(params string?[] values) =>
        values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim();

    static string ApiError(string courier, System.Net.HttpStatusCode status, string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            var message = Text(root, "message")
                ?? NestedMessage(root)
                ?? body;
            return $"{courier} API {(int)status}: {Trim(message, 240)}";
        }
        catch
        {
            return $"{courier} API {(int)status}: {Trim(body, 240)}";
        }
    }

    static string? NestedMessage(JsonElement root)
    {
        if (root.TryGetProperty("error", out var error))
            return Text(error, "message") ?? Text(error, "innererror") ?? error.ToString();
        if (root.TryGetProperty("detail", out var detail) && detail.ValueKind == JsonValueKind.String)
            return detail.GetString();
        return null;
    }

    static string Trim(string value, int max) =>
        value.Length <= max ? value : value[..max];

    static List<string[]> ParseCsv(string text)
    {
        var rows = new List<string[]>();
        var fields = new List<string>();
        var sb = new StringBuilder();
        var inQuotes = false;
        for (var i = 0; i < text.Length; i++)
        {
            var ch = text[i];
            if (inQuotes)
            {
                if (ch == '"')
                {
                    if (i + 1 < text.Length && text[i + 1] == '"')
                    {
                        sb.Append('"');
                        i++;
                    }
                    else inQuotes = false;
                }
                else sb.Append(ch);
                continue;
            }

            switch (ch)
            {
                case '"':
                    inQuotes = true;
                    break;
                case ',':
                    fields.Add(sb.ToString());
                    sb.Clear();
                    break;
                case '\n':
                    fields.Add(sb.ToString());
                    sb.Clear();
                    if (fields.Exists(f => f.Length > 0))
                        rows.Add(fields.ToArray());
                    fields.Clear();
                    break;
                case '\r':
                    break;
                default:
                    sb.Append(ch);
                    break;
            }
        }

        if (sb.Length > 0 || fields.Count > 0)
        {
            fields.Add(sb.ToString());
            if (fields.Exists(f => f.Length > 0))
                rows.Add(fields.ToArray());
        }
        return rows;
    }

    // Official DHL Express coverage from Location Finder Unified docs.
    static IReadOnlyList<CourierPlaceDto> DhlOfficialCountries()
    {
        const string coverage = """
            United Arab Emirates (AE), Afghanistan (AF), Albania (AL), Armenia (AM), Angola (AO), Argentina (AR),
            Austria (AT), Australia (AU), Bosnia and Herzegovina (BA), Barbados (BB), Bangladesh (BD), Belgium (BE),
            Burkina Faso (BF), Bulgaria (BG), Bahrain (BH), Benin (BJ), Bermuda (BM), Brunei Darussalam (BN),
            Bolivia (BO), Brazil (BR), Bahamas (BS), Bhutan (BT), Botswana (BW), Belarus (BY), Canada (CA),
            Congo (CG), Switzerland (CH), Côte d'Ivoire (CI), Cook Islands (CK), Chile (CL), China (CN),
            Colombia (CO), Costa Rica (CR), Cabo Verde (CV), Cyprus (CY), Czechia (CZ), Germany (DE), Denmark (DK),
            Dominican Republic (DO), Algeria (DZ), Ecuador (EC), Estonia (EE), Egypt (EG), Spain (ES), Ethiopia (ET),
            Finland (FI), Fiji (FJ), France (FR), United Kingdom of Great Britain and Northern Ireland (GB),
            Georgia (GE), French Guiana (GF), Guernsey (GG), Ghana (GH), Gambia (GM), Guadeloupe (GP), Greece (GR),
            Guatemala (GT), Guinea-Bissau (GW), Hong Kong (HK), Honduras (HN), Croatia (HR), Haiti (HT), Hungary (HU),
            Indonesia (ID), Ireland (IE), Israel (IL), India (IN), Iraq (IQ), Iran (IR), Iceland (IS), Italy (IT),
            Jersey (JE), Jamaica (JM), Jordan (JO), Japan (JP), Kenya (KE), Kyrgyzstan (KG), Cambodia (KH),
            Kiribati (KI), Comoros (KM), North Korea (KP), South Korea (KR), Kosovo (KV), Kuwait (KW),
            Cayman Islands (KY), Kazakhstan (KZ), Laos (LA), Lebanon (LB), Sri Lanka (LK), Liberia (LR), Lesotho (LS),
            Lithuania (LT), Luxembourg (LU), Latvia (LV), Morocco (MA), Moldova (MD), Madagascar (MG),
            North Macedonia (MK), Mali (ML), Myanmar (MM), Mongolia (MN), Macao (MO), Northern Mariana Islands (MP),
            Martinique (MQ), Mauritania (MR), Malta (MT), Mauritius (MU), Maldives (MV), Malawi (MW), Mexico (MX),
            Malaysia (MY), Mozambique (MZ), Namibia (NA), New Caledonia (NC), Nigeria (NG), Nicaragua (NI),
            Netherlands (NL), Norway (NO), Nepal (NP), Nauru (NR), Niue (NU), New Zealand (NZ), Oman (OM),
            Panama (PA), Peru (PE), French Polynesia (PF), Papua New Guinea (PG), Philippines (PH), Pakistan (PK),
            Poland (PL), Puerto Rico (PR), Portugal (PT), Paraguay (PY), Qatar (QA), Réunion (RE), Romania (RO),
            Serbia (RS), Russian (RU), Rwanda (RW), Saudi Arabia (SA), Solomon Islands (SB), Seychelles (SC),
            Sudan (SD), Sweden (SE), Singapore (SG), Slovenia (SI), Slovakia (SK), Sierra Leone (SL), Senegal (SN),
            South Sudan (SS), El Salvador (SV), Syrian Arab Republic (SY), Eswatini (SZ), Togo (TG), Thailand (TH),
            Timor-Leste (TL), Tunisia (TN), Tonga (TO), Turkey (TR), Trinidad and Tobago (TT), Tuvalu (TV),
            Taiwan (TW), Tanzania (TZ), Ukraine (UA), Uganda (UG), United States of America (US), Uruguay (UY),
            Uzbekistan (UZ), Venezuela (VE), Virgin Islands (VG), Virgin Islands (VI), Viet Nam (VN), Vanuatu (VU),
            Samoa (WS), Ceuta (XC), Montenegro (XM), Mayotte (YT), South Africa (ZA), Zambia (ZM), Zimbabwe (ZW)
            """;

        return Regex.Matches(coverage, @"([^,()]+?)\s*\(([A-Z]{2})\)")
            .Select(m => new CourierPlaceDto(m.Groups[2].Value, m.Groups[2].Value, m.Groups[1].Value.Trim(), m.Groups[1].Value.Trim()))
            .OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}
