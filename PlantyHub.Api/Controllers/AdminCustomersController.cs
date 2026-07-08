using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/customers")]
public class AdminCustomersController(CustomerService customers) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll(CancellationToken ct) =>
        Ok(await customers.GetAllAsync(ct));

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(string id, CancellationToken ct)
    {
        var customer = await customers.GetByIdAsync(id, ct);
        return customer is null ? NotFound() : Ok(customer);
    }
}
