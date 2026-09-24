using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public static class PromoCodeRules
{
    public static string Normalize(string code) => code.Trim().ToUpperInvariant();

    public static decimal DiscountFor(PromoCode? promo, decimal subtotal)
    {
        if (promo is null || !promo.Active)
            throw new InvalidOperationException("invalid");
        if (promo.StartsAt is not null && promo.StartsAt > DateTime.UtcNow)
            throw new InvalidOperationException("not_started");
        if (promo.ExpiresAt is not null && promo.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("expired");
        if (promo.UsageLimit is not null && promo.UsedCount >= promo.UsageLimit)
            throw new InvalidOperationException("used_up");
        if (promo.MinSubtotal is not null && subtotal < promo.MinSubtotal)
            throw new InvalidOperationException("min_subtotal");
        if (promo.Amount <= 0)
            throw new InvalidOperationException("invalid");

        var discount = promo.Type == "fixed"
            ? promo.Amount
            : Math.Round(subtotal * promo.Amount / 100m, 2, MidpointRounding.AwayFromZero);
        return Math.Min(Math.Max(0m, discount), subtotal);
    }
}
