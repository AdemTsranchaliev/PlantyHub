using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/store")]
public class AdminStoreController(VatService vat) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<StoreVatSettingsDto>> Get(CancellationToken ct) =>
        Ok(await vat.GetSettingsAsync(ct));

    [HttpPut]
    public async Task<ActionResult<StoreVatSettingsDto>> Update([FromBody] UpdateStoreVatSettingsRequest request, CancellationToken ct) =>
        Ok(await vat.UpdateSettingsAsync(request, ct));

    [HttpGet("payments")]
    public async Task<ActionResult<StorePaymentsDto>> Payments(CancellationToken ct) =>
        Ok(await vat.GetPaymentsAsync(ct));

    [HttpPut("payments")]
    public async Task<ActionResult<StorePaymentsDto>> UpdatePayments([FromBody] UpdateStorePaymentsRequest request, CancellationToken ct) =>
        Ok(await vat.SetCardPaymentsAsync(request.CardEnabled, ct));
}
