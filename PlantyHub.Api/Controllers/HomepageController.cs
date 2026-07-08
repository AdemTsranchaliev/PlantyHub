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
[Route("api/homepage")]
public class HomepageController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<HomepageStateDto>> Get(CancellationToken ct)
    {
        var settings = await db.HomepageSettings.FirstOrDefaultAsync(h => h.Id == 1, ct);
        if (settings is null)
            return Ok(new HomepageStateDto(2, new(), new(), new()));

        return Ok(Map(settings));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut]
    public async Task<ActionResult<HomepageStateDto>> Update(UpdateHomepageRequest request, CancellationToken ct)
    {
        var settings = await db.HomepageSettings.FirstOrDefaultAsync(h => h.Id == 1, ct);
        if (settings is null)
        {
            settings = new HomepageSettings { Id = 1 };
            db.HomepageSettings.Add(settings);
        }

        if (request.LayoutVersion.HasValue)
            settings.LayoutVersion = request.LayoutVersion.Value;
        if (request.Sections is not null)
            settings.SectionsJson = JsonSerializer.Serialize(request.Sections, JsonDefaults.Options);
        if (request.Texts is not null)
            settings.TextsJson = JsonSerializer.Serialize(request.Texts, JsonDefaults.Options);
        if (request.Images is not null)
            settings.ImagesJson = JsonSerializer.Serialize(request.Images, JsonDefaults.Options);

        settings.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(Map(settings));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("reset")]
    public async Task<ActionResult<HomepageStateDto>> Reset(CancellationToken ct)
    {
        var settings = await db.HomepageSettings.FirstOrDefaultAsync(h => h.Id == 1, ct);
        if (settings is null)
        {
            settings = new HomepageSettings { Id = 1 };
            db.HomepageSettings.Add(settings);
        }

        settings.LayoutVersion = 2;
        settings.SectionsJson = JsonSerializer.Serialize(new Dictionary<string, bool>
        {
            ["hero"] = true,
            ["product"] = true,
            ["howItWorks"] = true,
            ["podsGrid"] = true,
            ["socialProof"] = true,
            ["cta"] = true
        }, JsonDefaults.Options);
        settings.TextsJson = "{}";
        settings.ImagesJson = "{}";
        settings.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(Map(settings));
    }

    private static HomepageStateDto Map(HomepageSettings settings) =>
        new(
            settings.LayoutVersion,
            JsonSerializer.Deserialize<Dictionary<string, bool>>(settings.SectionsJson, JsonDefaults.Options) ?? new(),
            JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(settings.TextsJson, JsonDefaults.Options) ?? new(),
            JsonSerializer.Deserialize<Dictionary<string, string>>(settings.ImagesJson, JsonDefaults.Options) ?? new());
}
