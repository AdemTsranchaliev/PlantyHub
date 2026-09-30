using PlantyHub.Api.Models;

namespace PlantyHub.Api.Dtos;

public record AdminReviewsDto(
    IReadOnlyList<AdminReviewDto> Reviews,
    IReadOnlyList<AdminReviewRequestDto> Requests);

public record AdminReviewDto(
    Guid Id,
    string ProductSlug,
    string ProductName,
    string? OrderId,
    string AuthorName,
    string Email,
    int Rating,
    string Body,
    IReadOnlyList<string> Photos,
    ReviewStatus Status,
    string Language,
    DateTime CreatedAt);

public record AdminReviewRequestDto(
    Guid Id,
    string ProductSlug,
    string ProductName,
    string? OrderId,
    string Email,
    string CustomerName,
    string Language,
    DateTime SentAt,
    DateTime? CompletedAt,
    bool Completed);

public record SendReviewRequestDto(
    string ProductSlug,
    string Email,
    string? CustomerName,
    string? OrderId,
    string? Language);

public record UpdateReviewStatusRequest(ReviewStatus Status);

public record PublicReviewsDto(
    double Average,
    int Count,
    int Filtered,
    int WithPhotos,
    IReadOnlyList<int> Ratings,
    int Page,
    int PageSize,
    string Sort,
    int? Rating,
    IReadOnlyList<string> Photos,
    IReadOnlyList<PublicReviewDto> Items);

public record PublicReviewDto(
    Guid Id,
    string AuthorName,
    int Rating,
    string Body,
    IReadOnlyList<string> Photos,
    DateTime CreatedAt);

public record ReviewInviteDto(
    string ProductName,
    string ProductImage,
    string CustomerName,
    bool Completed);
