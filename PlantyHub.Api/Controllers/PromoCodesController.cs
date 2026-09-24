using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

public record PromoUseDto(string OrderId, string CustomerName, decimal Discount, DateTime CreatedAt);

public record PromoCodeDto(
    Guid Id,
    string Code,
    string Type,
    decimal Amount,
    decimal? MinSubtotal,
    int? UsageLimit,
    int UsedCount,
    DateTime? StartsAt,
    DateTime? ExpiresAt,
    bool Active,
    IReadOnlyList<PromoUseDto> Uses);

public record UpsertPromoCodeRequest(
    string Code,
    string Type,
    decimal Amount,
    decimal? MinSubtotal,
    int? UsageLimit,
    DateTime? StartsAt,
    DateTime? ExpiresAt,
    bool Active);

public record ValidatePromoRequest(string Code, decimal Subtotal);

public record PromoQuoteDto(string Code, string Type, decimal Amount, decimal Discount);

[ApiController]
[Route("api/promo-codes")]
public class PromoCodesController(AppDbContext db) : ControllerBase
{
    [HttpPost("validate")]
    public async Task<ActionResult<PromoQuoteDto>> Validate(ValidatePromoRequest request, CancellationToken ct)
    {
        try
        {
            var promo = await FindAsync(request.Code, ct);
            var discount = PromoCodeRules.DiscountFor(promo, request.Subtotal);
            return Ok(ToQuote(promo!, discount));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PromoCodeDto>>> List(CancellationToken ct)
    {
        var rows = await db.PromoCodes.OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
        var uses = await LoadUsesAsync(rows.Select(p => p.Code).ToList(), ct);
        return Ok(rows.Select(p => ToDto(p, uses)).ToList());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<PromoCodeDto>> Create(UpsertPromoCodeRequest request, CancellationToken ct)
    {
        var code = PromoCodeRules.Normalize(request.Code);
        if (string.IsNullOrWhiteSpace(code))
            return BadRequest(new { message = "required" });
        if (await db.PromoCodes.AnyAsync(p => p.Code == code, ct))
            return Conflict(new { message = "exists" });

        var promo = new PromoCode
        {
            Code = code,
            Type = request.Type == "fixed" ? "fixed" : "percent",
            Amount = request.Amount,
            MinSubtotal = request.MinSubtotal,
            UsageLimit = request.UsageLimit,
            StartsAt = UtcDate(request.StartsAt),
            ExpiresAt = UtcEnd(request.ExpiresAt),
            Active = request.Active,
        };
        db.PromoCodes.Add(promo);
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(promo, []));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PromoCodeDto>> Update(Guid id, UpsertPromoCodeRequest request, CancellationToken ct)
    {
        var promo = await db.PromoCodes.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (promo is null) return NotFound();
        var code = PromoCodeRules.Normalize(request.Code);
        if (await db.PromoCodes.AnyAsync(p => p.Code == code && p.Id != id, ct))
            return Conflict(new { message = "exists" });

        if (promo.UsedCount == 0)
            promo.Code = code;
        promo.Type = request.Type == "fixed" ? "fixed" : "percent";
        promo.Amount = request.Amount;
        promo.MinSubtotal = request.MinSubtotal;
        promo.UsageLimit = request.UsageLimit;
        promo.StartsAt = UtcDate(request.StartsAt);
        promo.ExpiresAt = UtcEnd(request.ExpiresAt);
        promo.Active = request.Active;
        await db.SaveChangesAsync(ct);
        var uses = await LoadUsesAsync([promo.Code], ct);
        return Ok(ToDto(promo, uses));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var promo = await db.PromoCodes.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (promo is null) return NotFound();
        if (promo.UsedCount > 0)
            return Conflict(new { message = "used" });
        db.PromoCodes.Remove(promo);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    async Task<PromoCode?> FindAsync(string code, CancellationToken ct)
    {
        var normalized = PromoCodeRules.Normalize(code ?? "");
        return await db.PromoCodes.FirstOrDefaultAsync(p => p.Code == normalized, ct);
    }

    async Task<Dictionary<string, List<PromoUseDto>>> LoadUsesAsync(IReadOnlyList<string> codes, CancellationToken ct)
    {
        if (codes.Count == 0) return [];
        var rows = await db.Orders.AsNoTracking()
            .Where(o => o.PromoCode != null && codes.Contains(o.PromoCode))
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new { o.PromoCode, o.Id, o.CustomerName, o.Discount, o.CreatedAt })
            .ToListAsync(ct);
        return rows
            .GroupBy(o => o.PromoCode!)
            .ToDictionary(
                g => g.Key,
                g => g.Select(o => new PromoUseDto(o.Id, o.CustomerName, o.Discount, o.CreatedAt)).ToList());
    }

    static DateTime? UtcDate(DateTime? value) =>
        value is null ? null : DateTime.SpecifyKind(value.Value.Date, DateTimeKind.Utc);

    static DateTime? UtcEnd(DateTime? value) =>
        value is null ? null : DateTime.SpecifyKind(value.Value.Date, DateTimeKind.Utc).AddDays(1).AddSeconds(-1);

    static PromoCodeDto ToDto(PromoCode promo, Dictionary<string, List<PromoUseDto>> uses) =>
        new(
            promo.Id,
            promo.Code,
            promo.Type,
            promo.Amount,
            promo.MinSubtotal,
            promo.UsageLimit,
            promo.UsedCount,
            promo.StartsAt,
            promo.ExpiresAt,
            promo.Active,
            uses.TryGetValue(promo.Code, out var list) ? list : []);

    static PromoQuoteDto ToQuote(PromoCode promo, decimal discount) =>
        new(promo.Code, promo.Type, promo.Amount, discount);
}
