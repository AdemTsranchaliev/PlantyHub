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

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.HasIndex(p => new { p.Category, p.Active });
            entity.Property(p => p.Price).HasPrecision(10, 2);
            entity.Property(p => p.CompareAtPrice).HasPrecision(10, 2);
        });

        builder.Entity<ProductTranslation>(entity =>
        {
            entity.HasIndex(t => new { t.ProductId, t.Language }).IsUnique();
            entity.HasOne(t => t.Product)
                .WithMany(p => p.Translations)
                .HasForeignKey(t => t.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProductColor>(entity =>
        {
            entity.HasOne(c => c.Product)
                .WithMany(p => p.Colors)
                .HasForeignKey(c => c.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Customer>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasIndex(c => c.Email).IsUnique();
            entity.HasMany(c => c.Orders)
                .WithOne(o => o.Customer)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.Subtotal).HasPrecision(10, 2);
            entity.Property(o => o.ShippingCost).HasPrecision(10, 2);
            entity.Property(o => o.Tax).HasPrecision(10, 2);
            entity.Property(o => o.Total).HasPrecision(10, 2);
            entity.HasIndex(o => o.Email);
            entity.HasIndex(o => o.Status);
            entity.HasIndex(o => o.CreatedAt);
        });

        builder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.UnitPrice).HasPrecision(10, 2);
            entity.Property(i => i.Total).HasPrecision(10, 2);
            entity.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<OrderTimelineEntry>(entity =>
        {
            entity.HasOne(t => t.Order)
                .WithMany(o => o.Timeline)
                .HasForeignKey(t => t.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Waybill>(entity =>
        {
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
            entity.HasIndex(s => s.Email).IsUnique();
        });

        builder.Entity<HomepageSettings>(entity =>
        {
            entity.HasKey(h => h.Id);
        });
    }
}
