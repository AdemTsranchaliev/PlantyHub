using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PlantyHub.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PlantyHub.Api.Services;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "PlantyHub";
    public string Audience { get; set; } = "PlantyHub";
    public int ExpiryMinutes { get; set; } = 60 * 24 * 7;
    /// <summary>Bump to invalidate every existing JWT.</summary>
    public int TokenVersion { get; set; } = 1;
}

public class JwtTokenService(IOptions<JwtSettings> options)
{
    private readonly JwtSettings _settings = options.Value;

    public string CreateToken(ApplicationUser user, IEnumerable<string> roles, int? expiryMinutes = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.FullName ?? user.Email ?? string.Empty),
            new("ver", _settings.TokenVersion.ToString(CultureInfo.InvariantCulture)),
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(expiryMinutes ?? _settings.ExpiryMinutes);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public static class PriceHelper
{
    public const decimal FreeShippingThreshold = 150m;
    public const decimal StandardShippingCost = 4.99m;
    public const decimal CodFeePercent = 1.65m;

    public static decimal CodFeeFor(decimal amount)
    {
        if (amount <= 0) return 0m;
        var rate = CodFeePercent / 100m;
        var guess = Math.Round(amount * rate / (1m - rate), 2, MidpointRounding.AwayFromZero);
        for (var delta = -3; delta <= 3; delta++)
        {
            var candidate = guess + delta * 0.01m;
            if (candidate < 0) continue;
            var charged = Math.Round((amount + candidate) * rate, 2, MidpointRounding.AwayFromZero);
            if (charged == candidate) return candidate;
        }
        return guess;
    }

    public static decimal ParseEuro(string value)
    {
        var normalized = new string(value.Where(c => char.IsDigit(c) || c is '.' or ',' or '-').ToArray())
            .Replace(',', '.');
        return decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : 0m;
    }

    public static string FormatEuro(decimal amount) =>
        $"€{amount.ToString("N2", CultureInfo.InvariantCulture)}";

    public static decimal CalcShipping(decimal subtotal) =>
        subtotal >= FreeShippingThreshold ? 0m : StandardShippingCost;
}

public static class EnumMapper
{
    public static ProductCategory ParseCategory(string category) => category.Trim().ToLowerInvariant() switch
    {
        "gardens" => ProductCategory.Gardens,
        "pods" => ProductCategory.Pods,
        "consumables" => ProductCategory.Consumables,
        "accessories" => ProductCategory.Accessories,
        _ => throw new ArgumentException($"Unknown product category: {category}")
    };

    public static string ParseCountry(string country)
    {
        var code = country.Trim().ToUpperInvariant();
        if (code.Length == 2 && code.All(char.IsAsciiLetter))
            return code;
        if (Enum.TryParse<CountryCode>(code, true, out var known))
            return known.ToString();
        throw new ArgumentException($"Unknown country: {country}");
    }

    public static ImageFit ParseImageFit(string fit) => fit.Trim().ToLowerInvariant() switch
    {
        "contain" => ImageFit.Contain,
        _ => ImageFit.Cover
    };

    public static GrowingDifficulty? ParseGrowingDifficulty(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Trim().ToLowerInvariant() switch
        {
            "easy" => GrowingDifficulty.Easy,
            "medium" => GrowingDifficulty.Medium,
            "hard" => GrowingDifficulty.Hard,
            _ => throw new ArgumentException($"Unknown growing difficulty: {value}")
        };
    }

    public static string Slugify(string value)
    {
        var sb = new System.Text.StringBuilder();
        var lastDash = false;
        foreach (var c in value.Trim().ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(c))
            {
                sb.Append(c);
                lastDash = false;
            }
            else if (!lastDash && sb.Length > 0)
            {
                sb.Append('-');
                lastDash = true;
            }
        }

        return sb.ToString().TrimEnd('-');
    }

    public static PaymentMethod ParsePaymentMethod(string method) => method.Trim().ToLowerInvariant() switch
    {
        "card" => PaymentMethod.Card,
        "cod" => PaymentMethod.Cod,
        "paypal" => PaymentMethod.Paypal,
        _ => throw new ArgumentException($"Unknown payment method: {method}")
    };

    public static OrderStatus ParseOrderStatus(string status) => status.Trim().ToLowerInvariant() switch
    {
        "pending" => OrderStatus.Pending,
        "processing" => OrderStatus.Processing,
        "shipped" => OrderStatus.Shipped,
        "delivered" => OrderStatus.Delivered,
        "cancelled" => OrderStatus.Cancelled,
        "returned" => OrderStatus.Returned,
        "claim" => OrderStatus.Claim,
        "replacement" => OrderStatus.Replacement,
        "replacementshipped" or "replacement_shipped" or "replacement-shipped" => OrderStatus.ReplacementShipped,
        "replaced" => OrderStatus.Replaced,
        "returnshipped" or "return_shipped" or "return-shipped" => OrderStatus.ReturnShipped,
        "returnedafterreview" or "returned_after_review" or "returned-after-review" => OrderStatus.ReturnedAfterReview,
        "unclaimed" or "notcollected" or "not_collected" or "непотърсена" => OrderStatus.Unclaimed,
        _ => throw new ArgumentException($"Unknown order status: {status}")
    };

    public static CourierId ParseCourier(string courier) => courier.Trim().ToLowerInvariant() switch
    {
        "econt" => CourierId.Econt,
        "speedy" => CourierId.Speedy,
        "dhl" => CourierId.Dhl,
        "boxnow" or "box-now" or "box_now" or "boxNow" => CourierId.Boxnow,
        _ => throw new ArgumentException($"Unknown courier: {courier}")
    };

    public static string ToApi(ProductCategory category) => category switch
    {
        ProductCategory.Gardens => "gardens",
        ProductCategory.Pods => "pods",
        ProductCategory.Consumables => "consumables",
        ProductCategory.Accessories => "accessories",
        _ => category.ToString().ToLowerInvariant()
    };

    public static string ToApi(CountryCode country) => country.ToString();

    public static string ToApiCountry(string country) =>
        string.IsNullOrWhiteSpace(country) ? "BG" : country.Trim().ToUpperInvariant();

    public static string ToApi(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "pending",
        OrderStatus.Processing => "processing",
        OrderStatus.Shipped => "shipped",
        OrderStatus.Delivered => "delivered",
        OrderStatus.Cancelled => "cancelled",
        OrderStatus.Returned => "returned",
        OrderStatus.Claim => "claim",
        OrderStatus.Replacement => "replacement",
        OrderStatus.ReplacementShipped => "replacementShipped",
        OrderStatus.Replaced => "replaced",
        OrderStatus.ReturnShipped => "returnShipped",
        OrderStatus.ReturnedAfterReview => "returnedAfterReview",
        OrderStatus.Unclaimed => "unclaimed",
        _ => status.ToString().ToLowerInvariant()
    };

    public static bool CanChangeStatus(OrderStatus from, OrderStatus to) =>
        from != to && NextStatuses(from).Contains(to);

    public static OrderStatus[] NextStatuses(OrderStatus from) => from switch
    {
        OrderStatus.Pending => [OrderStatus.Processing, OrderStatus.Cancelled],
        OrderStatus.Processing => [OrderStatus.Shipped, OrderStatus.Cancelled],
        OrderStatus.Shipped => [OrderStatus.Delivered, OrderStatus.ReturnedAfterReview, OrderStatus.Unclaimed],
        OrderStatus.Delivered => [OrderStatus.Returned, OrderStatus.Claim],
        OrderStatus.ReturnedAfterReview => [OrderStatus.Replacement],
        OrderStatus.Unclaimed => [OrderStatus.Replacement],
        OrderStatus.Returned => [OrderStatus.Claim],
        OrderStatus.Claim => [OrderStatus.Returned],
        OrderStatus.ReturnShipped => [OrderStatus.Replacement],
        OrderStatus.Replacement => [OrderStatus.Cancelled],
        OrderStatus.ReplacementShipped => [OrderStatus.Replaced, OrderStatus.ReturnedAfterReview, OrderStatus.Unclaimed],
        OrderStatus.Replaced => [OrderStatus.Claim, OrderStatus.Returned],
        _ => [],
    };

    public static string ToApi(PaymentMethod method) => method switch
    {
        PaymentMethod.Card => "card",
        PaymentMethod.Cod => "cod",
        PaymentMethod.Paypal => "paypal",
        _ => method.ToString().ToLowerInvariant()
    };

    public static string ToApi(CourierId courier) => courier switch
    {
        CourierId.Econt => "econt",
        CourierId.Speedy => "speedy",
        CourierId.Dhl => "dhl",
        CourierId.Boxnow => "boxnow",
        _ => courier.ToString().ToLowerInvariant()
    };

    public static string ToApi(ImageFit fit) => fit switch
    {
        ImageFit.Cover => "cover",
        ImageFit.Contain => "contain",
        _ => fit.ToString().ToLowerInvariant()
    };

    public static string? ToApi(GrowingDifficulty? difficulty) => difficulty switch
    {
        GrowingDifficulty.Easy => "easy",
        GrowingDifficulty.Medium => "medium",
        GrowingDifficulty.Hard => "hard",
        _ => null
    };
}

public static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
}
