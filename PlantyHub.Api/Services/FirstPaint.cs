using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

/// <summary>
/// Paints the homepage hero in the first HTML byte, before the JavaScript bundle runs.
/// Image widths and quality match plantyhub.ui/src/media/cfImage.ts (HERO_IMAGE).
/// </summary>
public static class FirstPaint
{
    private static readonly int[] HeroWidths = [640, 960, 1280, 1600];
    private const int HeroFallback = 960;
    private const int HeroQuality = 75;
    private const string HeroSizes = "(min-width: 900px) 52vw, 100vw";
    private const string DefaultImage = "/images/lifestyle/home-garden-product.png";

    private static readonly string[] TextKeys =
    [
        "hero.priceLabel",
        "hero.title",
        "hero.promise",
        "hero.description",
        "hero.ctaPrimary",
        "hero.ctaSecondary",
        "hero.imageAlt",
        "hero.trust.shipping",
        "hero.stats.pods.value",
        "hero.stats.pods.label",
        "hero.stats.light.value",
        "hero.stats.light.label",
        "hero.stats.height.value",
        "hero.stats.height.label",
    ];

    private static readonly Dictionary<string, Dictionary<string, string>> Fallback = new(StringComparer.Ordinal)
    {
        ["bg"] = new(StringComparer.Ordinal)
        {
            ["promo"] = "БЕЗПЛАТНА ДОСТАВКА НАД €150 · САМО В БЪЛГАРИЯ",
            ["hero.priceLabel"] = "HomeGarder One",
            ["hero.title"] = "Свежи подправки у дома",
            ["hero.promise"] = "Отглеждай любимите си растения лесно през цялата година.",
            ["hero.description"] = "12-гнездна градина с автоматично поливане и LED светлина.",
            ["hero.ctaPrimary"] = "Купи сега",
            ["hero.ctaSecondary"] = "Как работи",
            ["hero.imageAlt"] = "PlantyHub HomeGarder One с пресни билки",
            ["hero.trust.shipping"] = "Безплатна доставка над €150 в България",
            ["hero.stats.pods.value"] = "12",
            ["hero.stats.pods.label"] = "гнезда",
            ["hero.stats.light.value"] = "16/8ч",
            ["hero.stats.light.label"] = "светлинен цикъл",
            ["hero.stats.height.value"] = "до 40 см",
            ["hero.stats.height.label"] = "височина на растеж",
        },
        ["en"] = new(StringComparer.Ordinal)
        {
            ["promo"] = "FREE SHIPPING OVER €150 · BULGARIA ONLY",
            ["hero.priceLabel"] = "HomeGarder One",
            ["hero.title"] = "Fresh herbs, grown at home",
            ["hero.promise"] = "Grow the plants you love, easily, all year round.",
            ["hero.description"] = "12-pod smart garden with self-watering and automatic LED light.",
            ["hero.ctaPrimary"] = "Buy now",
            ["hero.ctaSecondary"] = "How it works",
            ["hero.imageAlt"] = "PlantyHub HomeGarder One with fresh herbs",
            ["hero.trust.shipping"] = "Free shipping over €150 in Bulgaria",
            ["hero.stats.pods.value"] = "12",
            ["hero.stats.pods.label"] = "growing holes",
            ["hero.stats.light.value"] = "16/8h",
            ["hero.stats.light.label"] = "light cycle",
            ["hero.stats.height.value"] = "up to 40 cm",
            ["hero.stats.height.label"] = "growth height",
        },
    };

    private static readonly object Gate = new();
    private static string CachedLocale = "";
    private static string CachedHead = "";
    private static string CachedBody = "";
    private static DateTime CachedUntil = DateTime.MinValue;

    public static async Task<string> ApplyAsync(string html, string path, AppDbContext db, CancellationToken ct)
    {
        var locale = HomeLocale(path);
        if (locale is null) return html;

        try
        {
            var (head, body) = await FragmentAsync(locale, db, ct);
            if (head.Length == 0) return html;
            html = Regex.Replace(html, "</head>", head + "</head>", RegexOptions.IgnoreCase);
            html = Regex.Replace(
                html,
                "<div\\s+id=\"root\"\\s*>\\s*</div>",
                body + "<div id=\"root\"></div>",
                RegexOptions.IgnoreCase);
            return html;
        }
        catch
        {
            return html;
        }
    }

    private static string? HomeLocale(string path)
    {
        var parts = (path ?? "/").Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return LocaleSeo.DefaultLanguage;
        if (parts.Length == 1 && parts[0].Equals("en", StringComparison.OrdinalIgnoreCase)) return "en";
        return null;
    }

    private static async Task<(string Head, string Body)> FragmentAsync(string locale, AppDbContext db, CancellationToken ct)
    {
        lock (Gate)
        {
            if (CachedLocale == locale && DateTime.UtcNow < CachedUntil && CachedBody.Length > 0)
                return (CachedHead, CachedBody);
        }

        var settings = await db.HomepageSettings.AsNoTracking().FirstOrDefaultAsync(h => h.Id == 1, ct);
        var sections = Read<Dictionary<string, bool>>(settings?.SectionsJson);
        if (sections.TryGetValue("hero", out var heroOn) && !heroOn)
            return ("", "");

        var texts = Read<Dictionary<string, Dictionary<string, string>>>(settings?.TextsJson);
        var images = MediaUrls.ResolveMap(Read<Dictionary<string, string>>(settings?.ImagesJson));
        var image = images.TryGetValue("hero.main", out var stored) && !string.IsNullOrWhiteSpace(stored)
            ? stored
            : MediaUrls.Resolve(DefaultImage);
        var focus = images.TryGetValue("hero.main.focus", out var focusRaw) ? focusRaw : "";

        var priceValue = await db.Products.AsNoTracking()
            .Where(p => p.Active && p.Slug == "homegarder-one")
            .Select(p => (decimal?)p.Price)
            .FirstOrDefaultAsync(ct);
        var price = priceValue is > 0
            ? PriceHelper.FormatEuro(priceValue.Value)
            : "€99.99";

        var copy = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var key in TextKeys)
            copy[key] = Pick(texts, locale, key);

        var promo = Pick(texts, locale, "promo");

        var head = Head(image, focus);
        var body = Body(locale, image, focus, price, promo, copy);
        lock (Gate)
        {
            CachedLocale = locale;
            CachedHead = head;
            CachedBody = body;
            CachedUntil = DateTime.UtcNow.AddSeconds(60);
        }

        return (head, body);
    }

    private static string Pick(Dictionary<string, Dictionary<string, string>> texts, string locale, string key)
    {
        if (texts.TryGetValue(locale, out var pack) && pack.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
            return value.Trim();
        return Fallback[locale][key];
    }

    private static T Read<T>(string? json) where T : new()
    {
        if (string.IsNullOrWhiteSpace(json)) return new T();
        try
        {
            return JsonSerializer.Deserialize<T>(json, JsonDefaults.Options) ?? new T();
        }
        catch
        {
            return new T();
        }
    }

    private static string Transform(string url, int width)
    {
        var resolved = MediaUrls.Resolve(url);
        if (string.IsNullOrWhiteSpace(resolved) || resolved.Contains("/cdn-cgi/image/", StringComparison.Ordinal))
            return resolved;
        if (!Uri.TryCreate(resolved, UriKind.Absolute, out var uri)) return resolved;
        if (!uri.Host.Equals("media.plantyhub.com", StringComparison.OrdinalIgnoreCase)) return resolved;
        return $"{MediaUrls.PublicBase}/cdn-cgi/image/width={width},fit=scale-down,format=auto,quality={HeroQuality}{uri.AbsolutePath}{uri.Query}";
    }

    private static string SrcSet(string url)
    {
        return string.Join(", ", HeroWidths.Select(width => $"{Transform(url, width)} {width}w"));
    }

    private static string Head(string image, string focus)
    {
        var srcset = E(SrcSet(image));
        var mobile = E(Focus(focus, "mobile", "50% 42%"));
        var desktop = E(Focus(focus, "desktop", "58% 50%"));
        return $$"""
            <link rel="preload" as="image" imagesrcset="{{srcset}}" imagesizes="{{HeroSizes}}" fetchpriority="high" />
            <style id="boot-css">
            #boot { color: #1c231e; font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            #boot * { box-sizing: border-box; }
            .boot-promo { margin: 0; background: #1f5a3b; color: #fff; text-align: center; font-weight: 700; font-size: 0.68rem; letter-spacing: 0.03em; text-transform: uppercase; line-height: 1.35; padding: 0.35rem 1rem; }
            .boot-header { display: flex; align-items: center; gap: 2px; min-height: 48px; padding: env(safe-area-inset-top) max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left)); background: rgba(255,255,255,0.94); border-bottom: 1px solid #eceee8; }
            .boot-menu { width: 44px; height: 44px; display: inline-flex; flex-direction: column; justify-content: center; gap: 5px; }
            .boot-menu i { display: block; height: 2px; width: 18px; margin-left: 4px; background: #1c231e; border-radius: 1px; }
            .boot-logo { height: 28px; width: auto; display: block; }
            .boot-hero { display: flex; flex-direction: column; background: #f3f6f0; overflow: hidden; }
            .boot-visual { position: relative; order: -1; height: min(300px, 62vw); min-height: 240px; }
            .boot-visual img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: {{mobile}}; }
            .boot-visual::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, #f3f6f0 0%, rgba(243,246,240,0) 32%); }
            .boot-copy { position: relative; padding: 1.625rem max(16px, env(safe-area-inset-right)) 1.75rem max(16px, env(safe-area-inset-left)); background: radial-gradient(ellipse 72% 48% at 0% 108%, rgba(47,125,83,0.13) 0%, transparent 58%), radial-gradient(ellipse 46% 34% at 12% 0%, rgba(227,159,118,0.20) 0%, transparent 68%); }
            .boot-copy-inner { max-width: 520px; }
            .boot-kicker { margin: 0 0 0.625rem; font-size: 0.72rem; font-weight: 750; letter-spacing: 0.16em; text-transform: uppercase; color: #2f7d53; }
            .boot-title { margin: 0 0 0.7rem; font-family: Georgia, "Times New Roman", serif; font-weight: 560; font-size: clamp(2.25rem, 8vw, 2.85rem); letter-spacing: -0.04em; line-height: 0.98; color: #1c231e; }
            .boot-promise { margin: 0 0 0.7rem; max-width: 460px; font-family: Georgia, "Times New Roman", serif; font-style: italic; font-weight: 500; font-size: 1.2rem; line-height: 1.25; color: #1f5a3b; }
            .boot-description { margin: 0 0 1.25rem; max-width: 460px; color: #68706a; font-size: 0.98rem; line-height: 1.55; }
            .boot-actions { display: flex; flex-direction: column; gap: 10px; }
            .boot-cta, .boot-secondary { display: flex; align-items: center; justify-content: center; min-height: 52px; padding: 15px 32px; border-radius: 999px; font-weight: 700; font-size: 0.95rem; text-decoration: none; line-height: 1; }
            .boot-cta { background: #2f7d53; color: #fff; }
            .boot-secondary { border: 1.5px solid #1c231e; color: #1c231e; }
            .boot-ship { display: flex; align-items: center; gap: 6px; margin: 0.9rem 0 0; color: #68706a; font-size: 0.84rem; font-weight: 650; }
            .boot-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(31,90,59,0.14); }
            .boot-stat { min-width: 0; }
            .boot-stat + .boot-stat { border-left: 1px solid rgba(31,90,59,0.14); padding-left: 0.7rem; }
            .boot-stat b { display: block; font-family: Georgia, "Times New Roman", serif; font-weight: 560; font-size: 1.2rem; line-height: 1; letter-spacing: -0.03em; color: #1f5a3b; }
            .boot-stat span { display: block; margin-top: 0.3rem; color: #68706a; font-size: 0.68rem; font-weight: 650; line-height: 1.3; }
            @media (min-width: 600px) {
              .boot-promo { font-size: 0.7rem; letter-spacing: 0.08em; padding: 0.55rem 1rem; }
              .boot-header { min-height: 60px; padding-left: 24px; padding-right: 24px; }
              .boot-logo { height: 34px; }
              .boot-visual { height: min(360px, 42vw); min-height: 300px; }
              .boot-actions { flex-direction: row; flex-wrap: wrap; }
              .boot-cta, .boot-secondary { width: auto; }
              .boot-title { font-size: 2.9rem; }
            }
            @media (min-width: 900px) {
              .boot-menu { display: none; }
              .boot-header { min-height: 68px; padding-left: 32px; padding-right: 32px; }
              .boot-logo { height: 38px; }
              .boot-hero { display: grid; grid-template-columns: minmax(400px, 48%) minmax(0, 1fr); min-height: max(640px, min(780px, calc(100svh - 108px))); }
              .boot-visual { order: 0; height: auto; min-height: 100%; }
              .boot-visual img { object-position: {{desktop}}; }
              .boot-visual::after { background: linear-gradient(90deg, #f3f6f0 0%, rgba(243,246,240,0) 12%); }
              .boot-copy { padding: 2.75rem 32px; }
              .boot-title { font-size: 3.55rem; }
              .boot-promise { font-size: 1.45rem; }
            }
            </style>
            """;
    }

    private static string Body(string locale, string image, string focus, string price, string promo, Dictionary<string, string> copy)
    {
        var buy = LocaleSeo.PublicPath(locale, "/homegarder-one");
        var how = LocaleSeo.PublicPath(locale, "/how-it-works");
        var logo = E(Transform("/logo.png", 240));
        var src = E(Transform(image, HeroFallback));
        var srcset = E(SrcSet(image));
        var posMobile = E(Focus(focus, "mobile", "50% 42%"));
        var posDesktop = E(Focus(focus, "desktop", "58% 50%"));
        var cta = E(copy["hero.ctaPrimary"]);
        var priced = string.IsNullOrWhiteSpace(price) ? cta : $"{cta} · {E(price)}";
        var seed = JsonSerializer.Serialize(new
        {
            lang = locale,
            image,
            focus,
            price,
            texts = copy,
        });
        seed = seed.Replace("<", "\\u003c", StringComparison.Ordinal);

        return $"""
            <div id="boot">
              <p class="boot-promo">{E(promo)}</p>
              <header class="boot-header">
                <span class="boot-menu" aria-hidden="true"><i></i><i></i><i></i></span>
                <img class="boot-logo" alt="PlantyHub" src="{logo}" width="150" height="38" />
              </header>
              <section class="boot-hero">
                <div class="boot-copy">
                  <div class="boot-copy-inner">
                    <p class="boot-kicker">{E(copy["hero.priceLabel"])}</p>
                    <h1 class="boot-title">{E(copy["hero.title"])}</h1>
                    <p class="boot-promise">{E(copy["hero.promise"])}</p>
                    <p class="boot-description">{E(copy["hero.description"])}</p>
                    <div class="boot-actions">
                      <a class="boot-cta" href="{E(buy)}">{priced}</a>
                      <a class="boot-secondary" href="{E(how)}">{E(copy["hero.ctaSecondary"])}</a>
                    </div>
                    <p class="boot-ship">{E(copy["hero.trust.shipping"])}</p>
                    <div class="boot-stats">
                      <div class="boot-stat"><b>{E(copy["hero.stats.pods.value"])}</b><span>{E(copy["hero.stats.pods.label"])}</span></div>
                      <div class="boot-stat"><b>{E(copy["hero.stats.light.value"])}</b><span>{E(copy["hero.stats.light.label"])}</span></div>
                      <div class="boot-stat"><b>{E(copy["hero.stats.height.value"])}</b><span>{E(copy["hero.stats.height.label"])}</span></div>
                    </div>
                  </div>
                </div>
                <div class="boot-visual">
                  <img id="boot-hero-img" alt="{E(copy["hero.imageAlt"])}" src="{src}" srcset="{srcset}" sizes="{HeroSizes}" fetchpriority="high" data-pos-mobile="{posMobile}" data-pos-desktop="{posDesktop}" />
                </div>
              </section>
            </div>
            <script id="boot-data" type="application/json">{seed}</script>
            """;
    }

    private static string Focus(string raw, string frame, string fallback)
    {
        if (string.IsNullOrWhiteSpace(raw)) return fallback;
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (doc.RootElement.TryGetProperty(frame, out var value) && value.ValueKind == JsonValueKind.String)
            {
                var text = value.GetString()?.Trim();
                if (!string.IsNullOrWhiteSpace(text) && text.Contains('%')) return text;
            }
        }
        catch
        {
            /* keep the default crop */
        }
        return fallback;
    }

    private static string E(string? value) => WebUtility.HtmlEncode(value ?? "");
}
