using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class CourierService(AppDbContext db)
{
    static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<CourierSettingsDto> GetAsync(CancellationToken ct = default)
    {
        var state = await LoadStateAsync(ct);
        return ToDto(state);
    }

    public async Task<CourierSettingsDto> UpdateAsync(UpdateCourierSettingsRequest request, CancellationToken ct = default)
    {
        var row = await GetOrCreateRowAsync(ct);
        var state = Deserialize(row.Json);

        if (request.Sender is not null) MergeSender(state.Sender, request.Sender);
        if (request.Econt is not null) MergeAccount(state.Econt, request.Econt);
        if (request.Speedy is not null) MergeAccount(state.Speedy, request.Speedy);
        if (request.Dhl is not null) MergeAccount(state.Dhl, request.Dhl);
        if (request.BoxNow is not null) MergeAccount(state.BoxNow, request.BoxNow);

        row.Json = JsonSerializer.Serialize(state, JsonOptions);
        row.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return ToDto(state);
    }

    public async Task<CourierShipmentResult> CreateShipmentAsync(
        CourierId courier,
        CreateWaybillRequest request,
        CancellationToken ct = default)
    {
        var state = await LoadStateAsync(ct);
        var account = AccountFor(state, courier);
        var configured = IsConfigured(courier, account);
        var live = account.Enabled && configured;
        var mode = !live ? "manual" : account.TestMode ? "sandbox" : "live";
        var number = NextNumber(courier);
        var trackingUrl = TrackingUrl(courier, number);

        // Live Econt / Speedy / DHL clients will read state.Sender + account here.
        _ = ct;
        _ = request;
        _ = state.Sender;

        return new CourierShipmentResult(number, mode, trackingUrl, live ? number : null);
    }

    public async Task<CourierApiCredentials> GetCredentialsAsync(CourierId courier, CancellationToken ct = default)
    {
        var state = await LoadStateAsync(ct);
        var account = AccountFor(state, courier);
        return new CourierApiCredentials(account.TestMode, account.Username, account.Password, account.SiteId, account.ApiUrl);
    }

    public async Task<CourierQuoteContext> GetQuoteContextAsync(CancellationToken ct = default)
    {
        var state = await LoadStateAsync(ct);
        return new CourierQuoteContext(
            new CourierQuoteSender(
                state.Sender.Company,
                string.IsNullOrWhiteSpace(state.Sender.ContactName) ? state.Sender.Company : state.Sender.ContactName,
                state.Sender.Phone,
                state.Sender.Email,
                state.Sender.Street,
                state.Sender.City,
                state.Sender.PostalCode,
                string.IsNullOrWhiteSpace(state.Sender.Country) ? "BG" : state.Sender.Country),
            ToQuoteAccount(CourierId.Econt, state.Econt),
            ToQuoteAccount(CourierId.Speedy, state.Speedy),
            ToQuoteAccount(CourierId.Dhl, state.Dhl),
            ToQuoteAccount(CourierId.Boxnow, state.BoxNow));
    }

    static CourierQuoteAccount ToQuoteAccount(CourierId courier, CourierAccountState account) => new(
        account.Enabled,
        IsConfigured(courier, account),
        account.TestMode,
        account.Username,
        account.Password,
        account.SiteId,
        account.ApiUrl,
        account.OfficeCode,
        account.AccountNumber,
        account.ClientId,
        account.DefaultWeightKg <= 0 ? 1.5m : account.DefaultWeightKg,
        account.DefaultPackages <= 0 ? 1 : account.DefaultPackages,
        account.ServiceType,
        account.Contents,
        account.CityId,
        account.CityName,
        account.CountryCode,
        string.IsNullOrWhiteSpace(account.Payer) ? "sender" : account.Payer);

    async Task<CourierAccountsState> LoadStateAsync(CancellationToken ct)
    {
        var row = await db.CourierSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);
        return Deserialize(row?.Json);
    }

    async Task<CourierSettings> GetOrCreateRowAsync(CancellationToken ct)
    {
        var row = await db.CourierSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);
        if (row is not null) return row;
        row = new CourierSettings { Id = 1, Json = "{}" };
        db.CourierSettings.Add(row);
        await db.SaveChangesAsync(ct);
        return row;
    }

    static CourierAccountsState Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "{}")
            return new CourierAccountsState();
        try
        {
            return JsonSerializer.Deserialize<CourierAccountsState>(json, JsonOptions) ?? new CourierAccountsState();
        }
        catch
        {
            return new CourierAccountsState();
        }
    }

    static void MergeSender(CourierSenderState target, UpdateCourierSenderRequest update)
    {
        if (update.Company is not null) target.Company = update.Company.Trim();
        if (update.ContactName is not null) target.ContactName = update.ContactName.Trim();
        if (update.Phone is not null) target.Phone = update.Phone.Trim();
        if (update.Email is not null) target.Email = update.Email.Trim();
        if (update.Street is not null) target.Street = update.Street.Trim();
        if (update.City is not null) target.City = update.City.Trim();
        if (update.PostalCode is not null) target.PostalCode = update.PostalCode.Trim();
        if (update.Country is not null) target.Country = update.Country.Trim().ToUpperInvariant();
        if (update.DefaultCourier is not null) target.DefaultCourier = update.DefaultCourier.Trim().ToLowerInvariant();
    }

    static void MergeAccount(CourierAccountState target, UpdateCourierAccountRequest update)
    {
        target.Enabled = update.Enabled;
        target.TestMode = update.TestMode;
        if (update.Username is not null) target.Username = update.Username.Trim();
        if (!string.IsNullOrWhiteSpace(update.Password)) target.Password = update.Password;
        if (update.SiteId is not null) target.SiteId = update.SiteId.Trim();
        if (update.ApiUrl is not null) target.ApiUrl = update.ApiUrl.Trim();
        if (update.OfficeCode is not null) target.OfficeCode = update.OfficeCode.Trim();
        if (update.ClientId is not null) target.ClientId = update.ClientId.Trim();
        if (update.ContractId is not null) target.ContractId = update.ContractId.Trim();
        if (update.AccountNumber is not null) target.AccountNumber = update.AccountNumber.Trim();
        if (update.Iban is not null) target.Iban = update.Iban.Trim();
        if (update.ServiceType is not null) target.ServiceType = update.ServiceType.Trim();
        if (update.Contents is not null) target.Contents = update.Contents.Trim();
        if (update.Payer is not null) target.Payer = update.Payer.Trim().ToLowerInvariant();
        if (update.DefaultWeightKg is not null) target.DefaultWeightKg = update.DefaultWeightKg.Value;
        if (update.DefaultPackages is not null) target.DefaultPackages = Math.Max(1, update.DefaultPackages.Value);
        if (update.LabelFormat is not null) target.LabelFormat = update.LabelFormat.Trim().ToLowerInvariant();
        if (update.Notes is not null) target.Notes = update.Notes.Trim();
        if (update.CountryCode is not null) target.CountryCode = update.CountryCode.Trim();
        if (update.CityId is not null) target.CityId = update.CityId.Trim();
        if (update.CityName is not null) target.CityName = update.CityName.Trim();
    }

    static CourierSettingsDto ToDto(CourierAccountsState state) => new()
    {
        Sender = new CourierSenderDto
        {
            Company = state.Sender.Company,
            ContactName = state.Sender.ContactName,
            Phone = state.Sender.Phone,
            Email = state.Sender.Email,
            Street = state.Sender.Street,
            City = state.Sender.City,
            PostalCode = state.Sender.PostalCode,
            Country = string.IsNullOrWhiteSpace(state.Sender.Country) ? "BG" : state.Sender.Country,
            DefaultCourier = string.IsNullOrWhiteSpace(state.Sender.DefaultCourier) ? "econt" : state.Sender.DefaultCourier,
        },
        Econt = ToDto("econt", state.Econt),
        Speedy = ToDto("speedy", state.Speedy),
        Dhl = ToDto("dhl", state.Dhl),
        BoxNow = ToDto("boxnow", state.BoxNow),
    };

    static CourierAccountDto ToDto(string id, CourierAccountState account)
    {
        var courier = EnumMapper.ParseCourier(id);
        var configured = IsConfigured(courier, account);
        var live = account.Enabled && configured;
        var mode = !live ? "manual" : account.TestMode ? "sandbox" : "live";
        return new CourierAccountDto
        {
            Id = id,
            Enabled = account.Enabled,
            TestMode = account.TestMode,
            Configured = configured,
            Mode = mode,
            HasPassword = !string.IsNullOrWhiteSpace(account.Password),
            Username = account.Username,
            SiteId = account.SiteId,
            ApiUrl = account.ApiUrl,
            OfficeCode = account.OfficeCode,
            ClientId = account.ClientId,
            ContractId = account.ContractId,
            AccountNumber = account.AccountNumber,
            Iban = account.Iban,
            ServiceType = account.ServiceType,
            Contents = account.Contents,
            Payer = string.IsNullOrWhiteSpace(account.Payer) ? "sender" : account.Payer,
            DefaultWeightKg = account.DefaultWeightKg <= 0 ? 1.5m : account.DefaultWeightKg,
            DefaultPackages = account.DefaultPackages <= 0 ? 1 : account.DefaultPackages,
            LabelFormat = string.IsNullOrWhiteSpace(account.LabelFormat) ? "pdf" : account.LabelFormat,
            Notes = account.Notes,
            CountryCode = account.CountryCode,
            CityId = account.CityId,
            CityName = account.CityName,
        };
    }

    static CourierAccountState AccountFor(CourierAccountsState state, CourierId courier) => courier switch
    {
        CourierId.Econt => state.Econt,
        CourierId.Speedy => state.Speedy,
        CourierId.Dhl => state.Dhl,
        _ => state.BoxNow,
    };

    static bool IsConfigured(CourierId courier, CourierAccountState account)
    {
        if (string.IsNullOrWhiteSpace(account.Password)) return false;
        return courier switch
        {
            CourierId.Dhl => !string.IsNullOrWhiteSpace(account.SiteId) || !string.IsNullOrWhiteSpace(account.Username),
            CourierId.Boxnow => !string.IsNullOrWhiteSpace(account.ClientId) && !string.IsNullOrWhiteSpace(account.Password),
            _ => !string.IsNullOrWhiteSpace(account.Username),
        };
    }

    static string NextNumber(CourierId courier)
    {
        var prefix = courier switch
        {
            CourierId.Econt => "EC",
            CourierId.Speedy => "SP",
            CourierId.Boxnow => "BN",
            _ => "DHL",
        };
        var digits = Random.Shared.NextInt64(1_000_000_000, 9_999_999_999);
        return $"{prefix}-{digits}";
    }

    static string TrackingUrl(CourierId courier, string number) => courier switch
    {
        CourierId.Econt => $"https://www.econt.com/tracking/{Uri.EscapeDataString(number)}",
        CourierId.Speedy => $"https://www.speedy.bg/bg/track-shipment?shipmentId={Uri.EscapeDataString(number)}",
        CourierId.Boxnow => $"https://boxnow.bg/en/track?id={Uri.EscapeDataString(number)}",
        _ => $"https://www.dhl.com/bg-bg/home/tracking.html?tracking-id={Uri.EscapeDataString(number)}",
    };

    class CourierAccountsState
    {
        public CourierSenderState Sender { get; set; } = new();
        public CourierAccountState Econt { get; set; } = new();
        public CourierAccountState Speedy { get; set; } = new();
        public CourierAccountState Dhl { get; set; } = new();
        public CourierAccountState BoxNow { get; set; } = new() { Enabled = true };
    }

    class CourierSenderState
    {
        public string Company { get; set; } = "";
        public string ContactName { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Street { get; set; } = "";
        public string City { get; set; } = "";
        public string PostalCode { get; set; } = "";
        public string Country { get; set; } = "BG";
        public string DefaultCourier { get; set; } = "econt";
    }

    class CourierAccountState
    {
        public bool Enabled { get; set; }
        public bool TestMode { get; set; } = true;
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public string SiteId { get; set; } = "";
        public string ApiUrl { get; set; } = "";
        public string OfficeCode { get; set; } = "";
        public string ClientId { get; set; } = "";
        public string ContractId { get; set; } = "";
        public string AccountNumber { get; set; } = "";
        public string Iban { get; set; } = "";
        public string ServiceType { get; set; } = "";
        public string Contents { get; set; } = "";
        public string Payer { get; set; } = "sender";
        public decimal DefaultWeightKg { get; set; } = 1.5m;
        public int DefaultPackages { get; set; } = 1;
        public string LabelFormat { get; set; } = "pdf";
        public string Notes { get; set; } = "";
        public string CountryCode { get; set; } = "";
        public string CityId { get; set; } = "";
        public string CityName { get; set; } = "";
    }
}
