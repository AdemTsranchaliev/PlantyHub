using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public class AdminDashboardController(AdminDashboardService dashboard) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Get(CancellationToken ct) =>
        Ok(await dashboard.GetDashboardAsync(ct));
}
