using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class VatService(AppDbContext db)
{
    public const string HomeCountry = "BG";

    static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    // Standard VAT rates, EU-27. Official TEDB / Your Europe table for 2026.
    static readonly IReadOnlyDictionary<string, decimal> EuStandardRates = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase)
    {
        ["AT"] = 20m,
        ["BE"] = 21m,
        ["BG"] = 20m,
        ["HR"] = 25m,
        ["CY"] = 19m,
        ["CZ"] = 21m,
        ["DK"] = 25m,
        ["EE"] = 24m,
        ["FI"] = 25.5m,
        ["FR"] = 20m,
        ["DE"] = 19m,
        ["GR"] = 24m,
        ["EL"] = 24m,
        ["HU"] = 27m,
        ["IE"] = 23m,
        ["IT"] = 22m,
        ["LV"] = 21m,
        ["LT"] = 21m,
        ["LU"] = 17m,
        ["MT"] = 18m,
        ["NL"] = 21m,
        ["PL"] = 23m,
        ["PT"] = 23m,
        ["RO"] = 21m,
        ["SK"] = 23m,
        ["SI"] = 22m,
        ["ES"] = 21m,
        ["SE"] = 25m,
    };

    public static IReadOnlyList<StoreVatRateDto> OfficialRates() =>
        EuStandardRates
            .Where(kv => kv.Key.Length == 2 && kv.Key != "EL")
            .OrderBy(kv => kv.Key)
            .Select(kv => new StoreVatRateDto(kv.Key.ToUpperInvariant(), kv.Value))
            .ToList();

    public async Task<StoreVatSettingsDto> GetSettingsAsync(CancellationToken ct = default)
    {
        var state = await LoadStateAsync(ct);
        return new StoreVatSettingsDto
        {
            Enabled = state.VatEnabled,
            PricesIncludeVat = state.PricesIncludeVat,
            VatNumber = state.VatNumber,
            HomeCountry = HomeCountry,
            Rates = OfficialRates(),
        };
    }

    public async Task<StoreVatSettingsDto> UpdateSettingsAsync(UpdateStoreVatSettingsRequest request, CancellationToken ct = default)
    {
        var row = await GetOrCreateRowAsync(ct);
        var state = Deserialize(row.Json);
        state.VatEnabled = request.Enabled;
        state.PricesIncludeVat = request.PricesIncludeVat;
        if (request.VatNumber is not null) state.VatNumber = request.VatNumber.Trim();
        row.Json = JsonSerializer.Serialize(state, JsonOptions);
        row.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return await GetSettingsAsync(ct);
    }

    public async Task<VatQuoteDto> QuoteAsync(string country, decimal subtotal, decimal shipping, CancellationToken ct = default)
    {
        var state = await LoadStateAsync(ct);
        var iso2 = string.IsNullOrWhiteSpace(country) ? HomeCountry : country.Trim().ToUpperInvariant();
        if (iso2.Length > 2) iso2 = iso2[..2];
        var taxable = Math.Max(0m, subtotal) + Math.Max(0m, shipping);
        var apply = IsHomeCountry(iso2) || state.VatEnabled;

        if (!apply)
            return new VatQuoteDto(false, iso2, 0, state.PricesIncludeVat, 0, Round(taxable), null);

        var rate = RateFor(iso2);
        if (rate <= 0)
            return new VatQuoteDto(true, iso2, 0, state.PricesIncludeVat, 0, Round(taxable), "outsideEu");

        if (state.PricesIncludeVat)
        {
            var tax = Round(taxable * rate / (100m + rate));
            return new VatQuoteDto(true, iso2, rate, true, tax, Round(taxable), null);
        }

        var added = Round(taxable * rate / 100m);
        return new VatQuoteDto(true, iso2, rate, false, added, Round(taxable + added), null);
    }

    public static bool IsHomeCountry(string country) =>
        country.Trim().Equals(HomeCountry, StringComparison.OrdinalIgnoreCase);

    public static decimal RateFor(string country)
    {
        var iso2 = country.Trim().ToUpperInvariant();
        return EuStandardRates.TryGetValue(iso2, out var rate) ? rate : 0m;
    }

    async Task<VatState> LoadStateAsync(CancellationToken ct)
    {
        var row = await db.StoreSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);
        return Deserialize(row?.Json);
    }

    async Task<StoreSettings> GetOrCreateRowAsync(CancellationToken ct)
    {
        var row = await db.StoreSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);
        if (row is not null) return row;
        row = new StoreSettings { Id = 1, Json = "{}" };
        db.StoreSettings.Add(row);
        await db.SaveChangesAsync(ct);
        return row;
    }

    static VatState Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "{}")
            return new VatState();
        try
        {
            return JsonSerializer.Deserialize<VatState>(json, JsonOptions) ?? new VatState();
        }
        catch
        {
            return new VatState();
        }
    }

    static decimal Round(decimal amount) => Math.Round(amount, 2, MidpointRounding.AwayFromZero);

    class VatState
    {
        public bool VatEnabled { get; set; }
        public bool PricesIncludeVat { get; set; } = true;
        public string VatNumber { get; set; } = "";
    }
}
