namespace PlantyHub.Api.Services;

public static class MediaUrls
{
    public const string PublicBase = "https://media.plantyhub.com";

    public static string Resolve(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return url ?? string.Empty;

        var value = url.Trim();
        if (value.StartsWith("data:", StringComparison.OrdinalIgnoreCase)
            || value.StartsWith("blob:", StringComparison.OrdinalIgnoreCase)
            || value.Contains("/cdn-cgi/image/", StringComparison.OrdinalIgnoreCase))
            return value;

        if (Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            if (uri.Host.Equals("media.plantyhub.com", StringComparison.OrdinalIgnoreCase))
                return $"{PublicBase}{uri.AbsolutePath}";

            var path = StripDeployPrefix(uri.AbsolutePath);
            if (IsMediaPath(path))
                return $"{PublicBase}{path}";

            return value;
        }

        var relative = StripDeployPrefix(value.StartsWith('/') ? value : "/" + value);
        return IsMediaPath(relative) ? $"{PublicBase}{relative}" : value;
    }

    public static string? ResolveOrNull(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        var resolved = Resolve(url);
        return string.IsNullOrWhiteSpace(resolved) ? null : resolved;
    }

    public static Dictionary<string, string> ResolveMap(Dictionary<string, string>? images)
    {
        if (images is null || images.Count == 0) return [];
        return images.ToDictionary(
            pair => pair.Key,
            pair => Resolve(pair.Value),
            StringComparer.OrdinalIgnoreCase);
    }

    private static string StripDeployPrefix(string path)
    {
        if (path.StartsWith("/PlantyHub/", StringComparison.OrdinalIgnoreCase))
            return path["/PlantyHub".Length..];
        if (path.Equals("/PlantyHub", StringComparison.OrdinalIgnoreCase))
            return "/";
        return path;
    }

    private static bool IsMediaPath(string path)
    {
        var value = path.ToLowerInvariant();
        return value.StartsWith("/images/")
            || value.StartsWith("/videos/")
            || value.StartsWith("/uploads/")
            || value.StartsWith("/email/")
            || value is "/logo.png" or "/logo-icon.png" or "/logo-og.png" or "/logo-source.png"
                or "/favicon.png" or "/apple-touch-icon.png" or "/favicon.svg" or "/icons.svg";
    }
}
