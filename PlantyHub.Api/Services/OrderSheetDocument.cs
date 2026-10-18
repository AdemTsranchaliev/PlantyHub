using System.Globalization;
using System.Net;
using PlantyHub.Api.Models;

namespace PlantyHub.Api.Services;

/// <summary>Customer order file attached to the confirmation email. Bulgarian, same layout as the admin download.</summary>
public static class OrderSheetDocument
{
    const string Logo = "https://media.plantyhub.com/logo.png";

    public static string Render(Order order)
    {
        var cod = order.PaymentMethod == PaymentMethod.Cod;
        var date = order.CreatedAt.ToUniversalTime().ToString("dd.MM.yyyy", CultureInfo.InvariantCulture);
        var courier = CourierName(order.Waybill?.Courier.ToString() ?? order.ShippingCourier);
        var delivery = order.ShippingDelivery == "office"
            ? $"До офис {H(string.IsNullOrWhiteSpace(order.ShippingOfficeCode) ? "—" : order.ShippingOfficeCode)}"
            : "До адрес";
        var ship = string.Join(" · ", new[] { courier, delivery }.Where(s => !string.IsNullOrWhiteSpace(s)));
        var bills = order.Waybills.OrderBy(w => w.CreatedAt).ToList();

        var items = string.Concat(order.Items.Select(item =>
        {
            var gift = string.IsNullOrWhiteSpace(item.GiftName) ? "" : $"<div class=\"gift\">Подарък: {H(item.GiftName)}</div>";
            return $"""
                <tr>
                  <td><div class="name">{H(item.Name)}</div>{gift}</td>
                  <td class="num">{item.Quantity}</td>
                  <td class="num">{H(PriceHelper.FormatEuro(item.UnitPrice))}</td>
                  <td class="num total">{H(PriceHelper.FormatEuro(item.Total))}</td>
                </tr>
                """;
        }));

        var discount = order.Discount > 0
            ? Sum(string.IsNullOrWhiteSpace(order.PromoCode) ? "Отстъпка" : $"Отстъпка ({order.PromoCode})", "−" + PriceHelper.FormatEuro(order.Discount))
            : "";
        var vatNote = order.Tax > 0
            ? "<p style=\"margin:6px 0 0;font-size:12px;color:#5c675f;\">Цената е с ДДС.</p>"
            : "";
        var waybills = bills.Count == 0
            ? ""
            : "<h2 class=\"section\">Товарителница</h2><div class=\"bills\">" + string.Concat(bills.Select(bill =>
            {
                var purpose = bill.Purpose switch
                {
                    "return" => "Връщане по рекламация",
                    "replacement" => "Замяна към клиента",
                    "unclaimed" => "Непотърсена, връща се",
                    _ => "Пратка към клиента",
                };
                var name = CourierName(bill.Courier.ToString());
                var track = string.IsNullOrWhiteSpace(bill.TrackingUrl)
                    ? ""
                    : $"<a class=\"track\" href=\"{H(bill.TrackingUrl)}\">Проследи</a>";
                return $"""
                    <article class="bill">
                      <div>
                        <div class="kicker">{H(purpose)} · {H(name)}</div>
                        <div class="awb">{H(bill.Number)}</div>
                      </div>
                      {track}
                    </article>
                    """;
            })) + "</div>";
        var notes = string.IsNullOrWhiteSpace(order.Notes)
            ? ""
            : $"<h2 class=\"section\">Бележки към поръчката</h2><div class=\"notes\">{H(order.Notes)}</div>";

        return $$"""
            <!DOCTYPE html>
            <html lang="bg">
            <head>
              <meta charset="utf-8" />
              <title>Поръчка {{H(order.Id)}}</title>
              <style>
                * { box-sizing: border-box; }
                body { margin: 0; background: #f3f6f2; color: #1c231e; font-family: "Segoe UI", sans-serif; }
                .sheet { max-width: 820px; margin: 16px auto 32px; background: #fff; border-radius: 20px; overflow: hidden; }
                .band { height: 8px; background: #2f7d53; }
                header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; padding: 32px 40px 24px; }
                .logo { height: 52px; width: auto; }
                .doc { text-align: right; }
                .kicker { font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #2f7d53; }
                h1 { margin: 4px 0 0; font-family: Georgia, serif; font-size: 34px; font-weight: 650; letter-spacing: -0.03em; line-height: 1; }
                .date { margin-top: 8px; color: #5c675f; font-size: 14px; }
                .banner { margin: 0 40px; padding: 16px 18px; border-radius: 14px; display: flex; justify-content: space-between; gap: 16px; align-items: center; }
                .banner.cod { background: #fff6ee; color: #8a4b12; }
                .banner.paid { background: #eef6f1; color: #1f5a3b; }
                .banner strong { font-family: Georgia, serif; font-size: 28px; }
                .hint { font-size: 13px; opacity: 0.8; margin-top: 2px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding: 28px 40px 8px; }
                h2 { margin: 0 0 10px; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #7a847c; }
                .party p { margin: 0; font-size: 15px; line-height: 1.45; }
                .who { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
                .ship { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e6ece7; font-weight: 700; }
                table { width: calc(100% - 80px); margin: 8px 40px 0; border-collapse: collapse; }
                th { text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #7a847c; padding: 10px 0; border-bottom: 1px solid #e6ece7; }
                td { padding: 14px 0; border-bottom: 1px solid #f0f3f0; vertical-align: top; font-size: 15px; }
                .num { text-align: right; white-space: nowrap; }
                th.num { text-align: right; }
                .name, td.total { font-weight: 800; }
                .gift { color: #5c675f; font-size: 13px; margin-top: 3px; }
                .totals { width: 280px; margin: 8px 40px 0 auto; }
                .sum { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; font-size: 14px; color: #5c675f; }
                .sum strong { color: #1c231e; }
                .grand { margin-top: 8px; padding-top: 10px; border-top: 1px solid #e6ece7; }
                .grand strong { font-family: Georgia, serif; font-size: 22px; color: #1f5a3b; }
                .notes, .bills { margin: 0 40px; }
                h2.section { margin: 28px 40px 10px; }
                .bill { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 14px 0; border-top: 1px solid #e6ece7; }
                .awb { font-family: ui-monospace, monospace; font-weight: 800; font-size: 16px; margin-top: 2px; }
                .track { color: #1f5a3b; font-weight: 800; text-decoration: none; }
                footer { margin-top: 28px; padding: 22px 40px 28px; background: #f7faf7; display: flex; justify-content: space-between; gap: 16px; }
                footer p { margin: 0; color: #5c675f; font-size: 14px; }
                footer a { color: #1f5a3b; font-weight: 800; text-decoration: none; }
              </style>
            </head>
            <body>
              <main class="sheet">
                <div class="band"></div>
                <header>
                  <img class="logo" src="{{Logo}}" alt="PlantyHub" />
                  <div class="doc">
                    <div class="kicker">Поръчка</div>
                    <h1>{{H(order.Id)}}</h1>
                    <div class="date">{{date}}</div>
                  </div>
                </header>
                <div class="banner {{(cod ? "cod" : "paid")}}">
                  <div>
                    <div>{{(cod ? "Наложен платеж" : PaymentLabel(order.PaymentMethod))}}</div>
                    <div class="hint">{{(cod ? "Сума за събиране от получателя" : "Поръчката е платена")}}</div>
                  </div>
                  <strong>{{H(PriceHelper.FormatEuro(order.Total))}}</strong>
                </div>
                <div class="grid">
                  <section class="party">
                    <h2>Доставчик</h2>
                    <p class="who">ДИДЖИТАЛ КИТ ЕООД</p>
                    <p>ДДС номер BG207270915</p>
                    <p>ул. Никифор П. Константинов</p>
                    <p>4400 Пазарджик</p>
                    <p>България</p>
                    <p>support@plantyhub.com</p>
                  </section>
                  <section class="party">
                    <h2>Получател</h2>
                    <p class="who">{{H(First(order.ShippingName, order.CustomerName))}}</p>
                    <p>{{H(First(order.ShippingPhone, order.Phone))}}</p>
                    <p>{{H(order.ShippingStreet)}}</p>
                    <p>{{H($"{order.ShippingPostalCode} {order.ShippingCity}".Trim())}}</p>
                    <p>{{H(order.ShippingCountry)}}</p>
                    <p>{{H(order.Email)}}</p>
                    <p class="ship">{{ship}}</p>
                  </section>
                </div>
                <h2 class="section">Артикули ({{order.Items.Count}})</h2>
                <table>
                  <thead>
                    <tr><th>Продукт</th><th class="num">Бр.</th><th class="num">Цена</th><th class="num">Общо</th></tr>
                  </thead>
                  <tbody>{{items}}</tbody>
                </table>
                <div class="totals">
                  {{Sum("Междинна сума", PriceHelper.FormatEuro(order.Subtotal))}}
                  {{discount}}
                  {{Sum("Доставка", PriceHelper.FormatEuro(order.ShippingCost))}}
                  {{(order.CodFee > 0 ? Sum("Такса наложен платеж", PriceHelper.FormatEuro(order.CodFee)) : "")}}
                  <div class="sum grand"><span>Общо</span><strong>{{H(PriceHelper.FormatEuro(order.Total))}}</strong></div>
                  {{vatNote}}
                </div>
                {{notes}}
                {{waybills}}
                <footer>
                  <p>Благодарим ти, че пазаруваш от PlantyHub.</p>
                  <a href="mailto:support@plantyhub.com">support@plantyhub.com</a>
                </footer>
              </main>
            </body>
            </html>
            """;
    }

    static string Sum(string label, string value) =>
        $"<div class=\"sum\"><span>{H(label)}</span><strong>{H(value)}</strong></div>";

    static string PaymentLabel(PaymentMethod method) => method switch
    {
        PaymentMethod.Card => "Платено с карта",
        PaymentMethod.Paypal => "Платено с PayPal",
        _ => "Платено",
    };

    static string CourierName(string? courier) => courier?.ToLowerInvariant() switch
    {
        "econt" => "Еконт",
        "speedy" => "Спиди",
        "dhl" => "DHL",
        "boxnow" => "BOX NOW",
        _ => "",
    };

    static string First(params string?[] values) =>
        values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? "";

    static string H(string? value) => WebUtility.HtmlEncode(value ?? "");
}
