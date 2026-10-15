using System.Net;
using System.Text;

namespace PlantyHub.Api.Services;

public static class LocaleSeo
{
    public const string DefaultLanguage = "bg";

    public static readonly string[] Languages = ["bg", "en", "de", "fr"];

    private static readonly string[] PrivatePrefixes =
    [
        "/cart", "/checkout", "/login", "/register", "/forgot-password",
        "/reset-password", "/verify-email", "/account", "/order",
    ];

    private static readonly Dictionary<string, (string Title, string Description)> Copy = new()
    {
        ["en"] = (
            "PlantyHub — Smart Hydroponic Indoor Garden",
            "PlantyHub Home Garden: 12-pod smart hydroponic kit with LED grow lights and automatic irrigation. Grow basil, mint, lettuce and more at home."),
        ["bg"] = (
            "PlantyHub — Умна хидропонна градина за дома",
            "PlantyHub Home Garden: умна хидропонна градина с 12 капсули, LED осветление и автоматично поливане. Отглеждай босилек, мента, маруля и други у дома."),
        ["de"] = (
            "PlantyHub — Smarter Hydrokultur-Garten für zu Hause",
            "PlantyHub Home Garden: smarter Hydrokultur-Garten mit 12 Pods, LED-Licht und automatischer Bewässerung. Basilikum, Minze, Salat und mehr zu Hause anbauen."),
        ["fr"] = (
            "PlantyHub — Jardin hydroponique intelligent",
            "PlantyHub Home Garden : jardin hydroponique intelligent à 12 capsules, éclairage LED et arrosage automatique. Basilic, menthe, laitue et plus, à la maison."),
    };

    public static readonly string[] IndexablePaths =
    [
        "/", "/homegarder-one", "/pods", "/accessories", "/about", "/blog",
        "/contact", "/faq", "/learn", "/how-it-works", "/privacy", "/cookies", "/terms",
    ];

    public static bool IsLanguage(string? value) =>
        value is not null && Languages.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static bool NeedsLocaleRedirect(PathString path)
    {
        var value = path.Value ?? "/";
        if (value.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("/health", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("/admin", StringComparison.OrdinalIgnoreCase) ||
            value is "/robots.txt" or "/sitemap.xml")
            return false;

        if (Path.HasExtension(value)) return false;

        var segment = value.Split('/', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return !IsLanguage(segment);
    }

    public static string PickLanguage() => DefaultLanguage;

    public static string Apply(string html, HttpRequest request)
    {
        var (locale, pagePath) = Split(request.Path.Value ?? "/");
        if (!Copy.TryGetValue(locale, out var copy)) copy = Copy[DefaultLanguage];

        var origin = $"{request.Scheme}://{request.Host}";
        var canonicalPath = pagePath == "/" ? $"/{locale}/" : $"/{locale}{pagePath}";
        var canonical = origin + canonicalPath;
        var robots = IsPrivate(pagePath) ? "noindex, follow" : "index, follow";

        var links = new StringBuilder();
        links.Append($"<link rel=\"canonical\" href=\"{WebUtility.HtmlEncode(canonical)}\" />");
        foreach (var language in Languages)
        {
            var href = origin + (pagePath == "/" ? $"/{language}/" : $"/{language}{pagePath}");
            links.Append($"<link rel=\"alternate\" hreflang=\"{language}\" href=\"{WebUtility.HtmlEncode(href)}\" />");
        }

        var xDefault = origin + LocalizedPath(DefaultLanguage, pagePath);
        links.Append($"<link rel=\"alternate\" hreflang=\"x-default\" href=\"{WebUtility.HtmlEncode(xDefault)}\" />");
        links.Append($"<meta name=\"robots\" content=\"{robots}\" />");

        html = html.Replace("<html lang=\"bg\">", $"<html lang=\"{locale}\">", StringComparison.Ordinal);
        html = html.Replace(
            "<title>PlantyHub — Умна хидропонна градина за дома</title>",
            $"<title>{WebUtility.HtmlEncode(copy.Title)}</title>",
            StringComparison.Ordinal);
        html = html.Replace(
            "content=\"PlantyHub Home Garden: умна хидропонна градина с 12 капсули, LED осветление и автоматично поливане. Отглеждай босилек, мента, маруля и други у дома.\"",
            $"content=\"{WebUtility.HtmlEncode(copy.Description)}\"",
            StringComparison.Ordinal);
        html = html.Replace("</head>", $"{links}</head>", StringComparison.Ordinal);
        return html;
    }

    public static string Sitemap(HttpRequest request)
    {
        var origin = $"{request.Scheme}://{request.Host}";
        var xml = new StringBuilder();
        xml.Append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xml.Append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">");

        foreach (var path in IndexablePaths)
        {
            foreach (var language in Languages)
            {
                var loc = origin + (path == "/" ? $"/{language}/" : $"/{language}{path}");
                xml.Append("<url><loc>").Append(WebUtility.HtmlEncode(loc)).Append("</loc>");
                foreach (var alt in Languages)
                {
                    var href = origin + (path == "/" ? $"/{alt}/" : $"/{alt}{path}");
                    xml.Append("<xhtml:link rel=\"alternate\" hreflang=\"").Append(alt)
                        .Append("\" href=\"").Append(WebUtility.HtmlEncode(href)).Append("\" />");
                }

                var xDefault = origin + LocalizedPath(DefaultLanguage, path);
                xml.Append("<xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"")
                    .Append(WebUtility.HtmlEncode(xDefault)).Append("\" />");
                xml.Append("</url>");
            }
        }

        xml.Append("</urlset>");
        return xml.ToString();
    }

    public static string Robots(HttpRequest request)
    {
        var origin = $"{request.Scheme}://{request.Host}";
        var text = new StringBuilder();
        text.AppendLine("User-agent: *");
        text.AppendLine("Allow: /");
        text.AppendLine("Disallow: /admin");
        foreach (var language in Languages)
        {
            foreach (var prefix in PrivatePrefixes)
                text.AppendLine($"Disallow: /{language}{prefix}");
        }

        text.AppendLine($"Sitemap: {origin}/sitemap.xml");
        return text.ToString();
    }

    private static (string Locale, string PagePath) Split(string path)
    {
        var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var locale = parts.FirstOrDefault(IsLanguage)?.ToLowerInvariant() ?? DefaultLanguage;
        if (parts.Length == 0 || !IsLanguage(parts[0])) return (locale, path.StartsWith('/') ? path : "/" + path);

        var rest = "/" + string.Join('/', parts.Skip(1));
        if (rest == "/") return (locale, "/");
        return (locale, rest.TrimEnd('/'));
    }

    private static string LocalizedPath(string language, string pagePath) =>
        pagePath == "/" ? $"/{language}/" : $"/{language}{pagePath}";

    private static bool IsPrivate(string rest) =>
        PrivatePrefixes.Any(prefix => rest == prefix || rest.StartsWith(prefix + "/", StringComparison.OrdinalIgnoreCase));
}
