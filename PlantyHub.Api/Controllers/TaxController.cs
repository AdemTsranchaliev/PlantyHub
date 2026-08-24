using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/tax")]
public class TaxController(VatService vat) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<VatQuoteDto>> Quote(
        [FromQuery] string country,
        [FromQuery] decimal subtotal,
        [FromQuery] decimal shipping = 0,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(country))
            return BadRequest(new { message = "Country is required." });
        return Ok(await vat.QuoteAsync(country, subtotal, shipping, ct));
    }
}
