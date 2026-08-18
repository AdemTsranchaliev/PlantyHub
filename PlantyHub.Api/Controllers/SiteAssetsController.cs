using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/site-assets")]
public class SiteAssetsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SiteAssetsDto>> Get(CancellationToken ct)
    {
        var assets = await db.SiteAssets.FirstOrDefaultAsync(a => a.Id == 1, ct);
        if (assets is null)
            return Ok(new SiteAssetsDto(new()));

        return Ok(Map(assets));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut]
    public async Task<ActionResult<SiteAssetsDto>> Update(UpdateSiteAssetsRequest request, CancellationToken ct)
    {
        var assets = await db.SiteAssets.FirstOrDefaultAsync(a => a.Id == 1, ct);
        if (assets is null)
        {
            assets = new SiteAssets { Id = 1 };
            db.SiteAssets.Add(assets);
        }

        if (request.Images is not null)
            assets.ImagesJson = JsonSerializer.Serialize(request.Images, JsonDefaults.Options);

        assets.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(Map(assets));
    }

    private static SiteAssetsDto Map(SiteAssets assets) =>
        new(JsonSerializer.Deserialize<Dictionary<string, string>>(assets.ImagesJson, JsonDefaults.Options) ?? new());
}
