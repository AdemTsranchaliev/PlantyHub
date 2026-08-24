using System.Text.Json.Serialization;

namespace PlantyHub.Api.Dtos;

public class CourierSenderDto
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

public class CourierAccountDto
{
    public string Id { get; set; } = "";
    public bool Enabled { get; set; }
    public bool TestMode { get; set; } = true;
    public bool Configured { get; set; }
    public string Mode { get; set; } = "manual";
    public bool HasPassword { get; set; }
    public string Username { get; set; } = "";
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

public class CourierSettingsDto
{
    public CourierSenderDto Sender { get; set; } = new();
    public CourierAccountDto Econt { get; set; } = new() { Id = "econt" };
    public CourierAccountDto Speedy { get; set; } = new() { Id = "speedy" };
    public CourierAccountDto Dhl { get; set; } = new() { Id = "dhl" };
    [JsonPropertyName("boxnow")]
    public CourierAccountDto BoxNow { get; set; } = new() { Id = "boxnow" };
}

public class UpdateCourierSenderRequest
{
    public string? Company { get; set; }
    public string? ContactName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? DefaultCourier { get; set; }
}

public class UpdateCourierAccountRequest
{
    public bool Enabled { get; set; }
    public bool TestMode { get; set; } = true;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? SiteId { get; set; }
    public string? ApiUrl { get; set; }
    public string? OfficeCode { get; set; }
    public string? ClientId { get; set; }
    public string? ContractId { get; set; }
    public string? AccountNumber { get; set; }
    public string? Iban { get; set; }
    public string? ServiceType { get; set; }
    public string? Contents { get; set; }
    public string? Payer { get; set; }
    public decimal? DefaultWeightKg { get; set; }
    public int? DefaultPackages { get; set; }
    public string? LabelFormat { get; set; }
    public string? Notes { get; set; }
    public string? CountryCode { get; set; }
    public string? CityId { get; set; }
    public string? CityName { get; set; }
}

public class UpdateCourierSettingsRequest
{
    public UpdateCourierSenderRequest? Sender { get; set; }
    public UpdateCourierAccountRequest? Econt { get; set; }
    public UpdateCourierAccountRequest? Speedy { get; set; }
    public UpdateCourierAccountRequest? Dhl { get; set; }
    [JsonPropertyName("boxnow")]
    public UpdateCourierAccountRequest? BoxNow { get; set; }
}

public record CourierShipmentResult(
    string Number,
    string Mode,
    string? TrackingUrl,
    string? ExternalId);

public record CourierPlaceDto(string Id, string Code, string Name, string? NameEn);

public record CourierOfficeDto(
    string Id,
    string Code,
    string Name,
    string? NameEn,
    string? CityId,
    string? CityName,
    string? Address);

public record CourierLocationListDto(
    string Source,
    DateTime? CachedAt,
    string? Message,
    IReadOnlyList<CourierPlaceDto> Items);

public record CourierOfficeListDto(
    string Source,
    DateTime? CachedAt,
    string? Message,
    IReadOnlyList<CourierOfficeDto> Items);

public record CourierApiCredentials(
    bool TestMode,
    string Username,
    string Password,
    string SiteId,
    string ApiUrl);

public record CourierQuoteSender(
    string Company,
    string ContactName,
    string Phone,
    string Email,
    string Street,
    string City,
    string PostalCode,
    string Country);

public record CourierQuoteAccount(
    bool Enabled,
    bool Configured,
    bool TestMode,
    string Username,
    string Password,
    string SiteId,
    string ApiUrl,
    string OfficeCode,
    string AccountNumber,
    string ClientId,
    decimal DefaultWeightKg,
    int DefaultPackages,
    string ServiceType,
    string Contents,
    string CityId,
    string CityName,
    string CountryCode,
    string Payer);

public record CourierQuoteContext(
    CourierQuoteSender Sender,
    CourierQuoteAccount Econt,
    CourierQuoteAccount Speedy,
    CourierQuoteAccount Dhl,
    CourierQuoteAccount BoxNow);

public record ShippingQuoteRequest
{
    public string Country { get; set; } = "BG";
    public string City { get; set; } = "";
    public string? CityId { get; set; }
    public string PostalCode { get; set; } = "";
    public string Street { get; set; } = "";
    public string? OfficeCode { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal? Subtotal { get; set; }
    public decimal? WeightKg { get; set; }
    public bool IncludeUnavailable { get; set; }
    public string? Courier { get; set; }
}

public record ShippingQuoteDto(
    string Id,
    string Courier,
    string Delivery,
    string? OfficeCode,
    decimal Price,
    string Currency,
    decimal PriceEur,
    string? Message);

public record ShippingQuotesDto(IReadOnlyList<ShippingQuoteDto> Quotes);
