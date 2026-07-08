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
    Cancelled
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
    Dhl
}
