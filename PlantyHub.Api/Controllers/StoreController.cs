using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/store")]
public class StoreController(VatService vat) : ControllerBase
{
    [HttpGet("payments")]
    public async Task<ActionResult<StorePaymentsDto>> Payments(CancellationToken ct) =>
        Ok(await vat.GetPaymentsAsync(ct));
}
