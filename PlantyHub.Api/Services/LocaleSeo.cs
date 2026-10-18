using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public static class LocaleSeo
{
    public const string DefaultLanguage = "bg";
    public const string OgImage = "https://plantyhub.com/logo-wordmark.png";
    public const int OgImageWidth = 1200;
    public const int OgImageHeight = 630;

    public static readonly string[] Languages = ["bg", "en", "de", "fr"];

    /// <summary>Languages linked in the UI. The others redirect here so crawlers never index a JavaScript bounce.</summary>
    public static readonly string[] IndexableLanguages = ["bg", "en"];

    private static readonly string[] PrivatePrefixes =
    [
        "/cart", "/checkout", "/login", "/register", "/forgot-password",
        "/reset-password", "/verify-email", "/account", "/order", "/review",
    ];

    private static readonly (string Section, string[] Topics)[] Lessons =
    [
        ("start", ["box", "hydro", "firstRun", "water"]),
        ("grow", ["lamp", "solution", "pods", "place"]),
        ("harvest", ["weeks", "harvest", "sprout", "cycle"]),
        ("care", ["clean", "trouble", "away", "safety"]),
        ("plants", ["basil", "parsley", "lettuce", "arugula", "mint"]),
    ];

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private sealed record PageCopy(string Title, string Description, string Kind = "website", string? Published = null);

    public readonly record struct SeoProductRef(string Slug, ProductCategory Category, DateTime UpdatedAt);

    public sealed class SeoProduct
    {
        public required string Name { get; init; }
        public required string Description { get; init; }
        public required decimal Price { get; init; }
        public required string Image { get; init; }
        public required ProductCategory Category { get; init; }
    }

    public static bool IsLanguage(string? value) =>
        value is not null && Languages.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static bool IsIndexableLanguage(string? value) =>
        value is not null && IndexableLanguages.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static string? RedirectTarget(PathString path)
    {
        var value = path.Value ?? "/";
        if (IsExempt(value)) return null;

        var parts = value.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return null;

        if (IsLanguage(parts[0]) && (parts[0].Equals(DefaultLanguage, StringComparison.OrdinalIgnoreCase) || !IsIndexableLanguage(parts[0])))
        {
            var rest = CanonicalTail(parts.Skip(1));
            return rest.Length == 0 ? "/" : "/" + string.Join('/', rest);
        }

        if (!IsLanguage(parts[0]))
        {
            var rest = CanonicalTail(parts);
            var canonical = rest.Length == 0 ? "/" : "/" + string.Join('/', rest);
            return string.Equals(value, canonical, StringComparison.Ordinal) ? null : canonical;
        }

        var locale = parts[0].ToLowerInvariant();
        var tail = CanonicalTail(parts.Skip(1));
        var localized = tail.Length == 0 ? $"/{locale}/" : $"/{locale}/{string.Join('/', tail)}";
        return string.Equals(value, localized, StringComparison.Ordinal) ? null : localized;
    }

    /// <summary>Storefront path. Bulgarian has no prefix; other languages use /en, /de, /fr.</summary>
    public static string PublicPath(string? language, string pagePath)
    {
        var locale = IsIndexableLanguage(language) ? language!.ToLowerInvariant() : DefaultLanguage;
        if (!pagePath.StartsWith('/')) pagePath = "/" + pagePath;
        return Localized(locale, pagePath);
    }

    public static async Task<SeoProduct?> LoadPageProductAsync(AppDbContext db, string path, CancellationToken ct)
    {
        var (locale, pagePath) = Split(path);
        if (!TryProductPath(pagePath, out var slug, out var category)) return null;

        try
        {
            var product = await db.Products.AsNoTracking()
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Active && p.Slug == slug && p.Category == category, ct);
            if (product is null) return null;

            var translation = PickTranslation(product, locale);
            var name = string.IsNullOrWhiteSpace(translation?.Name) ? slug : translation!.Name.Trim();
            var description = FirstText(translation?.Description, translation?.Tagline);
            var image = MediaUrls.Resolve(product.Image);
            if (!image.StartsWith("http", StringComparison.OrdinalIgnoreCase)) image = OgImage;

            return new SeoProduct
            {
                Name = name,
                Description = string.IsNullOrWhiteSpace(description) ? ProductFallback(locale, name) : Clip(description),
                Price = product.Price,
                Image = image,
                Category = category,
            };
        }
        catch
        {
            return null;
        }
    }

    public static async Task<IReadOnlyList<SeoProductRef>> LoadSitemapProductsAsync(AppDbContext db, CancellationToken ct)
    {
        return await db.Products.AsNoTracking()
            .Where(p => p.Active && (p.Category == ProductCategory.Pods || p.Category == ProductCategory.Accessories))
            .Select(p => new SeoProductRef(p.Slug, p.Category, p.UpdatedAt))
            .ToListAsync(ct);
    }

    public static string Apply(string html, HttpRequest request, SeoProduct? product)
    {
        var (locale, pagePath) = Split(request.Path.Value ?? "/");
        if (!IsIndexableLanguage(locale)) locale = DefaultLanguage;

        var origin = $"{request.Scheme}://{request.Host}";
        var copy = ResolveCopy(locale, pagePath, product);
        var indexable = copy is not null && !IsPrivate(pagePath) && (product is not null || IsKnown(pagePath) || pagePath == "/homegarder-one");
        if (product is null && TryProductPath(pagePath, out _, out _) && pagePath != "/homegarder-one")
            indexable = false;

        var robots = indexable ? "index, follow" : "noindex, follow";
        var title = copy?.Title ?? "PlantyHub";
        var description = copy?.Description ?? Pages["/"][DefaultLanguage].Description;
        var kind = product is not null && pagePath != "/homegarder-one" ? "product" : copy?.Kind ?? "website";
        if (pagePath == "/homegarder-one") kind = "product";
        var image = product?.Image ?? OgImage;
        var canonicalPath = CanonicalPath(request, locale, pagePath);
        var canonical = origin + canonicalPath;

        html = Regex.Replace(html, "<html lang=\"[^\"]*\">", $"<html lang=\"{locale}\">", RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<title>.*?</title>", $"<title>{Encode(title)}</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        html = Regex.Replace(
            html,
            "<meta\\s+name=\"description\"\\s+content=\"[^\"]*\"\\s*/?>",
            $"<meta name=\"description\" content=\"{Encode(description)}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<link\\s+rel=\"canonical\"[^>]*>\\s*", "", RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<link\\s+rel=\"alternate\"[^>]*>\\s*", "", RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<meta\\s+name=\"robots\"[^>]*>\\s*", "", RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<meta\\s+property=\"og:[^\"]+\"[^>]*>\\s*", "", RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<meta\\s+name=\"twitter:[^\"]+\"[^>]*>\\s*", "", RegexOptions.IgnoreCase);
        html = Regex.Replace(html, "<script[^>]*id=\"seo-jsonld\"[^>]*>.*?</script>\\s*", "", RegexOptions.IgnoreCase | RegexOptions.Singleline);

        var head = new StringBuilder();
        head.Append($"<link rel=\"canonical\" href=\"{Encode(canonical)}\" />");
        foreach (var language in IndexableLanguages)
        {
            var href = origin + CanonicalPath(request, language, pagePath);
            head.Append($"<link rel=\"alternate\" hreflang=\"{language}\" href=\"{Encode(href)}\" />");
        }

        head.Append($"<link rel=\"alternate\" hreflang=\"x-default\" href=\"{Encode(origin + CanonicalPath(request, DefaultLanguage, pagePath))}\" />");
        head.Append($"<meta name=\"robots\" content=\"{robots}\" />");
        head.Append("<meta property=\"og:site_name\" content=\"PlantyHub\" />");
        head.Append($"<meta property=\"og:type\" content=\"{kind switch { "article" => "article", "product" => "product", _ => "website" }}\" />");
        if (kind == "product" && product is not null)
        {
            head.Append("<meta property=\"product:price:currency\" content=\"EUR\" />");
            head.Append($"<meta property=\"product:price:amount\" content=\"{product.Price.ToString("0.00", CultureInfo.InvariantCulture)}\" />");
        }
        head.Append($"<meta property=\"og:locale\" content=\"{OgLocale(locale)}\" />");
        foreach (var language in IndexableLanguages.Where(language => language != locale))
            head.Append($"<meta property=\"og:locale:alternate\" content=\"{OgLocale(language)}\" />");
        head.Append($"<meta property=\"og:title\" content=\"{Encode(title)}\" />");
        head.Append($"<meta property=\"og:description\" content=\"{Encode(description)}\" />");
        head.Append($"<meta property=\"og:url\" content=\"{Encode(canonical)}\" />");
        head.Append($"<meta property=\"og:image\" content=\"{Encode(image)}\" />");
        if (image == OgImage)
        {
            head.Append($"<meta property=\"og:image:width\" content=\"{OgImageWidth}\" />");
            head.Append($"<meta property=\"og:image:height\" content=\"{OgImageHeight}\" />");
        }
        head.Append($"<meta property=\"og:image:alt\" content=\"{Encode(title)}\" />");
        head.Append("<meta name=\"twitter:card\" content=\"summary_large_image\" />");
        head.Append($"<meta name=\"twitter:title\" content=\"{Encode(title)}\" />");
        head.Append($"<meta name=\"twitter:description\" content=\"{Encode(description)}\" />");
        head.Append($"<meta name=\"twitter:image\" content=\"{Encode(image)}\" />");
        if (copy?.Published is not null)
            head.Append($"<meta property=\"article:published_time\" content=\"{copy.Published}\" />");

        var json = JsonSerializer.Serialize(BuildGraph(origin, canonical, locale, pagePath, title, description, image, copy, product), JsonOptions)
            .Replace("<", "\\u003c", StringComparison.Ordinal);
        head.Append($"<script type=\"application/ld+json\" id=\"seo-jsonld\">{json}</script>");

        return html.Replace("</head>", head + "</head>", StringComparison.Ordinal);
    }

    public static string Sitemap(HttpRequest request, IReadOnlyList<SeoProductRef> products)
    {
        var origin = $"{request.Scheme}://{request.Host}";
        var xml = new StringBuilder();
        xml.Append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xml.Append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">");

        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var path in IndexablePaths().Concat(products.Select(ProductPath).Where(path => path is not null)!))
        {
            if (!seen.Add(path!)) continue;
            var updated = products.FirstOrDefault(p => ProductPath(p) == path).UpdatedAt;
            var hasUpdated = products.Any(p => ProductPath(p) == path);
            AppendUrl(xml, origin, path!, hasUpdated ? updated : null);
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
        text.AppendLine("Disallow: /api");
        text.AppendLine("Disallow: /health");
        foreach (var prefix in PrivatePrefixes)
            text.AppendLine($"Disallow: {prefix}");
        foreach (var language in Languages.Where(language => language != DefaultLanguage))
        {
            foreach (var prefix in PrivatePrefixes)
                text.AppendLine($"Disallow: /{language}{prefix}");
        }

        text.AppendLine($"Sitemap: {origin}/sitemap.xml");
        return text.ToString();
    }

    private static IEnumerable<string> IndexablePaths()
    {
        yield return "/";
        yield return "/homegarder-one";
        yield return "/pods";
        yield return "/accessories";
        yield return "/about";
        yield return "/blog";
        foreach (var slug in Articles.Keys) yield return $"/blog/{slug}";
        yield return "/contact";
        yield return "/faq";
        yield return "/how-it-works";
        yield return "/start";
        yield return "/privacy";
        yield return "/cookies";
        yield return "/terms";
        yield return "/learn";
        foreach (var (section, topics) in Lessons)
        {
            yield return $"/learn?section={section}";
            foreach (var topic in topics)
                yield return $"/learn?section={section}&topic={topic}";
        }
    }

    private static void AppendUrl(StringBuilder xml, string origin, string path, DateTime? updated)
    {
        foreach (var language in IndexableLanguages)
        {
            var loc = origin + Localized(language, path);
            xml.Append("<url><loc>").Append(Encode(loc)).Append("</loc>");
            if (updated is not null)
                xml.Append("<lastmod>").Append(updated.Value.ToUniversalTime().ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)).Append("</lastmod>");
            foreach (var alt in IndexableLanguages)
            {
                var href = origin + Localized(alt, path);
                xml.Append("<xhtml:link rel=\"alternate\" hreflang=\"").Append(alt)
                    .Append("\" href=\"").Append(Encode(href)).Append("\" />");
            }

            xml.Append("<xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"")
                .Append(Encode(origin + Localized(DefaultLanguage, path))).Append("\" />");
            xml.Append("<priority>").Append(PriorityFor(path)).Append("</priority></url>");
        }
    }

    private static Dictionary<string, object?> BuildGraph(
        string origin,
        string canonical,
        string locale,
        string pagePath,
        string title,
        string description,
        string image,
        PageCopy? copy,
        SeoProduct? product)
    {
        var orgId = origin + "/#organization";
        var siteId = origin + "/#website";
        var nodes = new List<Dictionary<string, object?>>
        {
            new()
            {
                ["@type"] = "Organization",
                ["@id"] = orgId,
                ["name"] = "PlantyHub",
                ["legalName"] = "ДИДЖИТАЛ КИТ ЕООД",
                ["url"] = origin + "/",
                ["logo"] = new Dictionary<string, object?>
                {
                    ["@type"] = "ImageObject",
                    ["url"] = OgImage,
                    ["width"] = OgImageWidth,
                    ["height"] = OgImageHeight,
                },
                ["email"] = "support@plantyhub.com",
                ["address"] = new Dictionary<string, object?>
                {
                    ["@type"] = "PostalAddress",
                    ["streetAddress"] = "ул. Никифор П. Константинов",
                    ["postalCode"] = "4400",
                    ["addressLocality"] = "Пазарджик",
                    ["addressCountry"] = "BG",
                },
                ["areaServed"] = new Dictionary<string, object?> { ["@type"] = "Country", ["name"] = "Bulgaria" },
                ["sameAs"] = new[]
                {
                    "https://instagram.com/plantyhub.official",
                    "https://tiktok.com/@plantyhub.official",
                    "https://facebook.com/plantyhub",
                    "https://youtube.com/@plantyhub",
                    "https://linkedin.com/company/plantyhub",
                },
            },
            new()
            {
                ["@type"] = "WebSite",
                ["@id"] = siteId,
                ["name"] = "PlantyHub",
                ["url"] = origin + "/",
                ["inLanguage"] = IndexableLanguages,
                ["publisher"] = new Dictionary<string, object?> { ["@id"] = orgId },
            },
            new()
            {
                ["@type"] = "WebPage",
                ["@id"] = canonical + "#webpage",
                ["url"] = canonical,
                ["name"] = title,
                ["description"] = description,
                ["inLanguage"] = locale,
                ["isPartOf"] = new Dictionary<string, object?> { ["@id"] = siteId },
                ["about"] = new Dictionary<string, object?> { ["@id"] = orgId },
                ["primaryImageOfPage"] = image,
            },
            Breadcrumbs(origin, locale, pagePath, title, product),
        };

        if (product is not null)
        {
            nodes.Add(new Dictionary<string, object?>
            {
                ["@type"] = "Product",
                ["name"] = product.Name,
                ["description"] = pagePath == "/homegarder-one" ? description : product.Description,
                ["image"] = product.Image,
                ["sku"] = pagePath == "/homegarder-one" ? "homegarder-one" : pagePath.Split('/').Last(),
                ["brand"] = new Dictionary<string, object?> { ["@type"] = "Brand", ["name"] = "PlantyHub" },
                ["category"] = product.Category switch
                {
                    ProductCategory.Pods => "Seed pod",
                    ProductCategory.Accessories => "Garden accessory",
                    _ => "Hydroponic garden",
                },
                ["offers"] = new Dictionary<string, object?>
                {
                    ["@type"] = "Offer",
                    ["url"] = canonical,
                    ["priceCurrency"] = "EUR",
                    ["price"] = product.Price.ToString("0.00", CultureInfo.InvariantCulture),
                    ["availability"] = "https://schema.org/InStock",
                    ["itemCondition"] = "https://schema.org/NewCondition",
                    ["seller"] = new Dictionary<string, object?> { ["@id"] = orgId },
                    ["areaServed"] = "BG",
                },
            });
        }

        if (copy?.Kind == "article" && copy.Published is not null)
        {
            nodes.Add(new Dictionary<string, object?>
            {
                ["@type"] = "BlogPosting",
                ["headline"] = title,
                ["description"] = description,
                ["datePublished"] = copy.Published,
                ["dateModified"] = copy.Published,
                ["inLanguage"] = locale,
                ["image"] = image,
                ["mainEntityOfPage"] = canonical,
                ["author"] = new Dictionary<string, object?> { ["@id"] = orgId },
                ["publisher"] = new Dictionary<string, object?> { ["@id"] = orgId },
            });
        }

        return new Dictionary<string, object?>
        {
            ["@context"] = "https://schema.org",
            ["@graph"] = nodes,
        };
    }

    private static Dictionary<string, object?> Breadcrumbs(string origin, string locale, string pagePath, string title, SeoProduct? product)
    {
        var home = locale == "en" ? "Home" : "Начало";
        var items = new List<Dictionary<string, object?>>
        {
            Crumb(1, home, origin + Localized(locale, "/")),
        };

        if (pagePath.StartsWith("/pods/", StringComparison.Ordinal) && product is not null)
        {
            items.Add(Crumb(2, locale == "en" ? "Pods" : "Капсули", origin + Localized(locale, "/pods")));
            items.Add(Crumb(3, product.Name, origin + Localized(locale, pagePath)));
        }
        else if (pagePath.StartsWith("/accessories/", StringComparison.Ordinal) && product is not null)
        {
            items.Add(Crumb(2, locale == "en" ? "Accessories" : "Аксесоари", origin + Localized(locale, "/accessories")));
            items.Add(Crumb(3, product.Name, origin + Localized(locale, pagePath)));
        }
        else if (pagePath.StartsWith("/blog/", StringComparison.Ordinal))
        {
            items.Add(Crumb(2, locale == "en" ? "Blog" : "Блог", origin + Localized(locale, "/blog")));
            items.Add(Crumb(3, CrumbLabel(title), origin + Localized(locale, pagePath)));
        }
        else if (pagePath != "/")
        {
            items.Add(Crumb(2, CrumbLabel(title), origin + Localized(locale, pagePath.Split('?')[0] == "" ? "/" : pagePath.Split('?')[0])));
        }

        return new Dictionary<string, object?>
        {
            ["@type"] = "BreadcrumbList",
            ["itemListElement"] = items,
        };
    }

    private static Dictionary<string, object?> Crumb(int position, string name, string item) => new()
    {
        ["@type"] = "ListItem",
        ["position"] = position,
        ["name"] = name,
        ["item"] = item,
    };

    private static PageCopy? ResolveCopy(string locale, string pagePath, SeoProduct? product)
    {
        if (Pages.TryGetValue(pagePath, out var localized) && localized.TryGetValue(locale, out var page))
            return page;

        if (TryArticle(pagePath, out var slug) && Articles[slug].TryGetValue(locale, out var article))
            return article;

        if (product is null || pagePath == "/homegarder-one") return null;

        return new PageCopy(ProductTitle(locale, product), product.Description, "product");
    }

    private static string ProductTitle(string locale, SeoProduct product)
    {
        if (product.Category == ProductCategory.Accessories)
            return locale == "en"
                ? $"{product.Name} — Garden Accessory · PlantyHub"
                : $"{product.Name} — аксесоар за градината · PlantyHub";

        return locale == "en"
            ? $"{product.Name} — Hydroponic Seed Pod · PlantyHub"
            : $"{product.Name} — капсула за хидропоника · PlantyHub";
    }

    private static string ProductFallback(string locale, string name) => locale == "en"
        ? $"{name} for the PlantyHub HomeGarder One. Grow fresh herbs at home, with no soil."
        : $"{name} за PlantyHub HomeGarder One. Отглеждай свежи билки у дома, без почва.";

    private static bool IsKnown(string pagePath) =>
        Pages.ContainsKey(pagePath) || TryArticle(pagePath, out _);

    private static bool TryArticle(string pagePath, out string slug)
    {
        const string prefix = "/blog/";
        slug = "";
        if (!pagePath.StartsWith(prefix, StringComparison.Ordinal)) return false;
        slug = pagePath[prefix.Length..];
        return slug.Length > 0 && !slug.Contains('/') && Articles.ContainsKey(slug);
    }

    private static bool TryProductPath(string pagePath, out string slug, out ProductCategory category)
    {
        slug = "";
        category = ProductCategory.Gardens;
        if (pagePath.Equals("/homegarder-one", StringComparison.OrdinalIgnoreCase))
        {
            slug = "homegarder-one";
            return true;
        }

        if (TrySlug("/pods/", pagePath, out slug))
        {
            category = ProductCategory.Pods;
            return true;
        }

        if (TrySlug("/accessories/", pagePath, out slug))
        {
            category = ProductCategory.Accessories;
            return true;
        }

        return false;
    }

    private static bool TrySlug(string prefix, string pagePath, out string slug)
    {
        slug = "";
        if (!pagePath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return false;
        slug = pagePath[prefix.Length..];
        return slug.Length > 0 && !slug.Contains('/');
    }

    private static string? ProductPath(SeoProductRef product) => product.Category switch
    {
        ProductCategory.Pods => $"/pods/{product.Slug}",
        ProductCategory.Accessories => $"/accessories/{product.Slug}",
        _ => null,
    };

    private static string CanonicalPath(HttpRequest request, string locale, string pagePath)
    {
        var path = Localized(locale, pagePath);
        if (pagePath != "/learn") return path;

        var section = request.Query["section"].ToString();
        if (!Lessons.Any(lesson => lesson.Section == section)) return path;
        var topic = request.Query["topic"].ToString();
        var match = Lessons.First(lesson => lesson.Section == section);
        return match.Topics.Contains(topic, StringComparer.Ordinal)
            ? $"{path}?section={section}&topic={topic}"
            : $"{path}?section={section}";
    }

    private static string Localized(string language, string pagePath)
    {
        var query = "";
        var path = pagePath;
        var mark = pagePath.IndexOf('?', StringComparison.Ordinal);
        if (mark >= 0)
        {
            query = pagePath[mark..];
            path = mark == 0 ? "/" : pagePath[..mark];
        }

        if (language.Equals(DefaultLanguage, StringComparison.OrdinalIgnoreCase))
            return (path == "/" ? "/" : path) + query;

        return (path == "/" ? $"/{language}/" : $"/{language}{path}") + query;
    }

    private static (string Locale, string PagePath) Split(string path)
    {
        var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0 || !IsLanguage(parts[0]))
            return (DefaultLanguage, path.StartsWith('/') ? path : "/" + path);

        var locale = parts[0].ToLowerInvariant();
        var rest = "/" + string.Join('/', parts.Skip(1));
        return rest == "/" ? (locale, "/") : (locale, rest.TrimEnd('/'));
    }

    private static string[] CanonicalTail(IEnumerable<string> parts)
    {
        var tail = parts.ToArray();
        if (tail.Length == 1 && tail[0].Equals("support", StringComparison.OrdinalIgnoreCase))
            return ["contact"];
        return tail;
    }

    private static bool IsExempt(string value) =>
        value.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
        value.StartsWith("/health", StringComparison.OrdinalIgnoreCase) ||
        value.StartsWith("/admin", StringComparison.OrdinalIgnoreCase) ||
        value is "/robots.txt" or "/sitemap.xml" ||
        Path.HasExtension(value);

    private static bool IsPrivate(string rest) =>
        PrivatePrefixes.Any(prefix => rest == prefix || rest.StartsWith(prefix + "/", StringComparison.OrdinalIgnoreCase));

    private static string PriorityFor(string path)
    {
        if (path == "/") return "1.0";
        if (path == "/homegarder-one") return "0.9";
        if (path is "/pods" or "/accessories" or "/how-it-works" or "/start" or "/learn") return "0.8";
        if (path.StartsWith("/pods/", StringComparison.Ordinal) || path.StartsWith("/accessories/", StringComparison.Ordinal)) return "0.7";
        if (path.StartsWith("/learn?", StringComparison.Ordinal)) return path.Contains("topic=", StringComparison.Ordinal) ? "0.6" : "0.7";
        if (path.StartsWith("/blog/", StringComparison.Ordinal)) return "0.6";
        if (path is "/blog" or "/faq" or "/about" or "/contact") return "0.6";
        if (path is "/privacy" or "/cookies" or "/terms") return "0.3";
        return "0.5";
    }

    private static string OgLocale(string locale) => locale switch
    {
        "en" => "en_US",
        "de" => "de_DE",
        "fr" => "fr_FR",
        _ => "bg_BG",
    };

    private static string CrumbLabel(string title)
    {
        var cut = title.IndexOf('·');
        if (cut < 0) cut = title.IndexOf('—');
        return (cut > 0 ? title[..cut] : title).Trim();
    }

    private static string Clip(string value, int max = 158)
    {
        var text = Regex.Replace(value, "\\s+", " ").Trim();
        if (text.Length <= max) return text;
        var cut = text[..(max - 1)];
        var space = cut.LastIndexOf(' ');
        return ((space > 80 ? cut[..space] : cut).TrimEnd()) + "…";
    }

    private static string? FirstText(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))?.Trim();

    private static ProductTranslation? PickTranslation(Product product, string locale) =>
        product.Translations.FirstOrDefault(t => t.Language.Equals(locale, StringComparison.OrdinalIgnoreCase))
        ?? product.Translations.FirstOrDefault(t => t.Language.Equals(DefaultLanguage, StringComparison.OrdinalIgnoreCase))
        ?? product.Translations.FirstOrDefault(t => t.Language.Equals("en", StringComparison.OrdinalIgnoreCase))
        ?? product.Translations.FirstOrDefault();

    private static string Encode(string value) => WebUtility.HtmlEncode(value);

    private static readonly Dictionary<string, Dictionary<string, PageCopy>> Pages = new()
    {
        ["/"] = new()
        {
            ["bg"] = new("PlantyHub — Умна хидропонна градина за дома", "HomeGarder One: 12 гнезда, LED светлина и автоматично поливане. Отглеждай босилек, мента и маруля у дома, без почва. Доставка в България."),
            ["en"] = new("PlantyHub — Smart Hydroponic Garden for Home", "HomeGarder One: 12-pod hydroponic garden with LED light and automatic watering. Grow basil, mint and lettuce at home, with no soil. Shipping in Bulgaria."),
        },
        ["/homegarder-one"] = new()
        {
            ["bg"] = new("HomeGarder One — хидропонна градина с 12 гнезда", "Умна градина за плота: 12 гнезда, LED цикъл 16/8 и резервоар 4 л. Слагаш капсули, градината полива сама, ти береш. Доставка в България."),
            ["en"] = new("HomeGarder One — 12-Pod Hydroponic Garden", "A countertop garden with 12 pods, a 16/8 LED cycle and a 4 L tank. Add pods, it waters itself, you harvest. Ships in Bulgaria."),
        },
        ["/pods"] = new()
        {
            ["bg"] = new("Капсули със семена за хидропоника · PlantyHub", "Засети капсули за HomeGarder One: босилек, мента, магданоз, рукола и още. Слагаш една в гнездото и береш пресни билки у дома."),
            ["en"] = new("Hydroponic Seed Pods · PlantyHub", "Pre-seeded pods for HomeGarder One: basil, mint, parsley, arugula and more. Drop one in a slot and harvest fresh herbs at home."),
        },
        ["/accessories"] = new()
        {
            ["bg"] = new("Аксесоари за домашна градина · PlantyHub", "Шкафче, рафт, ножичка и всичко за поддръжка на HomeGarder One. Подреди градината и бери по-лесно."),
            ["en"] = new("Indoor Garden Accessories · PlantyHub", "Storage, a shelf, herb scissors and the extras that keep a HomeGarder One easy to live with."),
        },
        ["/about"] = new()
        {
            ["bg"] = new("За PlantyHub — хидропоника у дома", "PlantyHub прави HomeGarder One, за да имаш свежи билки в апартамент — без двор, без почва и без ежедневно поливане."),
            ["en"] = new("About PlantyHub — Hydroponics at Home", "PlantyHub makes HomeGarder One so you can grow fresh herbs in an apartment — no yard, no soil and no daily watering."),
        },
        ["/blog"] = new()
        {
            ["bg"] = new("Блог за хидропоника и реколта · PlantyHub", "Рецепти, водачи за отглеждане и кухненски истории: от първия кълн до чинията. Практически съвети за HomeGarder One."),
            ["en"] = new("Hydroponic Growing Blog · PlantyHub", "Recipes, growing guides and kitchen stories, from the first sprout to the plate. Practical advice for HomeGarder One."),
        },
        ["/contact"] = new()
        {
            ["bg"] = new("Контакти · PlantyHub", "Въпроси за поръчка, доставка или градината? Пиши ни — отговаряме в рамките на един работен ден. support@plantyhub.com"),
            ["en"] = new("Contact · PlantyHub", "Questions about an order, shipping or the garden? Write to us — we reply within one business day. support@plantyhub.com"),
        },
        ["/faq"] = new()
        {
            ["bg"] = new("Често задавани въпроси · PlantyHub", "Доставка в България, гаранция за покълване, капсули, вода и светлина. Кратки отговори за HomeGarder One."),
            ["en"] = new("FAQ · PlantyHub Hydroponic Garden", "Shipping in Bulgaria, the sprouting guarantee, pods, water and light. Short answers about HomeGarder One."),
        },
        ["/learn"] = new()
        {
            ["bg"] = new("Училище PlantyHub — уроци по хидропоника", "21 кратки урока: първо пускане, светлина, вода, бране и грижа. Същите числа като в инструкцията на HomeGarder One."),
            ["en"] = new("PlantyHub School — Hydroponic Lessons", "21 short lessons: first setup, light, water, harvest and care. The same numbers as the HomeGarder One manual."),
        },
        ["/how-it-works"] = new()
        {
            ["bg"] = new("Как работи хидропонната градина · PlantyHub", "HomeGarder One няма почва. Резервоарът полива корените, лампата държи цикъл 16/8, а ти слагаш капсули и береш."),
            ["en"] = new("How the Hydroponic Garden Works · PlantyHub", "HomeGarder One uses no soil. The tank waters the roots, the lamp keeps a 16/8 cycle, and you add pods and harvest."),
        },
        ["/start"] = new()
        {
            ["bg"] = new("Как да пуснеш HomeGarder One · PlantyHub", "Шест стъпки и около пет минути: вода, разтвор А и В, капсули и лампа. Ръководство за първата реколта."),
            ["en"] = new("How to Start HomeGarder One · PlantyHub", "Six steps and about five minutes: water, nutrient A and B, pods and the lamp. A guide to your first harvest."),
        },
        ["/privacy"] = new()
        {
            ["bg"] = new("Политика за поверителност · PlantyHub", "Как ДИДЖИТАЛ КИТ ЕООД обработва лични данни при поръчка, акаунт и контакт с PlantyHub."),
            ["en"] = new("Privacy Policy · PlantyHub", "How ДИДЖИТАЛ КИТ ЕООД handles personal data when you order, create an account or contact PlantyHub."),
        },
        ["/cookies"] = new()
        {
            ["bg"] = new("Политика за бисквитки · PlantyHub", "Кои бисквитки ползва plantyhub.com, за да работи магазинът, и кои се включват само със съгласие."),
            ["en"] = new("Cookie Policy · PlantyHub", "Which cookies plantyhub.com uses to run the store, and which run only with your consent."),
        },
        ["/terms"] = new()
        {
            ["bg"] = new("Общи условия · PlantyHub", "Условия за ползване на plantyhub.com и за покупки от PlantyHub: поръчки, доставка, връщане и гаранция."),
            ["en"] = new("Terms of Use · PlantyHub", "Terms for using plantyhub.com and buying from PlantyHub: orders, shipping, returns and warranty."),
        },
    };

    private static readonly Dictionary<string, Dictionary<string, PageCopy>> Articles = new()
    {
        ["pesto"] = new()
        {
            ["bg"] = new("От кухнята до масата — босилеково песто за 5 седмици · PlantyHub", "Проста серия с рецепти от капсула до чиния с първата ти реколта от PlantyHub.", "article", "2025-06-12"),
            ["en"] = new("Kitchen to Table — Basil Pesto in 5 Weeks · PlantyHub", "A simple recipe series showing how to go from pod to plate with your first PlantyHub harvest.", "article", "2025-06-12"),
        },
        ["hydroponics"] = new()
        {
            ["bg"] = new("Защо хидропониката използва 90% по-малко вода · PlantyHub", "Науката зад умните вътрешни градини и защо са устойчивият избор за градски домове.", "article", "2025-05-28"),
            ["en"] = new("Why Hydroponics Uses 90% Less Water · PlantyHub", "The science behind smart indoor gardens and why they're the sustainable choice for urban homes.", "article", "2025-05-28"),
        },
        ["spices"] = new()
        {
            ["bg"] = new("Ароматни подправки, които растеш на плота · PlantyHub", "Мащерка, риган, розмарин, лукче и чили — чекмеджето с подправки, преосмислено като живи капсули.", "article", "2025-07-02"),
            ["en"] = new("Aromatic Spices You Can Grow on the Counter · PlantyHub", "Thyme, oregano, rosemary, chives and chili — the spice drawer, reinvented as living pods.", "article", "2025-07-02"),
        },
        ["first-harvest"] = new()
        {
            ["bg"] = new("Как да вземеш първата реколта без стрес · PlantyHub", "Спокоен чеклист за втора и трета седмица: какво да режеш, какво да оставиш и колко често да подхранваш.", "article", "2025-06-20"),
            ["en"] = new("How to Take Your First Harvest Without Stress · PlantyHub", "A calm checklist for week two and three: what to snip, what to leave, and how often to feed.", "article", "2025-06-20"),
        },
        ["partnership"] = new()
        {
            ["bg"] = new("PlantyHub × Sustainable Living EU · Блог", "Партнирахме се с екосъзнателни създатели, за да покажем как една градина променя ежедневието.", "article", "2025-05-10"),
            ["en"] = new("PlantyHub × Sustainable Living EU · Blog", "We teamed up with eco-conscious creators to show how one garden can change your daily routine.", "article", "2025-05-10"),
        },
        ["earthday"] = new()
        {
            ["bg"] = new("Ден на Земята: Отглеждай си, хвърляй по-малко · PlantyHub", "Как биоразградимите капсули и локалното отглеждане намаляват пластмасата и хранителните отпадъци.", "article", "2025-04-22"),
            ["en"] = new("Earth Day: Grow Your Own, Waste Less · PlantyHub", "How biodegradable pods and home growing help cut plastic and food waste.", "article", "2025-04-22"),
        },
    };
}
