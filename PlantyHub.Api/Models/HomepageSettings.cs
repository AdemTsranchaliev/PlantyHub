namespace PlantyHub.Api.Models;

public class HomepageSettings
{
    public int Id { get; set; } = 1;
    public int LayoutVersion { get; set; } = 2;
    public string SectionsJson { get; set; } = "{}";
    public string TextsJson { get; set; } = "{}";
    public string ImagesJson { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
