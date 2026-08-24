using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/shipping")]
public class ShippingController(CourierRateService rates, CourierLocationService locations) : ControllerBase
{
    [HttpGet("countries")]
    public async Task<ActionResult<CourierLocationListDto>> Countries(
        [FromQuery] string courier = "econt",
        [FromQuery] bool refresh = false,
        CancellationToken ct = default)
    {
        if (!TryParse(courier, out var id)) return BadRequest();
        return Ok(await locations.GetCountriesAsync(id, refresh, ct));
    }

    [HttpGet("cities")]
    public async Task<ActionResult<CourierLocationListDto>> Cities(
        [FromQuery] string countryId,
        [FromQuery] string courier = "econt",
        [FromQuery] bool refresh = false,
        CancellationToken ct = default)
    {
        if (!TryParse(courier, out var id)) return BadRequest();
        return Ok(await locations.GetCitiesAsync(id, countryId ?? "", refresh, ct));
    }

    [HttpGet("offices")]
    public async Task<ActionResult<CourierOfficeListDto>> Offices(
        [FromQuery] string countryId,
        [FromQuery] string? cityId,
        [FromQuery] string? cityName,
        [FromQuery] string courier = "econt",
        [FromQuery] bool refresh = false,
        CancellationToken ct = default)
    {
        if (!TryParse(courier, out var id)) return BadRequest();
        return Ok(await locations.GetOfficesAsync(id, countryId ?? "", cityId, cityName, refresh, ct));
    }

    [HttpPost("quotes")]
    public async Task<ActionResult<ShippingQuotesDto>> Quotes([FromBody] ShippingQuoteRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.City) || string.IsNullOrWhiteSpace(request.Country))
            return BadRequest(new { message = "City and country are required." });
        request.IncludeUnavailable = false;
        var quotes = await rates.QuoteAsync(request, ct);
        return Ok(new ShippingQuotesDto(quotes));
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
