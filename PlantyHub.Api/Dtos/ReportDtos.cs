namespace PlantyHub.Api.Dtos;

public class AccountingReportPreviewDto
{
    public string From { get; set; } = "";
    public string To { get; set; } = "";
    public string VatNumber { get; set; } = "";
    public int OrderCount { get; set; }
    public int CancelledExcluded { get; set; }
    public decimal Products { get; set; }
    public decimal Shipping { get; set; }
    public decimal Net { get; set; }
    public decimal Vat { get; set; }
    public decimal Gross { get; set; }
    public IReadOnlyList<AccountingVatCountryDto> ByCountry { get; set; } = [];
}

public class AccountingVatCountryDto
{
    public string Country { get; set; } = "";
    public string CountryName { get; set; } = "";
    public decimal RatePercent { get; set; }
    public int Orders { get; set; }
    public decimal Net { get; set; }
    public decimal Vat { get; set; }
    public decimal Gross { get; set; }
}
