using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace PlantyHub.Api.Services;

public class R2Settings
{
    public const string SectionName = "R2";
    public string AccountId { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "plantyhub";
    public string PublicBaseUrl { get; set; } = string.Empty;
}

public interface IR2StorageService
{
    bool IsConfigured { get; }
    Task<(string Url, string Key)> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default);
}

public class R2StorageService : IR2StorageService, IDisposable
{
    private readonly R2Settings _settings;
    private readonly IAmazonS3? _client;

    public R2StorageService(IOptions<R2Settings> options)
    {
        _settings = options.Value;
        if (IsConfigured)
        {
            var config = new AmazonS3Config
            {
                ServiceURL = $"https://{_settings.AccountId}.r2.cloudflarestorage.com",
                ForcePathStyle = true,
            };
            _client = new AmazonS3Client(
                new BasicAWSCredentials(_settings.AccessKeyId, _settings.SecretAccessKey),
                config);
        }
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_settings.AccountId)
        && !string.IsNullOrWhiteSpace(_settings.AccessKeyId)
        && !string.IsNullOrWhiteSpace(_settings.SecretAccessKey)
        && !string.IsNullOrWhiteSpace(_settings.BucketName)
        && !string.IsNullOrWhiteSpace(_settings.PublicBaseUrl);

    public async Task<(string Url, string Key)> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        if (_client is null || !IsConfigured)
            throw new InvalidOperationException("Cloudflare R2 is not configured.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || ext.Length > 8)
            ext = contentType switch
            {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                "image/gif" => ".gif",
                "video/mp4" => ".mp4",
                "video/webm" => ".webm",
                "video/quicktime" => ".mov",
                _ => ".bin",
            };

        var now = DateTime.UtcNow;
        var key = $"uploads/{now:yyyy}/{now:MM}/{Guid.NewGuid():N}{ext}";

        var request = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType,
            DisablePayloadSigning = true,
            DisableDefaultChecksumValidation = true,
        };
        request.Headers.CacheControl = "public, max-age=31536000, immutable";

        await _client.PutObjectAsync(request, ct);

        var baseUrl = _settings.PublicBaseUrl.TrimEnd('/');
        return ($"{baseUrl}/{key}", key);
    }

    public void Dispose() => _client?.Dispose();
}
