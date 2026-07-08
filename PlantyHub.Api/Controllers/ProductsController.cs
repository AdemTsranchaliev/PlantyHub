using Microsoft.AspNetCore.Mvc;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ProductsByCategoryDto>> GetAll(CancellationToken ct)
    {
        var items = await products.GetAllActiveAsync(ct);
        return Ok(ProductMapper.GroupByCategory(items));
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetByCategory(string category, CancellationToken ct)
    {
        try
        {
            var items = await products.GetByCategoryAsync(EnumMapper.ParseCategory(category), activeOnly: true, ct);
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
        if (product is null || !product.Active)
            return NotFound();

        return Ok(ProductMapper.ToDto(product));
    }
}
