namespace PlantyHub.Api.Dtos;

public record ContactInquiryRequest(
    string Name,
    string Email,
    string Subject,
    string Message,
    string? OrderNumber = null);
