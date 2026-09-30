namespace PlantyHub.Api.Models;

public class ProductReview
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string? OrderId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Body { get; set; } = string.Empty;
    public string PhotosJson { get; set; } = "[]";
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public string Language { get; set; } = "bg";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ReviewRequest
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string? OrderId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Language { get; set; } = "bg";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public Guid? ReviewId { get; set; }
}
