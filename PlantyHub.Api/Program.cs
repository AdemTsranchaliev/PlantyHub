using System.IO.Compression;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PlantyHub.Api.Data;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

using PlantyHub.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 80 * 1024 * 1024;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection(EmailSettings.SectionName));
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection(AppSettings.SectionName));
builder.Services.Configure<R2Settings>(builder.Configuration.GetSection(R2Settings.SectionName));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sql =>
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)
            .CommandTimeout(60)));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are missing.");

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var version = context.Principal?.FindFirst("ver")?.Value;
                if (version != jwtSettings.TokenVersion.ToString())
                    context.Fail("Session ended.");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<EmailTemplateService>();
builder.Services.AddScoped<OrderEmailService>();
builder.Services.AddSingleton<OrderEmailProcessor>();
builder.Services.AddSingleton<IOrderEmailQueue>(sp => sp.GetRequiredService<OrderEmailProcessor>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<OrderEmailProcessor>());
builder.Services.AddScoped<AuthEmailService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<CourierService>();
builder.Services.AddScoped<CourierLocationService>();
builder.Services.AddScoped<CourierRateService>();
builder.Services.AddScoped<EcontLabelService>();
builder.Services.AddScoped<VatService>();
builder.Services.AddScoped<AccountingReportService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddHttpClient("couriers", client =>
{
    client.Timeout = TimeSpan.FromSeconds(45);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("PlantyHub/1.0");
});
builder.Services.AddScoped<AdminDashboardService>();
builder.Services.AddScoped<NewsletterService>();
builder.Services.AddSingleton<IR2StorageService, R2StorageService>();

var emailSettings = builder.Configuration.GetSection(EmailSettings.SectionName).Get<EmailSettings>() ?? new EmailSettings();
if (emailSettings.IsAcsConfigured)
    builder.Services.AddSingleton<IEmailSender, AcsEmailSender>();
else if (emailSettings.IsSmtpConfigured)
    builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
else
    builder.Services.AddSingleton<IEmailSender, DevEmailSender>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin =>
                    Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                    && (uri.Host is "localhost" or "127.0.0.1"))
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithExposedHeaders("Content-Disposition");
            return;
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition");
    });
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
    [
        "text/javascript",
        "application/manifest+json",
        "image/svg+xml",
    ]);
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);
builder.Services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);

var app = builder.Build();

await DbSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseGlobalExceptionHandler();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseResponseCompression();
app.UseCors();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var path = ctx.Context.Request.Path.Value ?? "";
        if (path.StartsWith("/assets/", StringComparison.Ordinal))
            ctx.Context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        else if (path.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
            ctx.Context.Response.Headers.CacheControl = "no-cache";
        else
            ctx.Context.Response.Headers.CacheControl = "public, max-age=604800";
    }
});
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    if (HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method))
    {
        var target = LocaleSeo.RedirectTarget(context.Request.Path);
        if (target is not null)
        {
            context.Response.Redirect($"{target}{context.Request.QueryString}", permanent: true);
            return;
        }
    }

    await next();
});

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "PlantyHub.Api" }));
app.MapGet("/robots.txt", (HttpContext context) =>
    Results.Text(LocaleSeo.Robots(context.Request), "text/plain; charset=utf-8"));
app.MapGet("/sitemap.xml", async (HttpContext context, AppDbContext db, CancellationToken ct) =>
    Results.Text(LocaleSeo.Sitemap(context.Request, await LocaleSeo.LoadSitemapProductsAsync(db, ct)), "application/xml; charset=utf-8"));

app.MapFallback(async (HttpContext context, AppDbContext db, CancellationToken ct) =>
{
    if (context.Request.Path.StartsWithSegments("/api") ||
        context.Request.Path.StartsWithSegments("/health"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var index = Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "index.html");
    if (!File.Exists(index))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var html = await File.ReadAllTextAsync(index, ct);
    var product = await LocaleSeo.LoadPageProductAsync(db, context.Request.Path.Value ?? "/", ct);
    html = LocaleSeo.Apply(html, context.Request, product);
    html = await FirstPaint.ApplyAsync(html, context.Request.Path.Value ?? "/", db, ct);
    context.Response.ContentType = "text/html; charset=utf-8";
    context.Response.Headers.CacheControl = "no-cache";
    await context.Response.WriteAsync(html, ct);
});

app.Run();
