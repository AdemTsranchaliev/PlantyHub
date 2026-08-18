namespace PlantyHub.Api.Models;

public class SiteAssets
{
    public int Id { get; set; } = 1;
    public string ImagesJson { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
