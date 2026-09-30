using System.Globalization;
using System.IO.Compression;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PlantyHub.Api.Data;
using PlantyHub.Api.Dtos;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

public class AccountingReportService(AppDbContext db, VatService vat)
{
    static readonly CultureInfo Bg = CultureInfo.GetCultureInfo("bg-BG");
    static readonly Encoding Utf8Bom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
    static readonly TimeZoneInfo Sofia = ResolveSofia();

    static readonly IReadOnlyDictionary<string, string> CountryNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["AT"] = "Австрия",
        ["BE"] = "Белгия",
        ["BG"] = "България",
        ["HR"] = "Хърватия",
        ["CY"] = "Кипър",
        ["CZ"] = "Чехия",
        ["DK"] = "Дания",
        ["EE"] = "Естония",
        ["FI"] = "Финландия",
        ["FR"] = "Франция",
        ["DE"] = "Германия",
        ["GR"] = "Гърция",
        ["HU"] = "Унгария",
        ["IE"] = "Ирландия",
        ["IT"] = "Италия",
        ["LV"] = "Латвия",
        ["LT"] = "Литва",
        ["LU"] = "Люксембург",
        ["MT"] = "Малта",
        ["NL"] = "Нидерландия",
        ["PL"] = "Полша",
        ["PT"] = "Португалия",
        ["RO"] = "Румъния",
        ["SK"] = "Словакия",
        ["SI"] = "Словения",
        ["ES"] = "Испания",
        ["SE"] = "Швеция",
    };

    public async Task<AccountingReportPreviewDto> PreviewAsync(DateOnly? from, DateOnly? to, bool includeCancelled, CancellationToken ct = default)
    {
        var range = ResolveRange(from, to);
        var (orders, cancelledExcluded) = await LoadAsync(range, includeCancelled, ct);
        var settings = await vat.GetSettingsAsync(ct);
        var byCountry = VatByCountry(orders);

        return new AccountingReportPreviewDto
        {
            From = range.From.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            To = range.To.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            VatNumber = settings.VatNumber,
            OrderCount = orders.Count,
            CancelledExcluded = cancelledExcluded,
            Products = Round(orders.Sum(o => o.Subtotal)),
            Shipping = Round(orders.Sum(o => o.ShippingCost)),
            Net = Round(orders.Sum(Net)),
            Vat = Round(orders.Sum(o => o.Tax)),
            Gross = Round(orders.Sum(o => o.Total)),
            ByCountry = byCountry,
        };
    }

    public async Task<(string FileName, string ContentType, byte[] Bytes)> DownloadAsync(
        string kind,
        DateOnly? from,
        DateOnly? to,
        bool includeCancelled,
        CancellationToken ct = default)
    {
        var range = ResolveRange(from, to);
        var (orders, cancelledExcluded) = await LoadAsync(range, includeCancelled, ct);
        var settings = await vat.GetSettingsAsync(ct);
        var stamp = $"{range.From:yyyy-MM-dd}_{range.To:yyyy-MM-dd}";

        return kind.Trim().ToLowerInvariant() switch
        {
            "sales" => ($"plantyhub-prodazhbi-{stamp}.csv", CsvType, Csv(SalesRows(orders))),
            "vat" => ($"plantyhub-dds-{stamp}.csv", CsvType, Csv(VatRows(orders))),
            "items" => ($"plantyhub-stoki-{stamp}.csv", CsvType, Csv(ItemRows(orders))),
            "pack" => (
                $"plantyhub-otchet-{stamp}.zip",
                "application/zip",
                ZipPack(stamp, range, settings.VatNumber, includeCancelled, cancelledExcluded, orders)),
            _ => throw new ArgumentException("Unknown report kind."),
        };
    }

    async Task<(List<Order> Orders, int CancelledExcluded)> LoadAsync(DateRange range, bool includeCancelled, CancellationToken ct)
    {
        var fromUtc = ToUtc(range.From, TimeOnly.MinValue);
        var toUtc = ToUtc(range.To, new TimeOnly(23, 59, 59, 999));

        var query = db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Waybills)
            .Where(o => o.CreatedAt >= fromUtc && o.CreatedAt <= toUtc);

        var cancelledExcluded = includeCancelled
            ? 0
            : await query.CountAsync(o => o.Status == OrderStatus.Cancelled, ct);

        if (!includeCancelled)
            query = query.Where(o => o.Status != OrderStatus.Cancelled);

        var orders = await query.OrderBy(o => o.CreatedAt).ThenBy(o => o.Id).ToListAsync(ct);
        return (orders, cancelledExcluded);
    }

    byte[] ZipPack(string stamp, DateRange range, string vatNumber, bool includeCancelled, int cancelledExcluded, List<Order> orders)
    {
        using var ms = new MemoryStream();
        using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            AddEntry(zip, "procheti.txt", Utf8Bom.GetBytes(Readme(range, vatNumber, includeCancelled, cancelledExcluded, orders)));
            AddEntry(zip, $"obobshtenie-{stamp}.csv", Csv(SummaryRows(range, vatNumber, includeCancelled, cancelledExcluded, orders)));
            AddEntry(zip, $"prodazhbi-{stamp}.csv", Csv(SalesRows(orders)));
            AddEntry(zip, $"dds-po-darzhava-{stamp}.csv", Csv(VatRows(orders)));
            AddEntry(zip, $"stoki-{stamp}.csv", Csv(ItemRows(orders)));
        }
        return ms.ToArray();
    }

    static void AddEntry(ZipArchive zip, string name, byte[] bytes)
    {
        var entry = zip.CreateEntry(name, CompressionLevel.Fastest);
        using var stream = entry.Open();
        stream.Write(bytes);
    }

    IReadOnlyList<string[]> SummaryRows(DateRange range, string vatNumber, bool includeCancelled, int cancelledExcluded, List<Order> orders) =>
    [
        ["Поле", "Стойност"],
        ["Магазин", "PlantyHub"],
        ["ДДС номер", vatNumber],
        ["Валута", "EUR"],
        ["Период от", range.From.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture)],
        ["Период до", range.To.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture)],
        ["Поръчки", orders.Count.ToString(CultureInfo.InvariantCulture)],
        ["Анулирани изключени", includeCancelled ? "Не" : $"Да ({cancelledExcluded})"],
        ["Продукти", Money(orders.Sum(o => o.Subtotal))],
        ["Доставка в поръчката", Money(orders.Sum(o => o.ShippingCost))],
        ["Куриер търговец → клиент", Money(orders.SelectMany(o => o.Waybills).Where(w => w.Direction != "customer_to_merchant" && w.Purpose != "return").Sum(w => w.DeliveryCost ?? 0))],
        ["Куриер клиент → търговец", Money(orders.SelectMany(o => o.Waybills).Where(w => w.Direction == "customer_to_merchant" || w.Purpose == "return").Sum(w => w.DeliveryCost ?? 0))],
        ["Куриер за сметка на клиента", Money(orders.SelectMany(o => o.Waybills).Where(w => w.Payer != "merchant").Sum(w => w.DeliveryCost ?? 0))],
        ["Куриер за сметка на търговеца", Money(orders.SelectMany(o => o.Waybills).Where(w => w.Payer == "merchant").Sum(w => w.DeliveryCost ?? 0))],
        ["Данъчна основа", Money(orders.Sum(Net))],
        ["ДДС", Money(orders.Sum(o => o.Tax))],
        ["Общо", Money(orders.Sum(o => o.Total))],
        ["Забележка", "Данъчна основа = общо − ДДС. ДДС е по държава на доставка (стандартна ставка). CSV с разделител ; за Excel."],
    ];

    IReadOnlyList<string[]> SalesRows(List<Order> orders)
    {
        var rows = new List<string[]>();
        rows.Add([
            "Дата",
            "Номер",
            "Статус",
            "Клиент",
            "Имейл",
            "Телефон",
            "Държава",
            "Код",
            "Град",
            "Адрес",
            "Пощенски код",
            "Плащане",
            "Куриер",
            "Товарителница",
            "Посока и плащане",
            "Куриер търговец → клиент",
            "Куриер клиент → търговец",
            "За сметка на клиента",
            "За сметка на търговеца",
            "Продукти",
            "Доставка",
            "Данъчна основа",
            "ДДС %",
            "ДДС",
            "Общо",
            "Бележки",
        ]);

        foreach (var order in orders)
        {
            var country = CountryOf(order);
            rows.Add([
                Date(order.CreatedAt),
                order.Id,
                Status(order.Status),
                order.BillingName.Length > 0 ? order.BillingName : order.CustomerName,
                order.Email,
                order.BillingPhone.Length > 0 ? order.BillingPhone : order.Phone,
                CountryName(country),
                country,
                order.BillingCity.Length > 0 ? order.BillingCity : order.ShippingCity,
                order.BillingStreet.Length > 0 ? order.BillingStreet : order.ShippingStreet,
                order.BillingPostalCode.Length > 0 ? order.BillingPostalCode : order.ShippingPostalCode,
                Payment(order.PaymentMethod),
                order.ShippingCourier ?? order.Waybill?.Courier.ToString() ?? "",
                string.Join(" · ", order.Waybills.OrderBy(w => w.CreatedAt).Select(w => w.Number)),
                string.Join(" · ", order.Waybills.OrderBy(w => w.CreatedAt).Select(WaybillCostText)),
                Money(LegCost(order, toCustomer: true)),
                Money(LegCost(order, toCustomer: false)),
                Money(order.Waybills.Where(w => w.Payer != "merchant").Sum(w => w.DeliveryCost ?? 0)),
                Money(order.Waybills.Where(w => w.Payer == "merchant").Sum(w => w.DeliveryCost ?? 0)),
                Money(order.Subtotal),
                Money(order.ShippingCost),
                Money(Net(order)),
                Rate(order.TaxRate),
                Money(order.Tax),
                Money(order.Total),
                order.Notes ?? "",
            ]);
        }

        return rows;
    }

    IReadOnlyList<string[]> VatRows(List<Order> orders)
    {
        var rows = new List<string[]>();
        rows.Add(["Държава", "Код", "ДДС %", "Поръчки", "Данъчна основа", "ДДС", "Общо"]);
        foreach (var row in VatByCountry(orders))
        {
            rows.Add([
                row.CountryName,
                row.Country,
                Rate(row.RatePercent),
                row.Orders.ToString(CultureInfo.InvariantCulture),
                Money(row.Net),
                Money(row.Vat),
                Money(row.Gross),
            ]);
        }
        return rows;
    }

    IReadOnlyList<string[]> ItemRows(List<Order> orders)
    {
        var rows = new List<string[]>();
        rows.Add(["Дата", "Номер", "Продукт", "Категория", "Количество", "Ед. цена", "Сума", "Подарък"]);
        foreach (var order in orders)
        {
            foreach (var item in order.Items.OrderBy(i => i.Name))
            {
                rows.Add([
                    Date(order.CreatedAt),
                    order.Id,
                    item.Name,
                    Category(item.Category),
                    item.Quantity.ToString(CultureInfo.InvariantCulture),
                    Money(item.UnitPrice),
                    Money(item.Total),
                    item.GiftName ?? "",
                ]);
            }
        }
        return rows;
    }

    List<AccountingVatCountryDto> VatByCountry(IReadOnlyList<Order> orders) =>
        orders
            .GroupBy(o => (Country: CountryOf(o), Rate: o.TaxRate ?? 0m))
            .OrderBy(g => g.Key.Country)
            .ThenBy(g => g.Key.Rate)
            .Select(g => new AccountingVatCountryDto
            {
                Country = g.Key.Country,
                CountryName = CountryName(g.Key.Country),
                RatePercent = g.Key.Rate,
                Orders = g.Count(),
                Net = Round(g.Sum(Net)),
                Vat = Round(g.Sum(o => o.Tax)),
                Gross = Round(g.Sum(o => o.Total)),
            })
            .ToList();

    string Readme(DateRange range, string vatNumber, bool includeCancelled, int cancelledExcluded, List<Order> orders)
    {
        var excluded = includeCancelled ? "Анулираните поръчки са включени." : $"Анулираните поръчки не са включени ({cancelledExcluded} бр.).";
        return
            """
            PlantyHub — счетоводен отчет
            ============================

            """
            + $"Период: {range.From:dd.MM.yyyy} – {range.To:dd.MM.yyyy}\n"
            + $"ДДС номер: {(string.IsNullOrWhiteSpace(vatNumber) ? "—" : vatNumber)}\n"
            + "Валута: EUR\n"
            + $"Поръчки: {orders.Count}\n"
            + $"{excluded}\n\n"
            + """
            Файловете са CSV с разделител ; (отварят се директно в Excel).
            Десетичен знак е запетая.

            obobshtenie-*.csv       Обобщение за периода
            prodazhbi-*.csv         Дневник на продажбите — по една поръчка
            dds-po-darzhava-*.csv   ДДС по държава (OSS / стандартна ставка)
            stoki-*.csv             Редове по продукти

            Данъчна основа = общо − ДДС.
            ДДС е по държава на доставка. Извън ЕС ставката е 0% (износ).
            Доставка в поръчката е сумата, начислена на клиента при покупка.
            Куриерските редове са реалната цена на товарителницата, с посока и кой я плаща.
            """;
    }

    const string CsvType = "text/csv; charset=utf-8";

    static byte[] Csv(IReadOnlyList<string[]> rows)
    {
        var sb = new StringBuilder();
        foreach (var row in rows)
        {
            sb.Append(string.Join(';', row.Select(Escape)));
            sb.Append("\r\n");
        }
        return Utf8Bom.GetBytes(sb.ToString());
    }

    static string Escape(string value)
    {
        value ??= "";
        if (value.Contains('"') || value.Contains(';') || value.Contains('\n') || value.Contains('\r'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }

    static DateRange ResolveRange(DateOnly? from, DateOnly? to)
    {
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Sofia));
        var start = from ?? new DateOnly(today.Year, today.Month, 1);
        var end = to ?? start.AddMonths(1).AddDays(-1);
        return start <= end ? new DateRange(start, end) : new DateRange(end, start);
    }

    static DateTime ToUtc(DateOnly date, TimeOnly time) =>
        TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(time, DateTimeKind.Unspecified), Sofia);

    static TimeZoneInfo ResolveSofia()
    {
        foreach (var id in new[] { "Europe/Sofia", "FLE Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
            catch (InvalidTimeZoneException) { }
        }
        return TimeZoneInfo.Utc;
    }

    static decimal Net(Order order) => order.Total - order.Tax;
    static decimal Round(decimal amount) => Math.Round(amount, 2, MidpointRounding.AwayFromZero);
    static bool IsReturnLeg(Waybill bill) =>
        bill.Direction == "customer_to_merchant" || bill.Purpose is "return" or "unclaimed";

    static decimal LegCost(Order order, bool toCustomer) =>
        order.Waybills.Where(w => toCustomer ? !IsReturnLeg(w) : IsReturnLeg(w)).Sum(w => w.DeliveryCost ?? 0);

    static string WaybillCostText(Waybill bill)
    {
        var direction = IsReturnLeg(bill) ? "клиент → търговец" : "търговец → клиент";
        var payer = bill.Payer == "merchant" ? "плаща търговец" : "плаща клиент";
        var cost = bill.DeliveryCost is decimal amount ? Money(amount) : "—";
        return $"{direction}, {payer}, {cost}";
    }

    static string Money(decimal amount) => Round(amount).ToString("0.00", Bg);
    static string Rate(decimal? rate) => (rate ?? 0m).ToString("0.##", Bg);
    static string Date(DateTime value)
    {
        var utc = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };
        return TimeZoneInfo.ConvertTimeFromUtc(utc, Sofia).ToString("dd.MM.yyyy", CultureInfo.InvariantCulture);
    }

    static string CountryOf(Order order)
    {
        var raw = order.BillingCountry.Length > 0 ? order.BillingCountry
            : order.ShippingCountry.Length > 0 ? order.ShippingCountry
            : order.Country;
        var iso = raw.Trim().ToUpperInvariant();
        return iso.Length >= 2 ? iso[..2] : "BG";
    }

    static string CountryName(string iso2) => CountryNames.TryGetValue(iso2, out var name) ? name : iso2;

    static string Status(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "Чакаща",
        OrderStatus.Processing => "Обработва се",
        OrderStatus.Shipped => "Изпратена",
        OrderStatus.Delivered => "Доставена",
        OrderStatus.Cancelled => "Анулирана",
        OrderStatus.Returned => "Върната след получаване",
        OrderStatus.Claim => "Рекламация",
        OrderStatus.Replacement => "За замяна",
        OrderStatus.ReplacementShipped => "Товарителница за замяна",
        OrderStatus.Replaced => "Заменена",
        OrderStatus.ReturnShipped => "Връщане с товарителница",
        OrderStatus.ReturnedAfterReview => "Върната след преглед",
        OrderStatus.Unclaimed => "Непотърсена",
        _ => status.ToString(),
    };

    static string Payment(PaymentMethod method) => method switch
    {
        PaymentMethod.Card => "Карта",
        PaymentMethod.Cod => "Наложен платеж",
        PaymentMethod.Paypal => "PayPal",
        _ => method.ToString(),
    };

    static string Category(ProductCategory category) => category switch
    {
        ProductCategory.Gardens => "Градини",
        ProductCategory.Pods => "Семена",
        ProductCategory.Consumables => "Консумативи",
        ProductCategory.Accessories => "Аксесоари",
        _ => category.ToString(),
    };

    readonly record struct DateRange(DateOnly From, DateOnly To);
}
