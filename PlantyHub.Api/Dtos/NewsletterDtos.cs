namespace PlantyHub.Api.Dtos;

public record NewsletterSubscribeRequest(string Email);

public record NewsletterStatsDto(int TotalSubscribers);
