using PlantyHub.Api.Models;

namespace PlantyHub.Api.Dtos;

public record OrderLineGiftDto(string Name, string Image, string? CompareAt);

public record OrderLineItemDto(
    string Id,
    string ProductId,
    string NameKey,
    string? Name,
    string CategoryKey,
    int Quantity,
    string UnitPrice,
    string Total,
    string Image,
    OrderLineGiftDto? Gift);

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
    string? Notes,
    string? TrackingUrl,
    string? ExternalId,
    string? Mode,
    string? LabelUrl = null,
    string Purpose = "shipment",
    string Direction = "merchant_to_customer",
    string Payer = "customer",
    string? DeliveryCost = null);

public record OrderTimelineDto(string At, string Status, string? Note);

public record OrderSummaryDto(
    string Id,
    string Customer,
    string Email,
    string Country,
    int Items,
    string Total,
    string Status,
    string Date,
    string? Courier,
    string? WaybillNumber);

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
    IReadOnlyList<OrderTimelineDto> Timeline,
    decimal? TaxRate = null,
    string? ShippingCourier = null,
    string? ShippingDelivery = null,
    string? ShippingOfficeCode = null,
    IReadOnlyList<WaybillDto>? Waybills = null,
    string? Discount = null,
    string? PromoCode = null);

public record EcontCheckIssueDto(string Code, string Severity, string? Message);

public record EcontCheckDto(
    bool Ok,
    bool Cod,
    string? CodAmount,
    IReadOnlyList<EcontCheckIssueDto> Issues,
    decimal? Price,
    string? Currency);

public record EcontStatusEventDto(string Time, string Event, string? Place);

public record EcontStatusDto(
    string Status,
    string? StatusEn,
    IReadOnlyList<EcontStatusEventDto> Events);

public record EcontStatusResponse(OrderDetailDto Order, EcontStatusDto Courier);

public record CheckoutLineItemRequest(
    string ProductId,
    string Category,
    string Name,
    int Quantity,
    string Price,
    string Image)
{
    public string? GiftName { get; init; }
    public string? GiftImage { get; init; }
    public string? GiftCompareAt { get; init; }
}

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
    IReadOnlyList<CheckoutLineItemRequest> Items,
    string? Courier = null,
    string? Delivery = null,
    string? OfficeCode = null,
    string? CityId = null,
    string? PromoCode = null,
    bool TermsAccepted = false);

public record UpdateOrderStatusRequest(string Status, string? Note = null);

public record CreateWaybillRequest(
    string Courier,
    decimal WeightKg,
    int Packages,
    decimal? CodAmount,
    string? Notes,
    string? Payer = null);

public record EcontCheckRequest(string? Courier, decimal WeightKg = 1.5m, int Packages = 1);
