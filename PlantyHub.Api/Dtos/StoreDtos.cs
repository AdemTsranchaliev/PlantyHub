namespace PlantyHub.Api.Dtos;

public record StoreVatRateDto(string Country, decimal RatePercent);

public class StoreVatSettingsDto
{
    public bool Enabled { get; set; }
    public bool PricesIncludeVat { get; set; } = true;
    public string VatNumber { get; set; } = "";
    public string HomeCountry { get; set; } = "BG";
    public IReadOnlyList<StoreVatRateDto> Rates { get; set; } = [];
}

public class UpdateStoreVatSettingsRequest
{
    public bool Enabled { get; set; }
    public bool PricesIncludeVat { get; set; } = true;
    public string? VatNumber { get; set; }
}

public record VatQuoteDto(
    bool Enabled,
    string Country,
    decimal RatePercent,
    bool PricesIncludeVat,
    decimal Tax,
    decimal Total,
    string? Message);
