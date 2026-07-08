using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class ProductMapper
{
    public static ProductDto ToDto(Product product) =>
        new(
            product.Slug,
            EnumMapper.ToApi(product.Category),
            PriceHelper.FormatEuro(product.Price),
            product.CompareAtPrice.HasValue ? PriceHelper.FormatEuro(product.CompareAtPrice.Value) : null,
            product.PackKey,
            product.Image,
            EnumMapper.ToApi(product.ImageFit),
            product.Featured,
            product.Active,
            product.Colors.Select(c => new ProductColorDto(c.ColorId, c.Hex)).ToList(),
            product.Translations.ToDictionary(
                t => t.Language,
                t => new ProductLocaleDto(t.Name, t.Tagline, t.Description)));

    public static ProductsByCategoryDto GroupByCategory(IEnumerable<Product> products)
    {
        var list = products.Select(ToDto).ToList();
        return new ProductsByCategoryDto(
            list.Where(p => p.Category == "gardens").ToList(),
            list.Where(p => p.Category == "pods").ToList(),
            list.Where(p => p.Category == "consumables").ToList(),
            list.Where(p => p.Category == "accessories").ToList());
    }
}

public class OrderMapper
{
    public static OrderSummaryDto ToSummary(Order order) =>
        new(
            order.Id,
            order.CustomerName,
            order.Email,
            EnumMapper.ToApi(order.Country),
            order.Items.Sum(i => i.Quantity),
            PriceHelper.FormatEuro(order.Total),
            EnumMapper.ToApi(order.Status),
            order.CreatedAt.ToString("yyyy-MM-dd"));

    public static OrderDetailDto ToDetail(Order order) =>
        new(
            order.Id,
            order.CustomerName,
            order.Email,
            EnumMapper.ToApi(order.Country),
            order.Items.Sum(i => i.Quantity),
            PriceHelper.FormatEuro(order.Total),
            EnumMapper.ToApi(order.Status),
            order.CreatedAt.ToString("yyyy-MM-dd"),
            order.CustomerId ?? $"C-{order.Email}",
            order.Phone,
            order.Items.Select(i => new OrderLineItemDto(
                i.Id.ToString(),
                i.ProductSlug,
                i.ProductSlug,
                i.Name,
                EnumMapper.ToApi(i.Category),
                i.Quantity,
                PriceHelper.FormatEuro(i.UnitPrice),
                PriceHelper.FormatEuro(i.Total),
                i.Image)).ToList(),
            new OrderAddressDto(
                order.ShippingName,
                order.ShippingPhone,
                order.ShippingStreet,
                order.ShippingCity,
                order.ShippingPostalCode,
                EnumMapper.ToApi(order.ShippingCountry)),
            new OrderAddressDto(
                order.BillingName,
                order.BillingPhone,
                order.BillingStreet,
                order.BillingCity,
                order.BillingPostalCode,
                EnumMapper.ToApi(order.BillingCountry)),
            EnumMapper.ToApi(order.PaymentMethod),
            PriceHelper.FormatEuro(order.Subtotal),
            PriceHelper.FormatEuro(order.ShippingCost),
            PriceHelper.FormatEuro(order.Tax),
            order.Notes,
            order.Waybill is null
                ? null
                : new WaybillDto(
                    order.Waybill.Number,
                    EnumMapper.ToApi(order.Waybill.Courier),
                    order.Waybill.CreatedAt.ToString("o"),
                    order.Waybill.WeightKg,
                    order.Waybill.Packages,
                    order.Waybill.CodAmount.HasValue ? PriceHelper.FormatEuro(order.Waybill.CodAmount.Value) : null,
                    order.Waybill.Notes),
            order.Timeline
                .OrderBy(t => t.At)
                .Select(t => new OrderTimelineDto(t.At.ToString("o"), EnumMapper.ToApi(t.Status), t.Note))
                .ToList());
}

public class CustomerService(AppDbContext db)
{
    public async Task<Customer> UpsertFromOrderAsync(Order order, CancellationToken ct = default)
    {
        var email = order.Email.Trim().ToLowerInvariant();
        var existing = await db.Customers.FirstOrDefaultAsync(c => c.Email == email, ct);
        if (existing is not null)
        {
            existing.Name = order.CustomerName;
            existing.Phone = order.Phone;
            existing.Country = order.Country;
            order.CustomerId = existing.Id;
            await db.SaveChangesAsync(ct);
            return existing;
        }

        var count = await db.Customers.CountAsync(ct);
        var customer = new Customer
        {
            Id = $"C-{(count + 1):D3}",
            Email = email,
            Name = order.CustomerName,
            Phone = order.Phone,
            Country = order.Country,
            JoinedAt = order.CreatedAt
        };

        db.Customers.Add(customer);
        order.CustomerId = customer.Id;
        await db.SaveChangesAsync(ct);
        return customer;
    }

    public async Task<IReadOnlyList<AdminCustomerDto>> GetAllAsync(CancellationToken ct = default)
    {
        var customers = await db.Customers
            .Include(c => c.Orders)
            .OrderByDescending(c => c.JoinedAt)
            .ToListAsync(ct);

        return customers.Select(c => new AdminCustomerDto(
            c.Id,
            c.Name,
            c.Email,
            c.Phone,
            EnumMapper.ToApi(c.Country),
            c.Orders.Count,
            PriceHelper.FormatEuro(c.Orders.Sum(o => o.Total)),
            c.JoinedAt.ToString("yyyy-MM-dd"))).ToList();
    }

    public async Task<AdminCustomerDetailDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var customer = await db.Customers
            .Include(c => c.Orders)
            .ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (customer is null) return null;

        var dto = new AdminCustomerDto(
            customer.Id,
            customer.Name,
            customer.Email,
            customer.Phone,
            EnumMapper.ToApi(customer.Country),
            customer.Orders.Count,
            PriceHelper.FormatEuro(customer.Orders.Sum(o => o.Total)),
            customer.JoinedAt.ToString("yyyy-MM-dd"));

        var orders = customer.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Select(OrderMapper.ToSummary)
            .ToList();

        return new AdminCustomerDetailDto(dto, orders);
    }
}

public class OrderService(AppDbContext db, CustomerService customers)
{
    public async Task<Order?> GetByIdAsync(string id, CancellationToken ct = default) =>
        await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Timeline)
            .Include(o => o.Waybill)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default) =>
        await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Timeline)
            .Include(o => o.Waybill)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Order>> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await db.Orders
            .Include(o => o.Items)
            .Include(o => o.Timeline)
            .Include(o => o.Waybill)
            .Where(o => o.Email == email)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<Order> CreateFromCheckoutAsync(CheckoutRequest request, string? userId, CancellationToken ct = default)
    {
        if (request.Items.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        var country = EnumMapper.ParseCountry(request.Country);
        var paymentMethod = EnumMapper.ParsePaymentMethod(request.PaymentMethod);

        var lineItems = new List<(CheckoutLineItemRequest Item, Product Product, decimal UnitPrice)>();
        foreach (var item in request.Items)
        {
            var product = await db.Products
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Slug == item.ProductId && p.Active, ct);

            if (product is null)
                throw new InvalidOperationException($"Product '{item.ProductId}' is not available.");

            lineItems.Add((item, product, product.Price));
        }

        var subtotal = lineItems.Sum(x => x.UnitPrice * x.Item.Quantity);
        var shipping = PriceHelper.CalcShipping(subtotal);
        var total = subtotal + shipping;
        var now = DateTime.UtcNow;
        var orderId = $"PH-{now:yyMMddHHmmss}"[..11];

        var order = new Order
        {
            Id = orderId,
            UserId = userId,
            CustomerName = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            Country = country,
            Status = OrderStatus.Pending,
            PaymentMethod = paymentMethod,
            Subtotal = subtotal,
            ShippingCost = shipping,
            Tax = 0m,
            Total = total,
            Notes = request.Notes,
            CreatedAt = now,
            ShippingName = request.Name.Trim(),
            ShippingPhone = request.Phone.Trim(),
            ShippingStreet = request.Street.Trim(),
            ShippingCity = request.City.Trim(),
            ShippingPostalCode = request.PostalCode.Trim(),
            ShippingCountry = country,
            BillingName = request.Name.Trim(),
            BillingPhone = request.Phone.Trim(),
            BillingStreet = request.Street.Trim(),
            BillingCity = request.City.Trim(),
            BillingPostalCode = request.PostalCode.Trim(),
            BillingCountry = country,
            Timeline =
            [
                new OrderTimelineEntry
                {
                    At = now,
                    Status = OrderStatus.Pending,
                    Note = "Order placed"
                }
            ]
        };

        foreach (var (item, product, unitPrice) in lineItems)
        {
            var name = product.Translations.FirstOrDefault(t => t.Language == "en")?.Name
                ?? product.Translations.FirstOrDefault()?.Name
                ?? item.Name;

            order.Items.Add(new OrderItem
            {
                ProductSlug = product.Slug,
                Category = product.Category,
                Name = name,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                Total = unitPrice * item.Quantity,
                Image = product.Image
            });
        }

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        await customers.UpsertFromOrderAsync(order, ct);
        return order;
    }

    public async Task<Order?> UpdateStatusAsync(string id, string status, CancellationToken ct = default)
    {
        var order = await GetByIdAsync(id, ct);
        if (order is null) return null;

        var orderStatus = EnumMapper.ParseOrderStatus(status);
        order.Status = orderStatus;
        order.Timeline.Add(new OrderTimelineEntry
        {
            At = DateTime.UtcNow,
            Status = orderStatus
        });

        await db.SaveChangesAsync(ct);
        return order;
    }

    public async Task<Order?> CreateWaybillAsync(string id, CreateWaybillRequest request, CancellationToken ct = default)
    {
        var order = await GetByIdAsync(id, ct);
        if (order is null) return null;

        if (order.Waybill is not null)
            throw new InvalidOperationException("Waybill already exists for this order.");

        var now = DateTime.UtcNow;
        order.Waybill = new Waybill
        {
            Number = request.Number.Trim(),
            Courier = EnumMapper.ParseCourier(request.Courier),
            CreatedAt = now,
            WeightKg = request.WeightKg,
            Packages = request.Packages,
            CodAmount = request.CodAmount,
            Notes = request.Notes
        };
        order.Status = OrderStatus.Shipped;
        order.Timeline.Add(new OrderTimelineEntry
        {
            At = now,
            Status = OrderStatus.Shipped,
            Note = $"Waybill {request.Number.Trim()}"
        });

        await db.SaveChangesAsync(ct);
        return order;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order is null) return false;

        db.Orders.Remove(order);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<Order?> CancelAsync(string id, CancellationToken ct = default) =>
        await UpdateStatusAsync(id, "cancelled", ct);
}

public class ProductService(AppDbContext db)
{
    public async Task<IReadOnlyList<Product>> GetAllActiveAsync(CancellationToken ct = default) =>
        await Query().Where(p => p.Active).ToListAsync(ct);

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken ct = default) =>
        await Query().ToListAsync(ct);

    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(ProductCategory category, bool activeOnly, CancellationToken ct = default)
    {
        var query = Query().Where(p => p.Category == category);
        if (activeOnly) query = query.Where(p => p.Active);
        return await query.ToListAsync(ct);
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await Query().FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public async Task<Product> CreateAsync(AdminProductUpsertRequest request, CancellationToken ct = default)
    {
        ValidateUpsert(request);
        var slug = NormalizeSlug(request.Id);

        if (await db.Products.AnyAsync(p => p.Slug == slug, ct))
            throw new InvalidOperationException($"Product '{slug}' already exists.");

        var product = MapToEntity(request, slug);
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        return product;
    }

    public async Task<Product?> UpdateAsync(string slug, AdminProductUpsertRequest request, CancellationToken ct = default)
    {
        ValidateUpsert(request);
        var product = await GetBySlugAsync(slug, ct);
        if (product is null) return null;

        product.Category = EnumMapper.ParseCategory(request.Category);
        product.Price = PriceHelper.ParseEuro(request.Price);
        product.CompareAtPrice = string.IsNullOrWhiteSpace(request.CompareAt)
            ? null
            : PriceHelper.ParseEuro(request.CompareAt);
        product.PackKey = request.PackKey;
        product.Image = request.Image.Trim();
        product.ImageFit = EnumMapper.ParseImageFit(request.ImageFit);
        product.Featured = request.Featured;
        product.Active = request.Active;

        db.ProductTranslations.RemoveRange(product.Translations);
        product.Translations.Clear();
        ApplyLocales(product, request.Locales);

        db.ProductColors.RemoveRange(product.Colors);
        product.Colors.Clear();
        ApplyColors(product, request.Colors);

        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return product;
    }

    public async Task<Product?> SetActiveAsync(string slug, bool active, CancellationToken ct = default)
    {
        var product = await GetBySlugAsync(slug, ct);
        if (product is null) return null;

        product.Active = active;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return product;
    }

    public async Task<bool> DeleteAsync(string slug, CancellationToken ct = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Slug == slug, ct);
        if (product is null) return false;

        db.Products.Remove(product);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private IQueryable<Product> Query() =>
        db.Products
            .Include(p => p.Translations)
            .Include(p => p.Colors)
            .OrderBy(p => p.Category)
            .ThenBy(p => p.Slug);

    private static string NormalizeSlug(string id)
    {
        var slug = EnumMapper.Slugify(id);
        if (string.IsNullOrWhiteSpace(slug))
            throw new InvalidOperationException("Product id is required.");
        return slug;
    }

    private static void ValidateUpsert(AdminProductUpsertRequest request)
    {
        if (request.Locales.Count == 0 || !request.Locales.Values.Any(l => !string.IsNullOrWhiteSpace(l.Name)))
            throw new InvalidOperationException("At least one product name is required.");

        if (PriceHelper.ParseEuro(request.Price) <= 0)
            throw new InvalidOperationException("Price must be greater than zero.");
    }

    private static Product MapToEntity(AdminProductUpsertRequest request, string slug)
    {
        var product = new Product
        {
            Slug = slug,
            Category = EnumMapper.ParseCategory(request.Category),
            Price = PriceHelper.ParseEuro(request.Price),
            CompareAtPrice = string.IsNullOrWhiteSpace(request.CompareAt)
                ? null
                : PriceHelper.ParseEuro(request.CompareAt),
            PackKey = request.PackKey,
            Image = request.Image.Trim(),
            ImageFit = EnumMapper.ParseImageFit(request.ImageFit),
            Featured = request.Featured,
            Active = request.Active
        };

        ApplyLocales(product, request.Locales);
        ApplyColors(product, request.Colors);
        return product;
    }

    private static void ApplyLocales(Product product, IReadOnlyDictionary<string, ProductLocaleDto> locales)
    {
        foreach (var (language, locale) in locales)
        {
            if (string.IsNullOrWhiteSpace(locale.Name)) continue;
            product.Translations.Add(new ProductTranslation
            {
                Language = language,
                Name = locale.Name.Trim(),
                Tagline = locale.Tagline?.Trim(),
                Description = locale.Description?.Trim()
            });
        }
    }

    private static void ApplyColors(Product product, IReadOnlyList<ProductColorDto>? colors)
    {
        if (colors is null) return;
        foreach (var color in colors)
        {
            product.Colors.Add(new ProductColor
            {
                ColorId = color.Id,
                Hex = color.Hex
            });
        }
    }
}

public class AdminDashboardService(AppDbContext db)
{
    public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var orders = await db.Orders.Include(o => o.Items).ToListAsync(ct);
        var delivered = orders.Where(o => o.Status is OrderStatus.Delivered or OrderStatus.Shipped).ToList();
        var monthOrders = orders.Where(o => o.CreatedAt >= monthStart).ToList();
        var subscribers = await db.NewsletterSubscribers.CountAsync(s => s.Active, ct);

        var topProducts = orders
            .SelectMany(o => o.Items)
            .GroupBy(i => new { i.ProductSlug, i.Category })
            .Select(g => new TopProductDto(
                g.Key.ProductSlug,
                g.Key.ProductSlug,
                EnumMapper.ToApi(g.Key.Category),
                g.Sum(i => i.Quantity),
                PriceHelper.FormatEuro(g.Sum(i => i.Total))))
            .OrderByDescending(p => p.Sales)
            .Take(5)
            .ToList();

        var weeklySales = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var day = now.Date.AddDays(-6 + offset);
                var amount = orders
                    .Where(o => o.CreatedAt.Date == day)
                    .Sum(o => o.Total);
                return new WeeklySaleDto(day.ToString("ddd", System.Globalization.CultureInfo.InvariantCulture).ToLowerInvariant(), amount);
            })
            .ToList();

        var stats = new DashboardStatsDto(
            delivered.Sum(o => o.Total),
            12.4m,
            monthOrders.Count,
            8.2m,
            monthOrders.Count == 0 ? 0 : monthOrders.Average(o => o.Total),
            3.1m,
            3.2m,
            0.4m,
            orders.Count(o => o.Status == OrderStatus.Pending),
            8420,
            subscribers);

        return new DashboardDto(stats, weeklySales, topProducts);
    }
}

public class NewsletterService(AppDbContext db)
{
    public async Task<int> GetActiveCountAsync(CancellationToken ct = default) =>
        await db.NewsletterSubscribers.CountAsync(s => s.Active, ct);

    public async Task<IReadOnlyList<NewsletterSubscriberDto>> GetAllAsync(CancellationToken ct = default) =>
        await db.NewsletterSubscribers
            .OrderByDescending(s => s.SubscribedAt)
            .Select(s => new NewsletterSubscriberDto(s.Email, s.SubscribedAt.ToString("yyyy-MM-dd"), s.Active))
            .ToListAsync(ct);

    public async Task<bool> UnsubscribeAsync(string email, CancellationToken ct = default)
    {
        var subscriber = await db.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Email == email.Trim().ToLowerInvariant(), ct);
        if (subscriber is null) return false;

        subscriber.Active = false;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAsync(string email, CancellationToken ct = default)
    {
        var subscriber = await db.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Email == email.Trim().ToLowerInvariant(), ct);
        if (subscriber is null) return false;

        db.NewsletterSubscribers.Remove(subscriber);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
