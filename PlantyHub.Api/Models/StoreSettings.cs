namespace PlantyHub.Api.Models;

public class StoreSettings
{
    public int Id { get; set; } = 1;
    public string Json { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
