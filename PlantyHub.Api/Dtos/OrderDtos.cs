using PlantyHub.Api.Models;

namespace PlantyHub.Api.Dtos;

public record OrderLineItemDto(
    string Id,
    string ProductId,
    string NameKey,
    string? Name,
    string CategoryKey,
    int Quantity,
    string UnitPrice,
    string Total,
    string Image);

public record OrderAddressDto(
    string Name,
    string Phone,
    string Street,
    string City,
    string PostalCode,
    string Country);

public record WaybillDto(
    string Number,
    string Courier,
    string CreatedAt,
    decimal WeightKg,
    int Packages,
    string? CodAmount,
    string? Notes);

public record OrderTimelineDto(string At, string Status, string? Note);

public record OrderSummaryDto(
    string Id,
    string Customer,
    string Email,
    string Country,
    int Items,
    string Total,
    string Status,
    string Date);

public record OrderDetailDto(
    string Id,
    string Customer,
    string Email,
    string Country,
    int Items,
    string Total,
    string Status,
    string Date,
    string CustomerId,
    string Phone,
    IReadOnlyList<OrderLineItemDto> LineItems,
    OrderAddressDto Shipping,
    OrderAddressDto Billing,
    string PaymentMethod,
    string Subtotal,
    string ShippingCost,
    string Tax,
    string? Notes,
    WaybillDto? Waybill,
    IReadOnlyList<OrderTimelineDto> Timeline);

public record CheckoutLineItemRequest(
    string ProductId,
    string Category,
    string Name,
    int Quantity,
    string Price,
    string Image);

public record CheckoutRequest(
    string Name,
    string Email,
    string Phone,
    string Street,
    string City,
    string PostalCode,
    string Country,
    string PaymentMethod,
    string? Notes,
    IReadOnlyList<CheckoutLineItemRequest> Items);

public record UpdateOrderStatusRequest(string Status);

public record CreateWaybillRequest(
    string Number,
    string Courier,
    decimal WeightKg,
    int Packages,
    decimal? CodAmount,
    string? Notes);
