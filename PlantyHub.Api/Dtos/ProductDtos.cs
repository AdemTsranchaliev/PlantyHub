namespace PlantyHub.Api.Dtos;

public record ProductColorDto(string Id, string Hex);

public record ProductLocaleDto(string Name, string? Tagline, string? Description);

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
    IReadOnlyDictionary<string, ProductLocaleDto> Locales);

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
    public IReadOnlyList<ProductColorDto>? Colors { get; init; }
    public IReadOnlyDictionary<string, ProductLocaleDto> Locales { get; init; }
        = new Dictionary<string, ProductLocaleDto>();
}

public record SetProductActiveRequest(bool Active);
