namespace PlantyHub.Api.Dtos;

public record AdminCustomerDto(
    string Id,
    string Name,
    string Email,
    string Phone,
    string Country,
    int Orders,
    string TotalSpent,
    string Joined);

public record AdminCustomerDetailDto(
    AdminCustomerDto Customer,
    IReadOnlyList<OrderSummaryDto> Orders);

public record DashboardStatsDto(
    decimal TotalRevenue,
    decimal RevenueTrend,
    int OrdersThisMonth,
    decimal OrdersTrend,
    decimal AvgOrderValue,
    decimal AvgOrderTrend,
    decimal ConversionRate,
    decimal ConversionTrend,
    int PendingOrders,
    int VisitorsThisMonth,
    int NewsletterSubscribers);

public record WeeklySaleDto(string DayKey, decimal Amount);

public record TopProductDto(
    string Id,
    string NameKey,
    string CategoryKey,
    int Sales,
    string Revenue);

public record DashboardDto(
    DashboardStatsDto Stats,
    IReadOnlyList<WeeklySaleDto> WeeklySales,
    IReadOnlyList<TopProductDto> TopProducts);

public record NewsletterSubscriberDto(string Email, string SubscribedAt, bool Active);
