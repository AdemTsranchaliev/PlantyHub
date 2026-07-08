namespace PlantyHub.Api.Models;

public class Order
{
    public string Id { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public CountryCode Country { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string ShippingName { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string ShippingStreet { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public CountryCode ShippingCountry { get; set; }

    public string BillingName { get; set; } = string.Empty;
    public string BillingPhone { get; set; } = string.Empty;
    public string BillingStreet { get; set; } = string.Empty;
    public string BillingCity { get; set; } = string.Empty;
    public string BillingPostalCode { get; set; } = string.Empty;
    public CountryCode BillingCountry { get; set; }

    public Waybill? Waybill { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderTimelineEntry> Timeline { get; set; } = [];
}

public class OrderItem
{
    public Guid Id { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;
    public string ProductSlug { get; set; } = string.Empty;
    public ProductCategory Category { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public string Image { get; set; } = string.Empty;
}

public class OrderTimelineEntry
{
    public Guid Id { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;
    public DateTime At { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; }
    public string? Note { get; set; }
}

public class Waybill
{
    public Guid Id { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;
    public string Number { get; set; } = string.Empty;
    public CourierId Courier { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal WeightKg { get; set; }
    public int Packages { get; set; } = 1;
    public decimal? CodAmount { get; set; }
    public string? Notes { get; set; }
}
