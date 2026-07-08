namespace PlantyHub.Api.Models;

public class Product
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public ProductCategory Category { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string? PackKey { get; set; }
    public string Image { get; set; } = string.Empty;
    public ImageFit ImageFit { get; set; } = ImageFit.Cover;
    public bool Featured { get; set; }
    public bool Active { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductTranslation> Translations { get; set; } = [];
    public ICollection<ProductColor> Colors { get; set; } = [];
}

public class ProductTranslation
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Language { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public string? Description { get; set; }
}

public class ProductColor
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ColorId { get; set; } = string.Empty;
    public string Hex { get; set; } = string.Empty;
}
