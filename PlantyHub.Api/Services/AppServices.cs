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
    public const decimal FreeShippingThreshold = 60m;
    public const decimal StandardShippingCost = 4.99m;

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

    public static CountryCode ParseCountry(string country) =>
        Enum.Parse<CountryCode>(country.Trim().ToUpperInvariant(), ignoreCase: true);

    public static ImageFit ParseImageFit(string fit) => fit.Trim().ToLowerInvariant() switch
    {
        "contain" => ImageFit.Contain,
        _ => ImageFit.Cover
    };

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
        _ => throw new ArgumentException($"Unknown order status: {status}")
    };

    public static CourierId ParseCourier(string courier) => courier.Trim().ToLowerInvariant() switch
    {
        "econt" => CourierId.Econt,
        "speedy" => CourierId.Speedy,
        "dhl" => CourierId.Dhl,
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

    public static string ToApi(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "pending",
        OrderStatus.Processing => "processing",
        OrderStatus.Shipped => "shipped",
        OrderStatus.Delivered => "delivered",
        OrderStatus.Cancelled => "cancelled",
        _ => status.ToString().ToLowerInvariant()
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
        _ => courier.ToString().ToLowerInvariant()
    };

    public static string ToApi(ImageFit fit) => fit switch
    {
        ImageFit.Cover => "cover",
        ImageFit.Contain => "contain",
        _ => fit.ToString().ToLowerInvariant()
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
