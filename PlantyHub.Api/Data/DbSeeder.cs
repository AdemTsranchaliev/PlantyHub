using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Models;
using PlantyHub.Api.Services;

namespace PlantyHub.Api.Data;

public static class DbSeeder
{
    public const string AdminRole = "Admin";
    public const string CustomerRole = "Customer";
    public const string AdminEmail = "admin@plantyhub.com";
    public const string AdminPassword = "Admin123!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await db.Database.MigrateAsync();

        foreach (var role in new[] { AdminRole, CustomerRole })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var admin = await userManager.FindByEmailAsync(AdminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                UserName = AdminEmail,
                Email = AdminEmail,
                EmailConfirmed = true,
                FullName = "Admin"
            };
            await userManager.CreateAsync(admin, AdminPassword);
            await userManager.AddToRoleAsync(admin, AdminRole);
        }

        if (!await db.Products.AnyAsync())
            await SeedProductsAsync(db);

        if (!await db.Orders.AnyAsync())
            await SeedOrdersAsync(db);

        if (!await db.Customers.AnyAsync())
            await SeedCustomersAsync(db);

        if (!await db.NewsletterSubscribers.AnyAsync())
        {
            db.NewsletterSubscribers.Add(new NewsletterSubscriber { Email = "news@plantyhub.com" });
            await db.SaveChangesAsync();
        }

        if (!await db.HomepageSettings.AnyAsync())
        {
            db.HomepageSettings.Add(new HomepageSettings
            {
                LayoutVersion = 2,
                SectionsJson = JsonSerializer.Serialize(new Dictionary<string, bool>
                {
                    ["hero"] = true,
                    ["product"] = true,
                    ["howItWorks"] = true,
                    ["podsGrid"] = true,
                    ["socialProof"] = true,
                    ["cta"] = true
                }, JsonDefaults.Options),
                TextsJson = "{}",
                ImagesJson = "{}"
            });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedProductsAsync(AppDbContext db)
    {
        var products = new List<Product>
        {
            Garden("homegarder-one", 99.00m, "/images/lifestyle/home-garden-product.png", ImageFit.Cover, featured: true,
                colors: [("white", "#FFFFFF")],
                en: ("PlantyHub HomeGarder One", "12 holes · 16h LED daily", null),
                bg: ("PlantyHub HomeGarder One", "12 отвора · 16ч LED дневно", null)),
            Garden("starter-bundle", 129.00m, "/images/lifestyle/outdoor-deck.png", ImageFit.Cover, compareAt: 148.90m,
                colors: [("white", "#FFFFFF")],
                en: ("Starter Bundle", "HomeGarder One + PlantyHub Pods", null),
                bg: ("Стартов комплект", "HomeGarder One + PlantyHub Pods", null)),
            Garden("pods-kit", 39.90m, "/images/lifestyle/mint-kitchen.png", ImageFit.Cover,
                colors: [("default", "#E8E5DA")],
                en: ("PlantyHub Pods Kit", "Seeds + Plant Yourself kit", null),
                bg: ("PlantyHub Pods Kit", "Семена + комплект „Посади сам“", null)),

            Pod("basil", 9.99m, "/images/stock/basil.jpg", "pack3",
                en: ("Basil Seed Pods", null, "Sweet, aromatic and the king of herbs."),
                bg: ("Босилек капсули", null, "Сладък, ароматен босилек за песто и паста.")),
            Pod("mint", 9.99m, "/images/stock/mint.jpg", "pack3",
                en: ("Mint Seed Pods", null, "Fragrant, cooling leaves for teas and cocktails."),
                bg: ("Мента капсули", null, "Ароматни листа за чай и коктейли.")),
            Pod("parsley", 9.99m, "/images/products/parsley.png", "pack3",
                en: ("Parsley Seed Pods", null, "The fresh, everyday all-rounder."),
                bg: ("Магданоз капсули", null, "Свеж магданоз за гарнитури и сосове.")),
            Pod("cilantro", 9.99m, "/images/products/cilantro.png", "pack3",
                en: ("Cilantro Seed Pods", null, "Bright, citrusy leaves for curries and salsas."),
                bg: ("Кориандър капсули", null, "Свежи листа за къри и сосове.")),
            Pod("dill", 9.99m, "/images/products/dill.png", "pack3",
                en: ("Dill Seed Pods", null, "Delicate fronds for fish and pickles."),
                bg: ("Копър капсули", null, "Нежни листа за риба и кисели краставички.")),
            Pod("arugula", 9.99m, "/images/products/arugula.png", "pack3",
                en: ("Arugula Seed Pods", null, "Bold, peppery leaves for salads."),
                bg: ("Рукола капсули", null, "Пикантни листа за салати и пица.")),
            Pod("herb-mix-12", 19.99m, "/images/lifestyle/outdoor-deck.png", "pack12",
                en: ("12-Pod Herb Mix", null, "A full line-up of favourite herbs."),
                bg: ("12-капсулен билков микс", null, "Пълен комплект любими билки.")),

            Consumable("empty-capsules", 5.90m, "/images/lifestyle/basil-closeup.png", "pack12",
                en: "Empty Capsules", bg: "Празни капсули"),
            Consumable("sana-ab", 8.90m, "/images/lifestyle/home-garden-product.png", "bottle2x100ml",
                en: "Sana A + B Nutrients", bg: "Sana A + B хранителни вещества"),
            Consumable("germination-caps", 4.90m, "/images/lifestyle/mint-closeup.png", "pack12",
                en: "Germination Caps", bg: "Капсули за покълване"),

            Accessory("storage-cabinet", 24.90m, "/images/lifestyle/outdoor-herbs.png",
                en: "Storage Cabinet", bg: "Шкаф за съхранение"),
            Accessory("wall-shelf", 14.90m, "/images/lifestyle/kitchen-basil.png",
                en: "Wall Shelf", bg: "Стенна рафт"),
            Accessory("herb-knife", 6.90m, "/images/lifestyle/kitchen-caprese.png",
                en: "Herb Knife", bg: "Нож за билки"),
        };

        db.Products.AddRange(products);
        await db.SaveChangesAsync();
    }

    private static async Task SeedOrdersAsync(AppDbContext db)
    {
        var orders = new[]
        {
            MockOrder("PH-1042", "Elena Petrova", "elena.p@email.com", "+359 88 123 4567", CountryCode.BG, OrderStatus.Shipped, 108.99m, 2, "2026-07-07"),
            MockOrder("PH-1041", "Markus Weber", "m.weber@email.de", "+49 170 234 5678", CountryCode.DE, OrderStatus.Processing, 99.00m, 1, "2026-07-06"),
            MockOrder("PH-1040", "Sophie Martin", "sophie.m@email.fr", "+33 6 12 34 56 78", CountryCode.FR, OrderStatus.Delivered, 49.86m, 4, "2026-07-05"),
            MockOrder("PH-1039", "Ivan Dimitrov", "ivan.d@email.bg", "+359 87 654 3210", CountryCode.BG, OrderStatus.Pending, 129.00m, 1, "2026-07-05"),
            MockOrder("PH-1038", "Anna Kowalski", "anna.k@email.pl", "+48 501 234 567", CountryCode.PL, OrderStatus.Delivered, 34.77m, 3, "2026-07-04"),
            MockOrder("PH-1037", "Luca Rossi", "luca.r@email.it", "+39 333 456 7890", CountryCode.IT, OrderStatus.Cancelled, 24.90m, 1, "2026-07-03"),
            MockOrder("PH-1036", "Maria Santos", "maria.s@email.pt", "+351 912 345 678", CountryCode.PT, OrderStatus.Delivered, 119.89m, 2, "2026-07-02"),
            MockOrder("PH-1035", "Jan Novak", "jan.n@email.cz", "+420 601 234 567", CountryCode.CZ, OrderStatus.Delivered, 99.00m, 1, "2026-07-01"),
        };

        db.Orders.AddRange(orders);
        await db.SaveChangesAsync();
    }

    private static async Task SeedCustomersAsync(AppDbContext db)
    {
        var orders = await db.Orders.OrderBy(o => o.CreatedAt).ToListAsync();
        var index = 1;
        foreach (var group in orders.GroupBy(o => o.Email))
        {
            var first = group.OrderBy(o => o.CreatedAt).First();
            var customer = new Customer
            {
                Id = $"C-{index:D3}",
                Email = first.Email,
                Name = first.CustomerName,
                Phone = first.Phone,
                Country = first.Country,
                JoinedAt = first.CreatedAt
            };
            db.Customers.Add(customer);
            foreach (var order in group)
                order.CustomerId = customer.Id;
            index++;
        }

        await db.SaveChangesAsync();
    }

    private static Product Garden(
        string slug, decimal price, string image, ImageFit fit,
        (string id, string hex)[]? colors = null,
        decimal? compareAt = null,
        bool featured = false,
        (string name, string? tagline, string? description) en = default,
        (string name, string? tagline, string? description) bg = default)
    {
        return BuildProduct(slug, ProductCategory.Gardens, price, image, fit, null, colors, compareAt, featured, en, bg);
    }

    private static Product Pod(
        string slug, decimal price, string image, string packKey,
        (string name, string? tagline, string? description) en,
        (string name, string? tagline, string? description) bg)
    {
        return BuildProduct(slug, ProductCategory.Pods, price, image, ImageFit.Contain, packKey, null, null, false, en, bg);
    }

    private static Product Consumable(string slug, decimal price, string image, string packKey, string en, string bg) =>
        BuildProduct(slug, ProductCategory.Consumables, price, image, ImageFit.Cover, packKey, null, null, false,
            (en, null, null), (bg, null, null));

    private static Product Accessory(string slug, decimal price, string image, string en, string bg) =>
        BuildProduct(slug, ProductCategory.Accessories, price, image, ImageFit.Cover, null, null, null, false,
            (en, null, null), (bg, null, null));

    private static Product BuildProduct(
        string slug,
        ProductCategory category,
        decimal price,
        string image,
        ImageFit fit,
        string? packKey,
        (string id, string hex)[]? colors,
        decimal? compareAt,
        bool featured,
        (string name, string? tagline, string? description) en,
        (string name, string? tagline, string? description) bg)
    {
        var product = new Product
        {
            Slug = slug,
            Category = category,
            Price = price,
            CompareAtPrice = compareAt,
            PackKey = packKey,
            Image = image,
            ImageFit = fit,
            Featured = featured,
            Active = true,
            Translations =
            [
                new ProductTranslation { Language = "en", Name = en.name, Tagline = en.tagline, Description = en.description },
                new ProductTranslation { Language = "bg", Name = bg.name, Tagline = bg.tagline, Description = bg.description },
            ]
        };

        if (colors is not null)
        {
            foreach (var (id, hex) in colors)
                product.Colors.Add(new ProductColor { ColorId = id, Hex = hex });
        }

        return product;
    }

    private static Order MockOrder(
        string id, string name, string email, string phone, CountryCode country,
        OrderStatus status, decimal total, int itemCount, string date)
    {
        var created = DateTime.SpecifyKind(
            DateTime.Parse(date, System.Globalization.CultureInfo.InvariantCulture),
            DateTimeKind.Utc);
        var subtotal = total;
        return new Order
        {
            Id = id,
            CustomerName = name,
            Email = email,
            Phone = phone,
            Country = country,
            Status = status,
            PaymentMethod = PaymentMethod.Card,
            Subtotal = subtotal,
            ShippingCost = 0,
            Tax = 0,
            Total = total,
            CreatedAt = created,
            ShippingName = name,
            ShippingPhone = phone,
            ShippingStreet = "Demo street 1",
            ShippingCity = "Demo city",
            ShippingPostalCode = "1000",
            ShippingCountry = country,
            BillingName = name,
            BillingPhone = phone,
            BillingStreet = "Demo street 1",
            BillingCity = "Demo city",
            BillingPostalCode = "1000",
            BillingCountry = country,
            Items =
            [
                new OrderItem
                {
                    ProductSlug = "basil",
                    Category = ProductCategory.Pods,
                    Name = "Basil Seed Pods",
                    Quantity = itemCount,
                    UnitPrice = total / itemCount,
                    Total = total,
                    Image = "/images/stock/basil.jpg"
                }
            ],
            Timeline =
            [
                new OrderTimelineEntry { At = created, Status = OrderStatus.Pending, Note = "Order placed" },
                new OrderTimelineEntry { At = created.AddHours(2), Status = status }
            ]
        };
    }
}
