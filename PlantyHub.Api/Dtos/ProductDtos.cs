namespace PlantyHub.Api.Dtos;

public record ProductColorDto(string Id, string Hex);

public record ProductSpecDto(string Label, string Value);

public record ProductFeatureDto(string Title, string Text);

public record ProductFaqDto(string Q, string A);

public class ProductPageContentDto
{
    public List<ProductSpecDto> Specs { get; set; } = [];
    public string? HighlightsTitle { get; set; }
    public string? HighlightsSubtitle { get; set; }
    public string? SpecsTitle { get; set; }
    public string? HowTitle { get; set; }
    public string? BoxTitle { get; set; }
    public string? FaqTitle { get; set; }
    public List<ProductFeatureDto> Features { get; set; } = [];
    public List<string> Steps { get; set; } = [];
    public List<string> InTheBox { get; set; } = [];
    public List<ProductFaqDto> Faq { get; set; } = [];
}

public record ProductLocaleDto(
    string Name,
    string? Tagline,
    string? Description,
    string? VideoBadge = null,
    string? VideoTitle = null,
    string? VideoText = null,
    IReadOnlyList<ProductSpecDto>? Specs = null,
    string? HighlightsTitle = null,
    string? HighlightsSubtitle = null,
    string? SpecsTitle = null,
    string? HowTitle = null,
    string? BoxTitle = null,
    string? FaqTitle = null,
    IReadOnlyList<ProductFeatureDto>? Features = null,
    IReadOnlyList<string>? Steps = null,
    IReadOnlyList<string>? InTheBox = null,
    IReadOnlyList<ProductFaqDto>? Faq = null);

public class ProductKitDto
{
    public int Pods { get; set; }
    public int Caps { get; set; }
    public int NutrientMl { get; set; }
}

public record ProductDto(
    string Id,
    string Category,
    string Price,
    string? CompareAt,
    string? PackKey,
    string Image,
    string ImageFit,
    bool Featured,
    bool Active,
    IReadOnlyList<ProductColorDto> Colors,
    IReadOnlyDictionary<string, ProductLocaleDto> Locales,
    IReadOnlyList<string> Gallery,
    string? VideoUrl,
    string? VideoPoster,
    ProductKitDto? Kit = null);

public record ProductsByCategoryDto(
    IReadOnlyList<ProductDto> Gardens,
    IReadOnlyList<ProductDto> Pods,
    IReadOnlyList<ProductDto> Consumables,
    IReadOnlyList<ProductDto> Accessories);

/// <summary>Frontend-compatible product payload (id, € prices, category string).</summary>
public record AdminProductUpsertRequest
{
    public string Id { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Price { get; init; } = string.Empty;
    public string? CompareAt { get; init; }
    public string? PackKey { get; init; }
    public string Image { get; init; } = string.Empty;
    public string ImageFit { get; init; } = "cover";
    public bool Featured { get; init; }
    public bool Active { get; init; } = true;
    public IReadOnlyList<string>? Gallery { get; init; }
    public string? VideoUrl { get; init; }
    public string? VideoPoster { get; init; }
    public ProductKitDto? Kit { get; init; }
    public IReadOnlyList<ProductColorDto>? Colors { get; init; }
    public IReadOnlyDictionary<string, ProductLocaleDto> Locales { get; init; }
        = new Dictionary<string, ProductLocaleDto>();
}

public record SetProductActiveRequest(bool Active);
