import type { TFunction } from 'i18next'
import { couriersApi, storeApi } from '../api'
import type { OrderAddress, OrderDetail, OrderLineItem, Waybill } from './orderDetails'
import { logoSrc } from '../data/images'
import { countryDisplayName } from '../utils/country'

const SUPPORT_EMAIL = 'support@plantyhub.com'

type Supplier = {
  company: string
  contactName: string
  phone: string
  email: string
  street: string
  city: string
  postalCode: string
  country: string
  eik: string
  vatNumber: string
}

const LEGAL_SUPPLIER: Supplier = {
  company: 'ДИДЖИТАЛ КИТ ЕООД',
  contactName: '',
  phone: '',
  email: SUPPORT_EMAIL,
  street: 'ул. Никифор П. Константинов',
  city: 'Пазарджик',
  postalCode: '4400',
  country: 'BG',
  eik: '207270915',
  vatNumber: 'BG207270915',
}

function esc(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(value?: string | null) {
  if (!value) return 0
  const normalized = value.replace(/\s/g, '').replace(/[^\d,.-]/g, '')
  const lastComma = normalized.lastIndexOf(',')
  const lastDot = normalized.lastIndexOf('.')
  const cleaned = lastComma > lastDot ? normalized.replace(/\./g, '').replace(',', '.') : normalized.replace(/,/g, '')
  const amount = Number.parseFloat(cleaned)
  return Number.isFinite(amount) ? amount : 0
}

function formatWhen(value: string, language: string) {
  const trimmed = value.trim()
  const dotted = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}:\d{2})(?::\d{2})?)?$/)
  const parsed = dotted
    ? new Date(`${dotted[3]}-${dotted[2]}-${dotted[1]}T${dotted[4] ?? '12:00'}:00`)
    : new Date(trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return trimmed
  const date = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
  const hasTime = Boolean(dotted?.[4] || trimmed.includes('T') || /\d{2}:\d{2}/.test(trimmed))
  if (!hasTime) return date
  const time = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(parsed)
  return `${date}, ${time}`
}

function row(label: string, value: string) {
  if (!value.trim()) return ''
  return `<div class="sum"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`
}

function block(lines: Array<string | null | undefined>) {
  return lines
    .map((line) => line?.trim() ?? '')
    .filter(Boolean)
    .map((line) => `<p>${esc(line)}</p>`)
    .join('')
}

function itemRows(items: OrderLineItem[], t: TFunction) {
  return items
    .map((item) => {
      const name = item.name ?? t(`products.${item.categoryKey}.${item.nameKey}.name`)
      const gift = item.gift ? `<div class="gift">${esc(t('admin.orderDetail.sheet.gift'))}: ${esc(item.gift.name)}</div>` : ''
      return `<tr>
        <td>
          <div class="name">${esc(name)}</div>
          ${gift}
        </td>
        <td class="num">${item.quantity}</td>
        <td class="num">${esc(item.unitPrice)}</td>
        <td class="num total">${esc(item.total)}</td>
      </tr>`
    })
    .join('')
}

function waybillBlock(bill: Waybill, t: TFunction) {
  const purpose = bill.purpose ?? 'shipment'
  const courier = t(`admin.orderDetail.couriers.${bill.courier}`, { defaultValue: bill.courier })
  const track = bill.trackingUrl
    ? `<a class="track" href="${esc(bill.trackingUrl)}">${esc(t('admin.orderDetail.trackShort'))}</a>`
    : ''
  return `<article class="bill">
    <div>
      <div class="kicker">${esc(t(`admin.orderDetail.waybillPurpose.${purpose}`, { defaultValue: purpose }))} · ${esc(courier)}</div>
      <div class="awb">${esc(bill.number)}</div>
    </div>
    ${track}
  </article>`
}

function samePlace(a: OrderAddress, b: OrderAddress) {
  const norm = (value: string) => value.trim().toLowerCase()
  return norm(a.name) === norm(b.name)
    && norm(a.street) === norm(b.street)
    && norm(a.city) === norm(b.city)
    && norm(a.postalCode) === norm(b.postalCode)
    && norm(a.country) === norm(b.country)
}

async function loadSupplier(): Promise<Supplier> {
  const supplier = { ...LEGAL_SUPPLIER }
  try {
    const [couriers, store] = await Promise.all([couriersApi.get(), storeApi.get()])
    const sender = couriers.sender
    if (sender.contactName?.trim()) supplier.contactName = sender.contactName.trim()
    if (sender.phone?.trim()) supplier.phone = sender.phone.trim()
    if (sender.email?.trim()) supplier.email = sender.email.trim()
    if (store.vatNumber?.trim()) supplier.vatNumber = store.vatNumber.trim()
  } catch {
    // The legal company details still go on the file.
  }
  return supplier
}

export function renderOrderSheet(order: OrderDetail, t: TFunction, language: string, supplier: Supplier) {
  const country = (code: string) => t(`admin.countries.${code}`, { defaultValue: countryDisplayName(code, language) })
  const courierId = order.waybill?.courier || order.shippingCourier || ''
  const delivery =
    order.shippingDelivery === 'office'
      ? t('admin.orderDetail.deliveryToOffice', { code: order.shippingOfficeCode || '—' })
      : t('admin.orderDetail.deliveryToAddress')
  const cod = order.paymentMethod === 'cod'
  const discount = money(order.discount)
  const waybills = order.waybills && order.waybills.length > 0 ? order.waybills : order.waybill ? [order.waybill] : []
  const placed = formatWhen(order.date, language)
  const courierName = courierId
    ? t(`admin.orderDetail.couriers.${courierId}`, { defaultValue: courierId })
    : ''
  const supplierLines = block([
    supplier.contactName,
    supplier.phone,
    `${t('admin.vat.vatNumber')} ${supplier.vatNumber}`,
    supplier.street,
    `${supplier.postalCode} ${supplier.city}`.trim(),
    country(supplier.country),
    supplier.email,
  ])
  const person = (who: OrderDetail['shipping'], email?: string) =>
    block([
      who.name,
      who.phone,
      who.street,
      `${who.postalCode} ${who.city}`.trim(),
      country(who.country),
      email,
    ])

  return `<!DOCTYPE html>
<html lang="${esc(language)}">
<head>
  <meta charset="utf-8" />
  <title>${esc(t('admin.orderDetail.sheet.fileTitle', { id: order.id }))}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f6f2; color: #1c231e; font-family: "Nunito Sans", "Segoe UI", sans-serif; }
    .actions { max-width: 820px; margin: 0 auto; padding: 20px 20px 0; display: flex; justify-content: flex-end; }
    button { border: 0; background: #1f5a3b; color: #fff; font: inherit; font-weight: 700; border-radius: 999px; padding: 10px 18px; cursor: pointer; }
    .sheet { max-width: 820px; margin: 16px auto 32px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(28, 35, 30, 0.06); }
    .band { height: 8px; background: #2f7d53; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; padding: 32px 40px 24px; }
    .logo { height: 52px; width: auto; display: block; }
    .doc { text-align: right; }
    .kicker { font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #2f7d53; }
    h1 { margin: 4px 0 0; font-family: Fraunces, Georgia, serif; font-size: 34px; font-weight: 650; letter-spacing: -0.03em; line-height: 1; }
    .date { margin-top: 8px; color: #5c675f; font-size: 14px; }
    .banner { margin: 0 40px; padding: 16px 18px; border-radius: 14px; display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .banner.cod { background: #fff6ee; color: #8a4b12; }
    .banner.paid { background: #eef6f1; color: #1f5a3b; }
    .banner strong { font-family: Fraunces, Georgia, serif; font-size: 28px; font-weight: 650; }
    .banner .hint { font-size: 13px; opacity: 0.8; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding: 28px 40px 8px; }
    h2 { margin: 0 0 10px; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #7a847c; }
    .party p { margin: 0; font-size: 15px; line-height: 1.45; }
    .party h2 + p, .party .who { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
    .ship { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e6ece7; font-weight: 700; }
    table { width: calc(100% - 80px); margin: 8px 40px 0; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #7a847c; font-weight: 800; padding: 10px 0; border-bottom: 1px solid #e6ece7; }
    td { padding: 14px 0; border-bottom: 1px solid #f0f3f0; vertical-align: top; font-size: 15px; }
    .num { text-align: right; white-space: nowrap; color: #3d4740; }
    th.num { text-align: right; }
    .name { font-weight: 800; }
    .gift { color: #5c675f; font-size: 13px; margin-top: 3px; }
    td.total { font-weight: 800; color: #1c231e; }
    .totals { width: 280px; margin: 8px 40px 0 auto; }
    .sum { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; font-size: 14px; color: #5c675f; }
    .sum strong { color: #1c231e; font-weight: 700; }
    .sum.grand { margin-top: 8px; padding-top: 10px; border-top: 1px solid #e6ece7; font-size: 16px; }
    .sum.grand strong { font-family: Fraunces, Georgia, serif; font-size: 22px; font-weight: 650; color: #1f5a3b; }
    .notes, .bills { margin: 0 40px; }
    .notes { white-space: pre-wrap; font-size: 15px; line-height: 1.5; }
    h2.section { margin: 28px 40px 10px; }
    .bill { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 14px 0; border-top: 1px solid #e6ece7; }
    .awb { font-family: ui-monospace, monospace; font-weight: 800; font-size: 16px; letter-spacing: 0.02em; margin-top: 2px; }
    .track { color: #1f5a3b; font-weight: 800; text-decoration: none; }
    footer { margin-top: 28px; padding: 22px 40px 28px; background: #f7faf7; display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    footer p { margin: 0; color: #5c675f; font-size: 14px; }
    footer a { color: #1f5a3b; font-weight: 800; text-decoration: none; }
    @media (max-width: 700px) {
      header, .grid, footer { display: block; padding-left: 20px; padding-right: 20px; }
      .doc { text-align: left; margin-top: 16px; }
      .banner, table, .notes, .bills { margin-left: 20px; margin-right: 20px; }
      table { width: calc(100% - 40px); }
      .totals { width: auto; margin-right: 20px; }
      h2.section { margin-left: 20px; margin-right: 20px; }
      .grid { grid-template-columns: 1fr; }
    }
    @page { margin: 14mm; }
    @media print {
      body { background: #fff; }
      .actions { display: none; }
      .sheet { margin: 0; max-width: none; border-radius: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="actions"><button onclick="print()">${esc(t('admin.orderDetail.sheet.print'))}</button></div>
  <main class="sheet">
    <div class="band"></div>
    <header>
      <img class="logo" src="${esc(logoSrc)}" alt="PlantyHub" />
      <div class="doc">
        <div class="kicker">${esc(t('admin.orders.table.id'))}</div>
        <h1>${esc(order.id)}</h1>
        <div class="date">${esc(placed)}</div>
      </div>
    </header>
    <div class="banner ${cod ? 'cod' : 'paid'}">
      <div>
        <div>${esc(t(`admin.orderDetail.payment.${order.paymentMethod}`, { defaultValue: order.paymentMethod }))}</div>
        <div class="hint">${esc(cod ? t('admin.orderDetail.sheet.collect') : t('admin.orderDetail.sheet.paid'))}</div>
      </div>
      <strong>${esc(order.total)}</strong>
    </div>
    <div class="grid">
      <section class="party">
        <h2>${esc(t('admin.orderDetail.sheet.supplier'))}</h2>
        <p class="who">${esc(supplier.company)}</p>
        ${supplierLines}
      </section>
      <section class="party">
        <h2>${esc(t('admin.orderDetail.recipient'))}</h2>
        ${person(order.shipping, order.email)}
        <p class="ship">${esc([courierName, delivery].filter(Boolean).join(' · '))}</p>
        ${samePlace(order.shipping, order.billing) ? '' : `<h2 style="margin-top:18px">${esc(t('admin.orderDetail.sheet.billingAddress'))}</h2>${person(order.billing)}`}
      </section>
    </div>
    <h2 class="section">${esc(t('admin.orderDetail.items', { count: order.lineItems.length }))}</h2>
    <table>
      <thead>
        <tr>
          <th>${esc(t('admin.table.product'))}</th>
          <th class="num">${esc(t('admin.orderDetail.qty'))}</th>
          <th class="num">${esc(t('admin.orderDetail.price'))}</th>
          <th class="num">${esc(t('admin.orders.table.total'))}</th>
        </tr>
      </thead>
      <tbody>${itemRows(order.lineItems, t)}</tbody>
    </table>
    <div class="totals">
      ${row(t('admin.orderDetail.subtotal'), order.subtotal)}
      ${discount > 0 ? row(order.promoCode ? `${t('admin.orderDetail.sheet.discount')} (${order.promoCode})` : t('admin.orderDetail.sheet.discount'), `−${order.discount}`) : ''}
      ${row(t('admin.orderDetail.shippingCost'), order.shippingCost)}
      ${row(order.taxRate ? t('admin.orderDetail.taxRate', { rate: order.taxRate }) : t('admin.orderDetail.tax'), order.tax)}
      <div class="sum grand"><span>${esc(t('admin.orders.table.total'))}</span><strong>${esc(order.total)}</strong></div>
    </div>
    ${order.notes ? `<h2 class="section">${esc(t('admin.orderDetail.notes'))}</h2><div class="notes">${esc(order.notes)}</div>` : ''}
    ${waybills.length > 0 ? `<h2 class="section">${esc(t('admin.orderDetail.waybill'))}</h2><div class="bills">${waybills.map((bill) => waybillBlock(bill, t)).join('')}</div>` : ''}
    <footer>
      <p>${esc(t('admin.orderDetail.sheet.thanks'))}</p>
      <a href="mailto:${esc(supplier.email)}">${esc(supplier.email)}</a>
    </footer>
  </main>
</body>
</html>`
}

export async function downloadOrderSheet(order: OrderDetail, t: TFunction, language: string) {
  const supplier = await loadSupplier()
  const html = renderOrderSheet(order, t, language, supplier)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `PlantyHub-${order.id.replace(/[^\w.-]+/g, '_')}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
