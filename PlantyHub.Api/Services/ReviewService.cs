using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class ReviewService(
    AppDbContext db,
    EmailTemplateService templates,
    IR2StorageService storage,
    IOptions<AppSettings> appOptions)
{
    public const string TemplateKey = "review-request";
    private const int MaxPhotos = 5;
    private const int MaxBodyLength = 2000;
    private const long MaxPhotoBytes = 8 * 1024 * 1024;

    private static readonly HashSet<string> PhotoTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    };

    public async Task<AdminReviewsDto> ListAsync(CancellationToken ct = default)
    {
        var reviews = await db.ProductReviews
            .Include(r => r.Product).ThenInclude(p => p.Translations)
            .OrderBy(r => r.Status == ReviewStatus.Pending ? 0 : 1)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        var requests = await db.ReviewRequests
            .Include(r => r.Product).ThenInclude(p => p.Translations)
            .OrderByDescending(r => r.SentAt)
            .ToListAsync(ct);

        return new AdminReviewsDto(
            reviews.Select(ToAdminReview).ToList(),
            requests.Select(ToAdminRequest).ToList());
    }

    public async Task<AdminReviewRequestDto> SendAsync(SendReviewRequestDto request, CancellationToken ct = default)
    {
        var slug = request.ProductSlug?.Trim() ?? "";
        var product = await db.Products
            .Include(p => p.Translations)
            .FirstOrDefaultAsync(p => p.Slug == slug, ct);
        if (product is null)
            throw new InvalidOperationException("product");

        var email = NormalizeEmail(request.Email);
        if (email is null)
            throw new InvalidOperationException("invalidEmail");

        var language = NormalizeLanguage(request.Language);
        var name = string.IsNullOrWhiteSpace(request.CustomerName)
            ? email.Split('@')[0]
            : request.CustomerName.Trim();
        if (name.Length > 200) name = name[..200];

        var orderId = await ResolveOrderId(request.OrderId, ct);

        var already = await db.ProductReviews.AnyAsync(r =>
            r.ProductId == product.Id
            && r.Email == email
            && r.Status != ReviewStatus.Hidden, ct);
        if (already)
            throw new InvalidOperationException("already");

        var open = await db.ReviewRequests
            .Include(r => r.Product).ThenInclude(p => p.Translations)
            .FirstOrDefaultAsync(r =>
                r.ProductId == product.Id
                && r.Email == email
                && r.CompletedAt == null, ct);

        if (open is null)
        {
            open = new ReviewRequest
            {
                Token = NewToken(),
                ProductId = product.Id,
                Product = product,
                OrderId = orderId,
                Email = email,
                CustomerName = name,
                Language = language,
                SentAt = DateTime.UtcNow,
            };
            db.ReviewRequests.Add(open);
        }
        else
        {
            open.CustomerName = name;
            open.Language = language;
            open.OrderId = orderId ?? open.OrderId;
            open.SentAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        await SendEmailAsync(open, ct);
        return ToAdminRequest(open);
    }

    public async Task<AdminReviewRequestDto> ResendAsync(Guid id, CancellationToken ct = default)
    {
        var request = await db.ReviewRequests
            .Include(r => r.Product).ThenInclude(p => p.Translations)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
        if (request is null)
            throw new InvalidOperationException("missing");
        if (request.CompletedAt is not null)
            throw new InvalidOperationException("already");

        request.SentAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await SendEmailAsync(request, ct);
        return ToAdminRequest(request);
    }

    public async Task<AdminReviewDto?> SetStatusAsync(Guid id, ReviewStatus status, CancellationToken ct = default)
    {
        var review = await db.ProductReviews
            .Include(r => r.Product).ThenInclude(p => p.Translations)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review is null) return null;
        review.Status = status;
        await db.SaveChangesAsync(ct);
        return ToAdminReview(review);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var review = await db.ProductReviews.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review is null) return false;
        db.ProductReviews.Remove(review);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<ReviewInviteDto?> GetInviteAsync(string token, CancellationToken ct = default)
    {
        var request = await FindRequest(token, ct);
        if (request is null) return null;
        return new ReviewInviteDto(
            ProductName(request.Product, request.Language),
            request.Product.Image,
            request.CustomerName,
            request.CompletedAt is not null);
    }

    public async Task<Guid> SubmitAsync(
        string token,
        int rating,
        string? body,
        string? authorName,
        IReadOnlyList<IFormFile> photos,
        CancellationToken ct = default)
    {
        var request = await FindRequest(token, ct);
        if (request is null)
            throw new InvalidOperationException("missing");
        if (request.CompletedAt is not null)
            throw new InvalidOperationException("already");
        if (rating is < 1 or > 5)
            throw new InvalidOperationException("rating");

        var text = (body ?? "").Trim();
        if (text.Length > MaxBodyLength)
            throw new InvalidOperationException("tooLong");

        var files = photos.Where(f => f.Length > 0).ToList();
        if (files.Count > MaxPhotos)
            throw new InvalidOperationException("photoLimit");
        if (files.Count > 0 && !storage.IsConfigured)
            throw new InvalidOperationException("storage");

        var urls = new List<string>();
        foreach (var file in files)
        {
            if (!PhotoTypes.Contains(file.ContentType))
                throw new InvalidOperationException("photoType");
            if (file.Length > MaxPhotoBytes)
                throw new InvalidOperationException("photoSize");

            await using var stream = file.OpenReadStream();
            var (url, _) = await storage.UploadAsync(stream, file.FileName, file.ContentType, ct);
            urls.Add(url);
        }

        var name = string.IsNullOrWhiteSpace(authorName) ? request.CustomerName : authorName.Trim();
        if (name.Length > 80) name = name[..80];

        var review = new ProductReview
        {
            ProductId = request.ProductId,
            OrderId = request.OrderId,
            AuthorName = name,
            Email = request.Email,
            Rating = rating,
            Body = text,
            PhotosJson = JsonSerializer.Serialize(urls),
            Status = ReviewStatus.Published,
            Language = request.Language,
            CreatedAt = DateTime.UtcNow,
        };
        db.ProductReviews.Add(review);
        request.CompletedAt = DateTime.UtcNow;
        request.ReviewId = review.Id;
        await db.SaveChangesAsync(ct);
        return review.Id;
    }

    public const int PublicPageSize = 8;

    public async Task<PublicReviewsDto> ForProductAsync(
        string slug,
        string? sort,
        int page,
        int? rating,
        bool summaryOnly,
        CancellationToken ct = default)
    {
        var empty = new PublicReviewsDto(0, 0, 0, 0, [0, 0, 0, 0, 0], 1, PublicPageSize, "newest", null, [], []);
        var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug, ct);
        if (product is null) return empty;

        var published = db.ProductReviews.AsNoTracking()
            .Where(r => r.ProductId == product.Id && r.Status == ReviewStatus.Published);

        var buckets = await published
            .GroupBy(r => r.Rating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var ratings = new int[5];
        foreach (var bucket in buckets)
        {
            if (bucket.Rating is >= 1 and <= 5)
                ratings[bucket.Rating - 1] = bucket.Count;
        }

        var count = ratings.Sum();
        if (count == 0) return empty;

        var average = Math.Round(ratings.Select((n, i) => (i + 1) * (double)n).Sum() / count, 1);
        var withPhotos = await published.CountAsync(r => r.PhotosJson.Length > 2, ct);
        var normalized = sort is "highest" or "lowest" or "photos" ? sort : "newest";
        var star = rating is >= 1 and <= 5 ? rating : null;

        if (summaryOnly)
            return new PublicReviewsDto(average, count, count, withPhotos, ratings, 1, PublicPageSize, normalized, star, [], []);

        var filtered = published.AsQueryable();
        if (star is int selected)
            filtered = filtered.Where(r => r.Rating == selected);
        if (normalized == "photos")
            filtered = filtered.Where(r => r.PhotosJson.Length > 2);

        var filteredCount = star is null && normalized != "photos"
            ? count
            : await filtered.CountAsync(ct);

        var pages = Math.Max(1, (int)Math.Ceiling(filteredCount / (double)PublicPageSize));
        page = Math.Clamp(page, 1, pages);

        var ordered = normalized switch
        {
            "highest" => filtered.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            "lowest" => filtered.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            _ => filtered.OrderByDescending(r => r.CreatedAt),
        };

        var rows = await ordered
            .Skip((page - 1) * PublicPageSize)
            .Take(PublicPageSize)
            .Select(r => new { r.Id, r.AuthorName, r.Rating, r.Body, r.PhotosJson, r.CreatedAt })
            .ToListAsync(ct);

        var photoRows = await published
            .Where(r => r.PhotosJson.Length > 2)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => r.PhotosJson)
            .Take(16)
            .ToListAsync(ct);

        var photos = new List<string>(16);
        foreach (var json in photoRows)
        {
            var first = ReadPhotos(json).FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(first))
                photos.Add(first);
        }

        return new PublicReviewsDto(
            average,
            count,
            filteredCount,
            withPhotos,
            ratings,
            page,
            PublicPageSize,
            normalized,
            star,
            photos,
            rows.Select(r => new PublicReviewDto(
                r.Id,
                r.AuthorName,
                r.Rating,
                r.Body,
                ReadPhotos(r.PhotosJson),
                r.CreatedAt)).ToList());
    }

    private async Task<ReviewRequest?> FindRequest(string token, CancellationToken ct) =>
        await db.ReviewRequests
            .Include(r => r.Product).ThenInclude(p => p.Translations)
            .FirstOrDefaultAsync(r => r.Token == token, ct);

    private async Task SendEmailAsync(ReviewRequest request, CancellationToken ct)
    {
        var frontend = appOptions.Value.FrontendUrl.TrimEnd('/');
        var reviewUrl = frontend + LocaleSeo.PublicPath(request.Language, $"/review/{request.Token}");
        try
        {
            await templates.SendTemplatedAsync(TemplateKey, request.Email, new Dictionary<string, string>
            {
                ["name"] = EmailTemplateService.HtmlEncode(request.CustomerName),
                ["productName"] = EmailTemplateService.HtmlEncode(ProductName(request.Product, request.Language)),
                ["reviewUrl"] = reviewUrl,
            }, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            throw new InvalidOperationException("emailFailed");
        }
    }

    private async Task<string?> ResolveOrderId(string? orderId, CancellationToken ct)
    {
        var id = orderId?.Trim();
        if (string.IsNullOrEmpty(id)) return null;
        var exists = await db.Orders.AnyAsync(o => o.Id == id, ct);
        return exists ? id : null;
    }

    private static AdminReviewDto ToAdminReview(ProductReview review) =>
        new(
            review.Id,
            review.Product.Slug,
            ProductName(review.Product, "bg"),
            review.OrderId,
            review.AuthorName,
            review.Email,
            review.Rating,
            review.Body,
            ReadPhotos(review.PhotosJson),
            review.Status,
            review.Language,
            review.CreatedAt);

    private static AdminReviewRequestDto ToAdminRequest(ReviewRequest request) =>
        new(
            request.Id,
            request.Product.Slug,
            ProductName(request.Product, "bg"),
            request.OrderId,
            request.Email,
            request.CustomerName,
            request.Language,
            request.SentAt,
            request.CompletedAt,
            request.CompletedAt is not null);

    private static string ProductName(Product product, string language)
    {
        var translation = product.Translations.FirstOrDefault(t => t.Language == language)
            ?? product.Translations.FirstOrDefault(t => t.Language == "bg")
            ?? product.Translations.FirstOrDefault();
        return string.IsNullOrWhiteSpace(translation?.Name) ? product.Slug : translation!.Name;
    }

    private static List<string> ReadPhotos(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static string? NormalizeEmail(string? email)
    {
        var value = email?.Trim().ToLowerInvariant() ?? "";
        if (value.Length is < 3 or > 256 || !value.Contains('@') || value.Contains(' '))
            return null;
        return value;
    }

    private static string NormalizeLanguage(string? language)
    {
        var value = language?.Trim().ToLowerInvariant();
        return value is "bg" or "en" or "de" or "fr" ? value : "bg";
    }

    private static string NewToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
}
