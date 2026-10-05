namespace PlantyHub.Api.Models;

public enum ProductCategory
{
    Gardens,
    Pods,
    Consumables,
    Accessories
}

public enum ImageFit
{
    Cover,
    Contain
}

public enum GrowingDifficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

public enum CountryCode
{
    BG,
    DE,
    FR,
    PL,
    IT,
    PT,
    CZ
}

public enum OrderStatus
{
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled,
    Returned,
    Claim,
    Replacement,
    ReplacementShipped,
    Replaced,
    ReturnShipped,
    ReturnedAfterReview,
    Unclaimed
}

public enum PaymentMethod
{
    Card,
    Cod,
    Paypal
}

public enum CourierId
{
    Econt,
    Speedy,
    Dhl,
    Boxnow
}

public enum ReviewStatus
{
    Pending,
    Published,
    Hidden
}
