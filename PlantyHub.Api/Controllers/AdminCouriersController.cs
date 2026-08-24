using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/couriers")]
public class AdminCouriersController(CourierService couriers, CourierLocationService locations, CourierRateService rates) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CourierSettingsDto>> Get(CancellationToken ct) =>
        Ok(await couriers.GetAsync(ct));

    [HttpPut]
    public async Task<ActionResult<CourierSettingsDto>> Update([FromBody] UpdateCourierSettingsRequest request, CancellationToken ct) =>
        Ok(await couriers.UpdateAsync(request, ct));

    [HttpPost("calculate")]
    public async Task<ActionResult<ShippingQuotesDto>> Calculate([FromBody] ShippingQuoteRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.City) || string.IsNullOrWhiteSpace(request.Country))
            return BadRequest(new { message = "City and country are required." });
        request.IncludeUnavailable = true;
        var quotes = await rates.QuoteAsync(request, ct);
        return Ok(new ShippingQuotesDto(quotes));
    }

    [HttpGet("{courier}/countries")]
    public async Task<ActionResult<CourierLocationListDto>> Countries(string courier, [FromQuery] bool refresh, CancellationToken ct)
    {
        if (!TryParse(courier, out var id)) return BadRequest();
        return Ok(await locations.GetCountriesAsync(id, refresh, ct));
    }

    [HttpGet("{courier}/cities")]
    public async Task<ActionResult<CourierLocationListDto>> Cities(
        string courier,
        [FromQuery] string countryId,
        [FromQuery] bool refresh,
        CancellationToken ct)
    {
        if (!TryParse(courier, out var id)) return BadRequest();
        return Ok(await locations.GetCitiesAsync(id, countryId ?? "", refresh, ct));
    }

    [HttpGet("{courier}/offices")]
    public async Task<ActionResult<CourierOfficeListDto>> Offices(
        string courier,
        [FromQuery] string countryId,
        [FromQuery] string? cityId,
        [FromQuery] string? cityName,
        [FromQuery] bool refresh,
        CancellationToken ct)
    {
        if (!TryParse(courier, out var id)) return BadRequest();
        return Ok(await locations.GetOfficesAsync(id, countryId ?? "", cityId, cityName, refresh, ct));
    }

    static bool TryParse(string courier, out Models.CourierId id)
    {
        try
        {
            id = EnumMapper.ParseCourier(courier);
            return true;
        }
        catch (ArgumentException)
        {
            id = default;
            return false;
        }
    }
}
