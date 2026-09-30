using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
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
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    if (HttpMethods.IsGet(context.Request.Method) && LocaleSeo.NeedsLocaleRedirect(context.Request.Path))
    {
        var language = LocaleSeo.PickLanguage(context.Request.Headers.AcceptLanguage);
        var path = context.Request.Path.Value ?? "/";
        var target = path == "/" ? $"/{language}/" : $"/{language}{path}";
        context.Response.Redirect($"{target}{context.Request.QueryString}", permanent: false);
        return;
    }

    await next();
});

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "PlantyHub.Api" }));
app.MapGet("/robots.txt", (HttpContext context) =>
    Results.Text(LocaleSeo.Robots(context.Request), "text/plain; charset=utf-8"));
app.MapGet("/sitemap.xml", (HttpContext context) =>
    Results.Text(LocaleSeo.Sitemap(context.Request), "application/xml; charset=utf-8"));

app.MapFallback(async context =>
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

    var html = await File.ReadAllTextAsync(index);
    html = LocaleSeo.Apply(html, context.Request);
    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.WriteAsync(html);
});

app.Run();
