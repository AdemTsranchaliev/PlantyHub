using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductTranslation> ProductTranslations => Set<ProductTranslation>();
    public DbSet<ProductColor> ProductColors => Set<ProductColor>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderTimelineEntry> OrderTimelineEntries => Set<OrderTimelineEntry>();
    public DbSet<Waybill> Waybills => Set<Waybill>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();
    public DbSet<HomepageSettings> HomepageSettings => Set<HomepageSettings>();
    public DbSet<SiteAssets> SiteAssets => Set<SiteAssets>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<CourierSettings> CourierSettings => Set<CourierSettings>();
    public DbSet<CourierLocationCache> CourierLocationCache => Set<CourierLocationCache>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>().Property(u => u.Country).HasMaxLength(2);

        builder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.HasIndex(p => new { p.Category, p.Active });
            entity.Property(p => p.Slug).HasMaxLength(160);
            entity.Property(p => p.PackKey).HasMaxLength(80);
            entity.Property(p => p.Image).HasMaxLength(2048);
            entity.Property(p => p.VideoUrl).HasMaxLength(2048);
            entity.Property(p => p.VideoPoster).HasMaxLength(2048);
            entity.Property(p => p.Price).HasPrecision(10, 2);
            entity.Property(p => p.CompareAtPrice).HasPrecision(10, 2);
        });

        builder.Entity<ProductTranslation>(entity =>
        {
            entity.Property(t => t.Language).HasMaxLength(8);
            entity.Property(t => t.Name).HasMaxLength(200);
            entity.Property(t => t.Tagline).HasMaxLength(400);
            entity.Property(t => t.VideoBadge).HasMaxLength(80);
            entity.Property(t => t.VideoTitle).HasMaxLength(200);
            entity.HasIndex(t => new { t.ProductId, t.Language }).IsUnique();
            entity.HasOne(t => t.Product)
                .WithMany(p => p.Translations)
                .HasForeignKey(t => t.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProductColor>(entity =>
        {
            entity.Property(c => c.ColorId).HasMaxLength(40);
            entity.Property(c => c.Hex).HasMaxLength(16);
            entity.HasOne(c => c.Product)
                .WithMany(p => p.Colors)
                .HasForeignKey(c => c.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Customer>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).HasMaxLength(64);
            entity.Property(c => c.Email).HasMaxLength(256);
            entity.Property(c => c.Name).HasMaxLength(200);
            entity.Property(c => c.Phone).HasMaxLength(40);
            entity.HasIndex(c => c.Email).IsUnique();
            entity.Property(c => c.Country).HasMaxLength(2);
            entity.HasMany(c => c.Orders)
                .WithOne(o => o.Customer)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.Id).HasMaxLength(64);
            entity.Property(o => o.UserId).HasMaxLength(450);
            entity.Property(o => o.CustomerId).HasMaxLength(64);
            entity.Property(o => o.CustomerName).HasMaxLength(200);
            entity.Property(o => o.Email).HasMaxLength(256);
            entity.Property(o => o.Phone).HasMaxLength(40);
            entity.Property(o => o.PromoCode).HasMaxLength(40);
            entity.Property(o => o.ShippingCourier).HasMaxLength(40);
            entity.Property(o => o.ShippingDelivery).HasMaxLength(40);
            entity.Property(o => o.ShippingOfficeCode).HasMaxLength(80);
            entity.Property(o => o.ShippingName).HasMaxLength(200);
            entity.Property(o => o.ShippingPhone).HasMaxLength(40);
            entity.Property(o => o.ShippingStreet).HasMaxLength(300);
            entity.Property(o => o.ShippingCity).HasMaxLength(120);
            entity.Property(o => o.ShippingPostalCode).HasMaxLength(20);
            entity.Property(o => o.BillingName).HasMaxLength(200);
            entity.Property(o => o.BillingPhone).HasMaxLength(40);
            entity.Property(o => o.BillingStreet).HasMaxLength(300);
            entity.Property(o => o.BillingCity).HasMaxLength(120);
            entity.Property(o => o.BillingPostalCode).HasMaxLength(20);
            entity.Property(o => o.Subtotal).HasPrecision(10, 2);
            entity.Property(o => o.Discount).HasPrecision(10, 2);
            entity.Property(o => o.ShippingCost).HasPrecision(10, 2);
            entity.Property(o => o.Tax).HasPrecision(10, 2);
            entity.Property(o => o.TaxRate).HasPrecision(5, 2);
            entity.Property(o => o.Total).HasPrecision(10, 2);
            entity.HasIndex(o => o.Email);
            entity.HasIndex(o => o.Status);
            entity.HasIndex(o => o.CreatedAt);
            entity.Property(o => o.Country).HasMaxLength(2);
            entity.Property(o => o.ShippingCountry).HasMaxLength(2);
            entity.Property(o => o.BillingCountry).HasMaxLength(2);
            entity.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<PromoCode>(entity =>
        {
            entity.HasIndex(p => p.Code).IsUnique();
            entity.Property(p => p.Code).HasMaxLength(40);
            entity.Property(p => p.Type).HasMaxLength(16);
            entity.Property(p => p.Amount).HasPrecision(10, 2);
            entity.Property(p => p.MinSubtotal).HasPrecision(10, 2);
        });

        builder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.OrderId).HasMaxLength(64);
            entity.Property(i => i.ProductSlug).HasMaxLength(160);
            entity.Property(i => i.Name).HasMaxLength(200);
            entity.Property(i => i.Image).HasMaxLength(2048);
            entity.Property(i => i.GiftName).HasMaxLength(200);
            entity.Property(i => i.GiftImage).HasMaxLength(2048);
            entity.Property(i => i.GiftCompareAt).HasMaxLength(40);
            entity.Property(i => i.UnitPrice).HasPrecision(10, 2);
            entity.Property(i => i.Total).HasPrecision(10, 2);
            entity.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<OrderTimelineEntry>(entity =>
        {
            entity.Property(t => t.OrderId).HasMaxLength(64);
            entity.Property(t => t.Note).HasMaxLength(500);
            entity.HasOne(t => t.Order)
                .WithMany(o => o.Timeline)
                .HasForeignKey(t => t.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Waybill>(entity =>
        {
            entity.Property(w => w.OrderId).HasMaxLength(64);
            entity.Property(w => w.Number).HasMaxLength(80);
            entity.Property(w => w.Notes).HasMaxLength(500);
            entity.Property(w => w.TrackingUrl).HasMaxLength(2048);
            entity.Property(w => w.ExternalId).HasMaxLength(120);
            entity.Property(w => w.Mode).HasMaxLength(40);
            entity.HasIndex(w => w.Number).IsUnique();
            entity.Property(w => w.WeightKg).HasPrecision(6, 2);
            entity.Property(w => w.CodAmount).HasPrecision(10, 2);
            entity.HasOne(w => w.Order)
                .WithOne(o => o.Waybill)
                .HasForeignKey<Waybill>(w => w.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<NewsletterSubscriber>(entity =>
        {
            entity.Property(s => s.Email).HasMaxLength(256);
            entity.HasIndex(s => s.Email).IsUnique();
        });

        builder.Entity<HomepageSettings>(entity =>
        {
            entity.HasKey(h => h.Id);
            entity.Property(h => h.Id).ValueGeneratedNever();
        });

        builder.Entity<SiteAssets>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).ValueGeneratedNever();
        });

        builder.Entity<EmailTemplate>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Key).HasMaxLength(100);
            entity.Property(t => t.Name).HasMaxLength(200);
            entity.Property(t => t.Description).HasMaxLength(400);
            entity.Property(t => t.Subject).HasMaxLength(300);
            entity.HasIndex(t => t.Key).IsUnique();
        });

        builder.Entity<CourierSettings>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Id).ValueGeneratedNever();
        });

        builder.Entity<CourierLocationCache>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasIndex(c => c.Key).IsUnique();
            entity.Property(c => c.Key).HasMaxLength(160);
        });

        builder.Entity<StoreSettings>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Id).ValueGeneratedNever();
        });
    }
}
