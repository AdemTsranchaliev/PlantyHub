using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/products")]
public class AdminProductsController(ProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ProductsByCategoryDto>> GetAll(CancellationToken ct)
    {
        var items = await products.GetAllAsync(ct);
        return Ok(ProductMapper.GroupByCategory(items));
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetByCategory(string category, CancellationToken ct)
    {
        try
        {
            var items = await products.GetByCategoryAsync(EnumMapper.ParseCategory(category), activeOnly: false, ct);
            return Ok(items.Select(ProductMapper.ToDto).ToList());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var product = await products.GetBySlugAsync(slug, ct);
        return product is null ? NotFound() : Ok(ProductMapper.ToDto(product));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] AdminProductUpsertRequest request, CancellationToken ct)
    {
        try
        {
            var product = await products.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetBySlug), new { slug = product.Slug }, ProductMapper.ToDto(product));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{slug}")]
    public async Task<ActionResult<ProductDto>> Update(string slug, [FromBody] AdminProductUpsertRequest request, CancellationToken ct)
    {
        try
        {
            var product = await products.UpdateAsync(slug, request, ct);
            return product is null ? NotFound() : Ok(ProductMapper.ToDto(product));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{slug}/active")]
    public async Task<ActionResult<ProductDto>> SetActive(string slug, [FromBody] SetProductActiveRequest request, CancellationToken ct)
    {
        var product = await products.SetActiveAsync(slug, request.Active, ct);
        return product is null ? NotFound() : Ok(ProductMapper.ToDto(product));
    }

    [HttpDelete("{slug}")]
    public async Task<IActionResult> Delete(string slug, CancellationToken ct)
    {
        var deleted = await products.DeleteAsync(slug, ct);
        return deleted ? NoContent() : NotFound();
    }
}
