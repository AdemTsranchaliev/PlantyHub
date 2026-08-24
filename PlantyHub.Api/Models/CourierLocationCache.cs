namespace PlantyHub.Api.Models;

public class CourierLocationCache
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Json { get; set; } = "[]";
    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}
