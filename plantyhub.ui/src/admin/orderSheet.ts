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

function icon(path: string, color: string) {
  return `<span class="mark" style="background:${color}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#1c231e" d="${path}"/></svg></span>`
}

const starPath = 'm12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08z'
const groupsPath = 'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V17c0 .55.45 1 1 1h3.5v-1.61c0-.83.23-1.61.63-2.29M20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H23c.55 0 1-.45 1-1zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3'
const bookPath = 'M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.45 0-2.99.22-4.28.79C1.49 5.62 1 6.33 1 7.14v11.28c0 1.3 1.22 2.26 2.48 1.94.98-.25 2.02-.36 3.02-.36 1.56 0 3.22.26 4.56.92.6.3 1.28.3 1.87 0 1.34-.67 3-.92 4.56-.92 1 0 2.04.11 3.02.36 1.26.33 2.48-.63 2.48-1.94V7.14c0-.81-.49-1.52-1.22-1.85-1.28-.57-2.82-.79-4.27-.79M21 17.23c0 .63-.58 1.09-1.2.98-.75-.14-1.53-.2-2.3-.2-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5.92 0 1.83.09 2.7.28.46.1.8.51.8.98z'
const replayPath = 'M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29-.47 2.27-2.31 4.1-4.57 4.57-3.57.75-6.75-1.7-7.23-5.01-.07-.48-.49-.85-.98-.85-.6 0-1.08.53-1 1.13.62 4.39 4.8 7.64 9.53 6.72 3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5'

function packCard(mark: string, title: string, hint: string, tone: string) {
  return `<article class="pack-card ${tone}">${mark}<div><strong>${esc(title)}</strong><span>${esc(hint)}</span></div></article>`
}

function packBlock(firstOrder: boolean, t: TFunction) {
  const first = firstOrder
    ? packCard(icon(starPath, '#ffe08a'), t('admin.orderDetail.pack.first'), t('admin.orderDetail.pack.firstHint'), 'hot')
    : packCard(icon(replayPath, '#e4e7e1'), t('admin.orderDetail.pack.repeat'), t('admin.orderDetail.pack.repeatHint'), 'quiet')
  const community = packCard(icon(groupsPath, '#c8e6d4'), t('admin.orderDetail.pack.community'), t('admin.orderDetail.pack.communityHint'), 'green')
  const instructions = packCard(icon(bookPath, '#c5dce8'), t('admin.orderDetail.pack.instructions'), t('admin.orderDetail.pack.instructionsHint'), 'ink')
  return `<section class="pack"><div class="pack-title">${esc(t('admin.orderDetail.pack.title'))}</div><div class="pack-grid">${first}${community}${instructions}</div></section>`
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

export function renderOrderSheet(order: OrderDetail, t: TFunction, language: string, supplier: Supplier, pack?: { firstOrder: boolean }) {
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
    .pack { margin: 18px 40px 0; padding: 14px; border-radius: 16px; background: #f7f4ec; border: 1px solid #e6e1d2; }
    .pack-title { font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #1f5a3b; margin-bottom: 10px; }
    .pack-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .pack-card { display: flex; align-items: center; gap: 10px; min-height: 72px; padding: 12px; border-radius: 14px; background: #fff; border: 1.5px solid #e6e1d2; }
    .pack-card.hot { background: linear-gradient(160deg, #fff9ee, #ffe7b8); border-color: #e2b34a; }
    .pack-card.green { background: #f3faf6; border-color: #8fcbaa; }
    .pack-card.ink { background: #f4f8fb; border-color: #9bb8c9; }
    .pack-card strong { display: block; font-size: 14px; line-height: 1.25; }
    .pack-card span { display: block; margin-top: 3px; font-size: 12px; color: #5c675f; line-height: 1.3; }
    .mark { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
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
      .banner, table, .notes, .bills, .pack { margin-left: 20px; margin-right: 20px; }
      .pack-grid { grid-template-columns: 1fr; }
      table { width: calc(100% - 40px); }
      .totals { width: auto; margin-right: 20px; }
      h2.section { margin-left: 20px; margin-right: 20px; }
      .grid { grid-template-columns: 1fr; }
    }
    @page { margin: 14mm; }
    @media print {
      body { background: #fff; }
      .pack, .pack-card, .mark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
    ${pack ? packBlock(pack.firstOrder, t) : ''}
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
      ${order.codFee && order.codFee !== '€0.00' ? row(t('checkout.codFee'), order.codFee) : ''}
      <div class="sum grand"><span>${esc(t('admin.orders.table.total'))}</span><strong>${esc(order.total)}</strong></div>
      ${order.tax && order.tax !== '€0.00' ? `<p style="margin:6px 0 0;font-size:12px;color:#5c675f;">${esc(t('cart.vatIncluded'))}</p>` : ''}
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

export async function downloadOrderSheet(order: OrderDetail, t: TFunction, language: string, pack?: { firstOrder: boolean }) {
  const supplier = await loadSupplier()
  const html = renderOrderSheet(order, t, language, supplier, pack)
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
