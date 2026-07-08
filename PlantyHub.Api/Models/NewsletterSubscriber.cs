namespace PlantyHub.Api.Models;

public class NewsletterSubscriber
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    public bool Active { get; set; } = true;
}
