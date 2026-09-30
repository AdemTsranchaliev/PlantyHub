import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EmailRounded from '@mui/icons-material/EmailRounded'
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded'
import PhoneRounded from '@mui/icons-material/PhoneRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import PrintRounded from '@mui/icons-material/PrintRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import RateReviewRounded from '@mui/icons-material/RateReviewRounded'
import { useTranslation } from 'react-i18next'
import { countryDisplayName, countryFlag } from '../../utils/country'
import { ordersApi } from '../../api'
import { ApiError, apiBlob } from '../../api/client'
import type { EcontCheckResult, EcontStatusResult } from '../../api/types'
import { fetchOrderDetail } from '../../store/orders'
import { AdminBreadcrumb } from '../../components/admin/AdminPageHeader'
import CreateWaybillDialog from '../../components/admin/CreateWaybillDialog'
import RequestReviewDialog from '../../components/admin/RequestReviewDialog'
import type { OrderStatus } from '../../admin/mockData'
import type { OrderTimelineEntry, Waybill } from '../../admin/orderDetails'
import { downloadOrderSheet } from '../../admin/orderSheet'
import { nextOrderStatuses, orderStatusColors as statusColors } from '../../admin/orderStatus'
import OrderGiftLine from '../../components/OrderGiftLine'
import { useOrderDetail, useOrders, useOrdersStore } from '../../hooks/useOrders'
import MediaImg from '../../components/MediaImg'
import { brand } from '../../theme'
import { formatEuro } from '../../utils/price'

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: brand.white,
        borderRadius: '20px',
        border: `1px solid ${brand.border}`,
        p: { xs: 2, sm: 2.5 },
        height: '100%',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '1.05rem' }}>{title}</Typography>
        {action}
      </Stack>
      {children}
    </Box>
  )
}

function euroAmount(value?: string | null) {
  if (!value) return 0
  const amount = Number(value.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(amount) ? amount : 0
}

function whenParts(value: string, locale: string) {
  const trimmed = value.trim()
  const dotted = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}:\d{2})(?::\d{2})?)?$/)
  const parsed = dotted
    ? new Date(`${dotted[3]}-${dotted[2]}-${dotted[1]}T${dotted[4] ?? '00:00'}:00`)
    : new Date(trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return { date: '', time: trimmed }
  const date = parsed.toLocaleDateString(locale, { day: '2-digit', month: 'short' })
  const time = dotted && !dotted[4] ? '' : parsed.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function formatStamp(value: string, locale: string) {
  const when = whenParts(value, locale)
  if (when.time && when.date) return `${when.date}, ${when.time}`
  return when.time || when.date || value
}

function eventParts(event: { event: string; place?: string | null }) {
  const place = event.place?.trim() ?? ''
  let title = event.event.trim().replace(/^[—–-]\s*/, '')
  if (place && title.endsWith(place)) {
    title = title.slice(0, -place.length).replace(/\s*[—–-]\s*$/, '').trim()
  }
  if (!title || title === place) return { title: place, place: '' }
  if (place && title.includes(place)) return { title, place: '' }
  return { title, place }
}

function trackingSteps(track: EcontStatusResult['courier']) {
  return [...track.events].reverse().filter((event) => {
    if (!event.time?.trim()) return false
    const parts = eventParts(event)
    const text = `${parts.title} ${parts.place}`.trim()
    return Boolean(text) && text !== track.status.trim()
  })
}

function statusSteps(timeline: OrderTimelineEntry[], courierNotes: Set<string>) {
  const steps: { at: string; status: OrderStatus; notes: string[] }[] = []
  const chronological = [...timeline].sort((a, b) => a.at.localeCompare(b.at))
  for (const entry of chronological) {
    const note = entry.note?.trim() ?? ''
    const keep = note && !courierNotes.has(note)
    const last = steps[steps.length - 1]
    if (last && last.status === entry.status) {
      if (keep && !last.notes.includes(note)) last.notes.push(note)
      continue
    }
    steps.push({ at: entry.at, status: entry.status, notes: keep ? [note] : [] })
  }
  return steps.reverse()
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.textSecondary, mb: 1.25 }}>
      {children}
    </Typography>
  )
}

function TimeRail({
  items,
}: {
  items: { key: string; when: string; accent: string; title: React.ReactNode; detail?: React.ReactNode }[]
}) {
  const { i18n } = useTranslation()
  return (
    <Stack>
      {items.map((item, index) => {
        const when = whenParts(item.when, i18n.language)
        const previous = index > 0 ? whenParts(items[index - 1].when, i18n.language) : null
        const showDate = Boolean(when.time && when.date && when.date !== previous?.date)
        const last = index === items.length - 1
        const active = index === 0
        return (
          <Stack key={item.key} direction="row" spacing={1.25}>
            <Box sx={{ width: 68, flexShrink: 0, textAlign: 'right', pt: 0.15 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: brand.graphite, lineHeight: 1.2 }}>
                {when.time || when.date}
              </Typography>
              {showDate ? (
                <Typography sx={{ fontSize: '0.72rem', color: brand.textSecondary, lineHeight: 1.3 }}>{when.date}</Typography>
              ) : null}
            </Box>
            <Box sx={{ width: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <Box
                sx={{
                  width: active ? 12 : 9,
                  height: active ? 12 : 9,
                  borderRadius: '50%',
                  mt: '3px',
                  bgcolor: active ? item.accent : brand.white,
                  border: `2px solid ${item.accent}`,
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
              />
              {last ? null : <Box sx={{ width: 2, flex: 1, bgcolor: brand.border, minHeight: 18 }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, pb: last ? 0 : 1.75 }}>
              {item.title}
              {item.detail}
            </Box>
          </Stack>
        )
      })}
    </Stack>
  )
}

function billDirection(bill: Waybill) {
  return bill.direction ?? ((bill.purpose ?? 'shipment') === 'return' ? 'customer_to_merchant' : 'merchant_to_customer')
}

function OrderMovement({
  status,
  timeline,
  waybills,
  tracks,
  loadingNumbers,
  onRefresh,
}: {
  status: OrderStatus
  timeline: OrderTimelineEntry[]
  waybills: Waybill[]
  tracks: Record<string, EcontStatusResult['courier']>
  loadingNumbers: Record<string, boolean>
  onRefresh: (number: string) => void
}) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState<Record<string, boolean>>({})
  const colors = statusColors[status]
  const newestFirst = [...waybills].reverse()
  const featured = newestFirst[0]
  const older = newestFirst.slice(1)
  const featuredTrack = featured ? tracks[featured.number] : undefined
  const featuredSteps = featuredTrack ? trackingSteps(featuredTrack) : []
  const courierNotes = new Set(
    Object.values(tracks)
      .map((track) => track.status.trim())
      .filter(Boolean),
  )
  const history = statusSteps(timeline, courierNotes)
  const quietAction = {
    minWidth: 0,
    px: 0.75,
    py: 0.25,
    color: brand.textSecondary,
    fontWeight: 700,
    fontSize: '0.8rem',
  }

  return (
    <Panel title={t('admin.orderDetail.timeline')}>
      <Box sx={{ mb: older.length || history.length ? 2.5 : 0, pl: 1.75, borderLeft: `4px solid ${colors.color}` }}>
        <SectionLabel>{t('admin.orderDetail.movementNow')}</SectionLabel>
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.15, color: colors.color }}>
          {t(`admin.orders.status.${status}`)}
        </Typography>
        {featured ? (
          <Typography sx={{ mt: 0.75, fontWeight: 700 }}>
            {t(`admin.orderDetail.directionShort.${billDirection(featured)}`, { defaultValue: billDirection(featured) })}
            {' · '}
            <Box component="span" sx={{ fontFamily: 'monospace' }}>{featured.number}</Box>
          </Typography>
        ) : (
          <Typography sx={{ mt: 0.75, color: brand.textSecondary }}>{t('admin.orderDetail.noShipment')}</Typography>
        )}
        {featured && featured.courier !== 'econt' ? (
          <Typography sx={{ mt: 0.35, color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.orderDetail.noAutoTracking')}</Typography>
        ) : featuredTrack ? (
          <Typography sx={{ mt: 0.35, color: brand.graphite, fontSize: '0.95rem' }}>{featuredTrack.status}</Typography>
        ) : featured && loadingNumbers[featured.number] ? (
          <Typography sx={{ mt: 0.35, color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.orderDetail.trackingLoading')}</Typography>
        ) : null}
        {featured?.trackingUrl ? (
          <Link href={featured.trackingUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-block', mt: 0.75, fontSize: '0.85rem', fontWeight: 700 }}>
            {t('admin.orderDetail.trackShort')}
          </Link>
        ) : null}
      </Box>

      {featuredSteps.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <TimeRail
            items={featuredSteps.map((event, eventIndex) => {
              const parts = eventParts(event)
              const incoming = featured ? billDirection(featured) === 'customer_to_merchant' : false
              return {
                key: `${featured?.number}-${event.time}-${eventIndex}`,
                when: event.time,
                accent: incoming ? '#B71C1C' : brand.plantGreen,
                title: (
                  <Typography sx={{ fontWeight: eventIndex === 0 ? 800 : 600, fontSize: '0.92rem', lineHeight: 1.35 }}>
                    {parts.title}
                  </Typography>
                ),
                detail: parts.place ? (
                  <Typography sx={{ fontSize: '0.8rem', color: brand.textSecondary, mt: 0.15 }}>{parts.place}</Typography>
                ) : null,
              }
            })}
          />
        </Box>
      ) : null}

      {older.length > 0 ? (
        <Box sx={{ mt: 2.5 }}>
          <SectionLabel>{t('admin.orderDetail.otherParcels')}</SectionLabel>
          <Stack spacing={0} sx={{ borderTop: `1px solid ${brand.border}` }}>
            {older.map((bill) => {
              const direction = billDirection(bill)
              const incoming = direction === 'customer_to_merchant'
              const track = tracks[bill.number]
              const loading = Boolean(loadingNumbers[bill.number])
              const events = track ? trackingSteps(track) : []
              const open = Boolean(opened[bill.number])
              return (
                <Box key={bill.number} sx={{ py: 1.25, borderBottom: `1px solid ${brand.border}` }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: incoming ? '#B71C1C' : brand.plantGreenDark }}>
                        {t(`admin.orderDetail.directionShort.${direction}`, { defaultValue: direction })}
                      </Typography>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{bill.number}</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: track ? brand.graphite : brand.textSecondary }}>
                        {bill.courier !== 'econt'
                          ? t('admin.orderDetail.noAutoTracking')
                          : track?.status ?? (loading ? t('admin.orderDetail.trackingLoading') : '—')}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      {events.length > 0 ? (
                        <Button size="small" sx={quietAction} onClick={() => setOpened((prev) => ({ ...prev, [bill.number]: !open }))}>
                          {open ? t('admin.orderDetail.hideSteps') : t('admin.orderDetail.stepsCount', { count: events.length })}
                        </Button>
                      ) : null}
                      {bill.courier === 'econt' ? (
                        <Button size="small" sx={quietAction} onClick={() => onRefresh(bill.number)} disabled={loading}>
                          {loading ? t('admin.orderDetail.refreshingStatus') : t('admin.orderDetail.updateTracking')}
                        </Button>
                      ) : null}
                      {bill.trackingUrl ? (
                        <Link href={bill.trackingUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontSize: '0.8rem', fontWeight: 700, px: 0.75 }}>
                          {t('admin.orderDetail.trackShort')}
                        </Link>
                      ) : null}
                    </Stack>
                  </Stack>
                  {open && events.length > 0 ? (
                    <Box sx={{ mt: 1.25 }}>
                      <TimeRail
                        items={events.map((event, eventIndex) => {
                          const parts = eventParts(event)
                          return {
                            key: `${bill.number}-${event.time}-${eventIndex}`,
                            when: event.time,
                            accent: incoming ? '#B71C1C' : brand.plantGreen,
                            title: <Typography sx={{ fontWeight: eventIndex === 0 ? 800 : 600, fontSize: '0.92rem' }}>{parts.title}</Typography>,
                            detail: parts.place ? (
                              <Typography sx={{ fontSize: '0.8rem', color: brand.textSecondary }}>{parts.place}</Typography>
                            ) : null,
                          }
                        })}
                      />
                    </Box>
                  ) : null}
                </Box>
              )
            })}
          </Stack>
        </Box>
      ) : null}

      <Box sx={{ mt: 2.5 }}>
        <SectionLabel>{t('admin.orderDetail.statusHistory')}</SectionLabel>
        {history.length === 0 ? (
          <Typography sx={{ color: brand.textSecondary }}>{t('admin.orderDetail.statusNextNone')}</Typography>
        ) : (
          <TimeRail
            items={history.map((entry, index) => {
              const entryColors = statusColors[entry.status]
              return {
                key: `${entry.at}-${entry.status}-${index}`,
                when: entry.at,
                accent: entryColors.color,
                title: (
                  <Typography sx={{ fontWeight: index === 0 ? 800 : 700, color: entryColors.color, fontSize: '0.95rem', lineHeight: 1.3 }}>
                    {t(`admin.orders.status.${entry.status}`)}
                  </Typography>
                ),
                detail: entry.notes.length > 0 ? (
                  <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                    {entry.notes.map((note) => (
                      <Typography key={note} sx={{ fontSize: '0.85rem', color: brand.textSecondary }}>{note}</Typography>
                    ))}
                  </Stack>
                ) : null,
              }
            })}
          />
        )}
      </Box>
    </Panel>
  )
}

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const ordersSearch = typeof (location.state as { ordersSearch?: unknown } | null)?.ordersSearch === 'string'
    ? (location.state as { ordersSearch: string }).ordersSearch
    : ''
  const ordersPath = `/admin/orders${ordersSearch}`
  const { t, i18n } = useTranslation()
  const { order, loading } = useOrderDetail(orderId, true)
  const allOrders = useOrders()
  const { updateOrderStatus } = useOrdersStore()
  const [waybillOpen, setWaybillOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [statusDraft, setStatusDraft] = useState<OrderStatus | null>(null)
  const [statusNote, setStatusNote] = useState('')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusBusy, setStatusBusy] = useState(false)
  const [check, setCheck] = useState<EcontCheckResult | null>(null)
  const [tracks, setTracks] = useState<Record<string, EcontStatusResult['courier']>>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'check' | 'print' | null>(null)
  const [loadingNumbers, setLoadingNumbers] = useState<Record<string, boolean>>({})
  const waybills = (
    order?.waybills && order.waybills.length > 0 ? order.waybills : order?.waybill ? [order.waybill] : []
  )
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const econtKey = waybills.filter((bill) => bill.courier === 'econt').map((bill) => bill.number).join('|')

  useEffect(() => {
    if (!orderId || !econtKey) {
      setTracks({})
      setLoadingNumbers({})
      return
    }
    const numbers = econtKey.split('|')
    let cancelled = false
    setTracks({})
    setLoadingNumbers(Object.fromEntries(numbers.map((number) => [number, true])))
    setActionError(null)
    void Promise.all(
      numbers.map(async (number) => {
        try {
          const result = await ordersApi.refreshEcontStatus(orderId, number)
          if (!cancelled) setTracks((prev) => ({ ...prev, [number]: result.courier }))
        } catch (err: unknown) {
          if (!cancelled) setActionError(err instanceof ApiError ? err.message : t('admin.orderDetail.statusFailed'))
        } finally {
          if (!cancelled) setLoadingNumbers((prev) => ({ ...prev, [number]: false }))
        }
      }),
    ).finally(() => {
      if (!cancelled) void fetchOrderDetail(orderId, true)
    })
    return () => {
      cancelled = true
    }
  }, [orderId, econtKey])

  const customerOrders = useMemo(
    () =>
      order
        ? allOrders
            .filter((o) => o.email === order.email)
            .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        : [],
    [allOrders, order],
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Typography sx={{ color: brand.textSecondary }}>{t('common.loading', { defaultValue: 'Loading…' })}</Typography>
      </Box>
    )
  }

  if (!order) {
    return (
      <Box>
        <AdminBreadcrumb
          items={[
            { label: t('admin.orders.title'), to: ordersPath },
            { label: orderId ?? '—' },
          ]}
        />
        <Typography sx={{ color: brand.textSecondary }}>{t('admin.orderDetail.notFound')}</Typography>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(ordersPath)} sx={{ mt: 2 }}>
          {t('admin.orderDetail.backToOrders')}
        </Button>
      </Box>
    )
  }

  const firstOrder = customerOrders[customerOrders.length - 1]?.id === order.id
  const orderNumber = customerOrders.findIndex((o) => o.id === order.id) + 1
  const colors = statusColors[order.status]
  const courierId = order.waybill?.courier || order.shippingCourier || ''
  const isEcont = courierId === 'econt'
  const countryName = (code: string) => t(`admin.countries.${code}`, { defaultValue: countryDisplayName(code, i18n.language) })

  const openSticker = async (number: string) => {
    setBusy('print')
    setActionError(null)
    const win = window.open('', '_blank')
    try {
      const blob = await apiBlob(`/api/admin/orders/${order.id}/waybill/label?number=${encodeURIComponent(number)}`)
      const url = URL.createObjectURL(blob)
      if (!win) throw new Error('popup')
      win.location.href = url
      win.addEventListener('load', () => {
        win.focus()
        win.print()
      })
    } catch (err) {
      win?.close()
      setActionError(err instanceof ApiError ? err.message : t('admin.orderDetail.printFailed'))
    } finally {
      setBusy(null)
    }
  }

  const runCheck = async () => {
    setBusy('check')
    setActionError(null)
    try {
      setCheck(await ordersApi.checkEcont(order.id, { courier: courierId || 'econt' }))
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t('admin.orderDetail.statusFailed'))
    } finally {
      setBusy(null)
    }
  }

  const refreshStatus = async (number: string) => {
    if (!orderId) return
    setLoadingNumbers((prev) => ({ ...prev, [number]: true }))
    setActionError(null)
    try {
      const result = await ordersApi.refreshEcontStatus(orderId, number)
      setTracks((prev) => ({ ...prev, [number]: result.courier }))
      await fetchOrderDetail(orderId, true)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t('admin.orderDetail.statusFailed'))
    } finally {
      setLoadingNumbers((prev) => ({ ...prev, [number]: false }))
    }
  }
  const isCod = order.paymentMethod === 'cod'
  const hasShipment = waybills.some((bill) => (bill.purpose ?? 'shipment') === 'shipment')
  const returning = order.status === 'claim' || order.status === 'returned'
  const canCreateWaybill =
    (order.status === 'processing' && !hasShipment) || returning || order.status === 'replacement'
  const createLabel = returning
    ? t('admin.orderDetail.sendReturnWaybill')
    : order.status === 'replacement'
      ? t('admin.orderDetail.createReplacementWaybill')
      : t('admin.orderDetail.createWaybill')
  const nextSteps = nextOrderStatuses[order.status]
  const payerTotal = (who: 'customer' | 'merchant') => {
    const known = waybills.filter((bill) => {
      const pays = bill.payer === 'merchant' ? 'merchant' : 'customer'
      return pays === who && bill.deliveryCost
    })
    if (known.length === 0) return t('admin.orderDetail.noCourierPrice')
    return formatEuro(known.reduce((sum, bill) => sum + euroAmount(bill.deliveryCost), 0))
  }
  const merchantBills = waybills.filter((bill) => bill.payer === 'merchant')
  const merchantLoss = merchantBills.reduce((sum, bill) => sum + euroAmount(bill.deliveryCost), 0)
  const merchantPriceMissing = merchantBills.some((bill) => !bill.deliveryCost)

  const handlePrintWaybill = (bill: (typeof waybills)[number]) => {
    const w = window.open('', '_blank', 'width=600,height=800')
    if (!w) return
    w.document.write(`
      <html><head><title>${bill.number}</title>
      <style>body{font-family:sans-serif;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td{padding:6px 0}</style>
      </head><body>
      <h1>${t('admin.orderDetail.waybillTitle')} — ${bill.number}</h1>
      <table>
        <tr><td><b>${t('admin.orderDetail.courier')}</b></td><td>${t(`admin.orderDetail.couriers.${bill.courier}`)}</td></tr>
        <tr><td><b>${t('admin.orders.table.id')}</b></td><td>${order.id}</td></tr>
        <tr><td><b>${t('admin.orderDetail.recipient')}</b></td><td>${order.shipping.name}</td></tr>
        <tr><td><b>${t('admin.orderDetail.address')}</b></td><td>${order.shipping.street}, ${order.shipping.city} ${order.shipping.postalCode}, ${t(`admin.countries.${order.shipping.country}`, { defaultValue: countryDisplayName(order.shipping.country, i18n.language) })}</td></tr>
        <tr><td><b>${t('admin.orderDetail.phone')}</b></td><td>${order.shipping.phone}</td></tr>
        <tr><td><b>${t('admin.orderDetail.weight')}</b></td><td>${bill.weightKg} kg</td></tr>
        <tr><td><b>${t('admin.orderDetail.packages')}</b></td><td>${bill.packages}</td></tr>
        ${bill.codAmount ? `<tr><td><b>${t('admin.orderDetail.codAmount')}</b></td><td>${bill.codAmount}</td></tr>` : ''}
        ${bill.trackingUrl ? `<tr><td><b>${t('admin.orderDetail.tracking')}</b></td><td>${bill.trackingUrl}</td></tr>` : ''}
      </table>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <Box>
      <AdminBreadcrumb
        items={[
          { label: t('admin.orders.title'), to: ordersPath },
          { label: order.id },
        ]}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <IconButton onClick={() => navigate(ordersPath)} sx={{ bgcolor: brand.surface }}>
            <ArrowBackRounded />
          </IconButton>
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ color: brand.graphite, fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
                {order.id}
              </Typography>
              <Chip
                label={t(`admin.orders.status.${order.status}`)}
                sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700 }}
              />
              {firstOrder && (
                <Chip
                  icon={<StarRounded sx={{ fontSize: '1rem !important' }} />}
                  label={t('admin.orderDetail.firstOrder')}
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 193, 7, 0.15)', color: '#B8860B', fontWeight: 700 }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>
                {t('admin.orderDetail.placedOn', { date: order.date })}
              </Typography>
              <CountryMark code={order.country} name={countryName(order.country)} />
            </Stack>
          </Box>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRounded />}
            onClick={() => { void downloadOrderSheet(order, t, i18n.language) }}
          >
            {t('admin.orderDetail.downloadSheet')}
          </Button>
          <Button
            variant="contained"
            startIcon={<RateReviewRounded />}
            onClick={() => setReviewOpen(true)}
          >
            {t('admin.orderDetail.requestReview')}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: '20px',
          bgcolor: brand.white,
          border: `1px solid ${brand.border}`,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Fact label={t('checkout.payment')}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: isCod ? '#C47A4A' : brand.plantGreenDark }}>
              {isCod ? `НП · ${t('admin.orderDetail.payment.cod')}` : t(`admin.orderDetail.payment.${order.paymentMethod}`)}
            </Typography>
          </Fact>
          <Fact label={t('admin.orders.table.total')}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{order.total}</Typography>
          </Fact>
          <Fact label={t('admin.orderDetail.recipient')}>
            <Typography sx={{ fontWeight: 700 }}>{order.shipping.name}</Typography>
          </Fact>
          <Fact label={t('admin.orderDetail.phone')}>
            <Typography sx={{ fontWeight: 700 }}>{order.shipping.phone || order.phone}</Typography>
          </Fact>
          <Fact label={t('admin.orderDetail.courier')}>
            <Typography sx={{ fontWeight: 700 }}>
              {courierId ? t(`admin.orderDetail.couriers.${courierId}`, { defaultValue: courierId }) : t('admin.orderDetail.noCourier')}
            </Typography>
          </Fact>
          <Fact label={t('admin.orderDetail.address')}>
            <Typography sx={{ fontWeight: 700 }}>
              {order.shippingDelivery === 'office'
                ? t('admin.orderDetail.deliveryToOffice', { code: order.shippingOfficeCode || '—' })
                : t('admin.orderDetail.deliveryToAddress')}
              {' · '}
              {order.shipping.city}
            </Typography>
          </Fact>
          <Fact label={t('admin.orderDetail.merchantDeliveryLoss')}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: merchantLoss > 0 ? '#B71C1C' : brand.graphite }}>
              {formatEuro(merchantLoss)}
            </Typography>
          </Fact>
        </Box>
        {merchantBills.length > 0 ? (
          <Stack spacing={0.25} sx={{ mt: 1.5 }}>
            {merchantBills.map((bill) => (
              <Typography key={bill.number} sx={{ fontSize: '0.84rem', color: brand.textSecondary }}>
                {t(`admin.orderDetail.waybillPurpose.${bill.purpose ?? 'shipment'}`, { defaultValue: bill.purpose ?? 'shipment' })}
                {' · '}
                {bill.number}
                {' · '}
                {bill.deliveryCost ?? t('admin.orderDetail.noCourierPrice')}
              </Typography>
            ))}
            {merchantPriceMissing ? (
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#C47A4A' }}>
                {t('admin.orderDetail.merchantDeliveryMissing')}
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => void runCheck()}
            disabled={busy === 'check'}
            sx={{ alignSelf: 'flex-start', bgcolor: '#C47A4A', '&:hover': { bgcolor: '#A8643A' } }}
          >
            {busy === 'check' ? t('admin.orderDetail.checking') : t('admin.orderDetail.checkCod')}
          </Button>
          <Typography sx={{ fontSize: '0.88rem', color: brand.graphite }}>
            {t('admin.orderDetail.checkPhoneBody', { phone: order.shipping.phone || order.phone || '—' })}
          </Typography>
          {isCod ? (
            <Typography sx={{ fontSize: '0.88rem', color: brand.graphite }}>
              {t('admin.orderDetail.codBody', { amount: order.total })}
            </Typography>
          ) : null}
        </Stack>
        {check ? (
          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            {check.ok ? (
              <Typography sx={{ color: brand.plantGreenDark, fontSize: '0.9rem', fontWeight: 700 }}>{t('admin.orderDetail.checkOk')}</Typography>
            ) : null}
            {check.issues.map((issue, index) => (
              <Typography key={`${issue.code}-${index}`} sx={{ color: issue.severity === 'error' ? '#C62828' : '#C47A4A', fontSize: '0.9rem', fontWeight: 700 }}>
                {issue.code === 'bgPhone'
                  ? t('admin.orderDetail.checkIssues.bgPhone', { phone: issue.message || order.shipping.phone || order.phone || '—' })
                  : issue.code === 'econt' && issue.message
                    ? issue.message
                    : t(`admin.orderDetail.checkIssues.${issue.code}`, { defaultValue: issue.message || issue.code })}
              </Typography>
            ))}
            {check.price != null ? (
              <Typography sx={{ fontSize: '0.88rem', color: brand.textSecondary }}>
                {t('admin.orderDetail.checkPrice', { price: check.price, currency: check.currency || '' })}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
        {actionError ? (
          <Typography sx={{ color: '#C62828', fontSize: '0.9rem', fontWeight: 700, mt: 1 }}>{actionError}</Typography>
        ) : null}

        <Divider sx={{ my: 2 }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: brand.textSecondary, mb: 1 }}>
          {t('admin.orderDetail.nextStep')}
        </Typography>
        {nextSteps.length === 0 ? (
          <Typography sx={{ color: brand.textSecondary }}>{t('admin.orderDetail.statusNextNone')}</Typography>
        ) : (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {nextSteps.map((step) => (
              <Button
                key={step}
                variant={step === 'cancelled' ? 'outlined' : 'contained'}
                onClick={() => {
                  setStatusDraft(step)
                  setStatusNote('')
                  setStatusError(null)
                }}
              >
                {t(`admin.orders.status.${step}`)}
              </Button>
            ))}
          </Stack>
        )}
        {order.status === 'returnedAfterReview' ? (
          <Typography sx={{ mt: 1.25, color: brand.textSecondary, fontSize: '0.9rem' }}>
            {t('admin.orderDetail.afterReviewHint')}
          </Typography>
        ) : null}
        {order.status === 'unclaimed' ? (
          <Typography sx={{ mt: 1.25, color: brand.textSecondary, fontSize: '0.9rem' }}>
            {t('admin.orderDetail.unclaimedHint')}
          </Typography>
        ) : null}
        {returning ? (
          <Typography sx={{ mt: 1.25, color: brand.textSecondary, fontSize: '0.9rem' }}>
            {t('admin.orderDetail.sendReturnHint')}
          </Typography>
        ) : null}
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Panel title={t('admin.orderDetail.customer')}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: brand.plantGreenMuted, color: brand.plantGreenDark, fontWeight: 700 }}>
                  {order.customer.charAt(0)}
                </Avatar>
                <Box>
                  <Link
                    component={RouterLink}
                    to={`/admin/customers/${order.customerId}`}
                    underline="hover"
                    sx={{ fontWeight: 700, color: brand.graphite, display: 'block' }}
                  >
                    {order.customer}
                  </Link>
                  <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>{order.customerId}</Typography>
                </Box>
              </Stack>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <EmailRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  <Link href={`mailto:${order.email}`} sx={{ fontSize: '0.9rem' }}>{order.email}</Link>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PhoneRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  <Typography sx={{ fontSize: '0.9rem' }}>{order.phone}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PublicRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  <CountryMark code={order.country} name={countryName(order.country)} />
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid size={6}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('admin.orderDetail.orderCount')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {t('admin.orderDetail.orderNumberOf', { current: orderNumber, total: customerOrders.length })}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('admin.customers.table.totalSpent')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{order.total}</Typography>
                </Grid>
              </Grid>
            </Panel>

            <Panel title={t('admin.orderDetail.shippingAddress')}>
              <Typography sx={{ fontWeight: 600 }}>{order.shipping.name}</Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', mt: 0.5 }}>
                {order.shipping.street}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>
                {order.shipping.postalCode} {order.shipping.city}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                <CountryMark code={order.shipping.country} name={countryName(order.shipping.country)} />
              </Stack>
              <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>{order.shipping.phone}</Typography>
            </Panel>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <Panel title={waybills.length > 0 ? t('admin.orderDetail.waybill') : t('admin.orderDetail.shipment')}>
              <Stack spacing={1.5}>
                {canCreateWaybill ? (
                  <Button variant="contained" startIcon={<LocalShippingRounded />} onClick={() => setWaybillOpen(true)} sx={{ alignSelf: 'flex-start' }}>
                    {createLabel}
                  </Button>
                ) : null}
                <Typography sx={{ fontWeight: 700 }}>
                  {courierId
                    ? t(`admin.orderDetail.couriers.${courierId}`, { defaultValue: courierId })
                    : t('admin.orderDetail.noCourier')}
                  {' · '}
                  {order.shippingDelivery === 'office'
                    ? t('admin.orderDetail.deliveryToOffice', { code: order.shippingOfficeCode || '—' })
                    : t('admin.orderDetail.deliveryToAddress')}
                  {' · '}
                  {order.shipping.city}
                </Typography>
                {waybills.length > 0 ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: brand.textSecondary }}>
                        {t('admin.orderDetail.paidByCustomer')}
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{payerTotal('customer')}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: brand.textSecondary }}>
                        {t('admin.orderDetail.paidByMerchant')}
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{payerTotal('merchant')}</Typography>
                    </Box>
                  </Stack>
                ) : null}
                {waybills.map((bill) => {
                  const purpose = bill.purpose ?? 'shipment'
                  const direction = bill.direction ?? (purpose === 'return' ? 'customer_to_merchant' : 'merchant_to_customer')
                  const payer = bill.payer === 'merchant' ? 'merchant' : 'customer'
                  return (
                    <Box key={bill.number} sx={{ borderTop: `1px solid ${brand.border}`, pt: 1.5 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}>
                        <Box>
                          <Chip
                            size="small"
                            label={t(`admin.orderDetail.waybillPurpose.${purpose}`, { defaultValue: purpose })}
                            sx={{ mb: 0.75, fontWeight: 800, bgcolor: direction === 'customer_to_merchant' ? 'rgba(183, 28, 28, 0.1)' : brand.plantGreenMuted, color: direction === 'customer_to_merchant' ? '#B71C1C' : brand.plantGreenDark }}
                          />
                          <Typography sx={{ fontWeight: 800, fontSize: '1.02rem' }}>
                            {t(`admin.orderDetail.payers.${payer}`)}
                            {' · '}
                            {bill.deliveryCost ?? t('admin.orderDetail.noCourierPrice')}
                          </Typography>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.04em' }}>
                            {bill.number}
                          </Typography>
                          <Typography sx={{ fontSize: '0.86rem', color: brand.textSecondary }}>
                            {bill.weightKg} kg · {t('admin.orderDetail.packages')}: {bill.packages}
                            {bill.codAmount ? ` · ${t('admin.orderDetail.codAmount')}: ${bill.codAmount}` : ''}
                            {' · '}
                            {formatStamp(bill.createdAt, i18n.language)}
                          </Typography>
                        </Box>
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                          {purpose === 'unclaimed' ? null : bill.labelUrl ? (
                            <Button variant="outlined" startIcon={<PrintRounded />} onClick={() => void openSticker(bill.number)} disabled={busy === 'print'}>
                              {t('admin.orderDetail.printSticker')}
                            </Button>
                          ) : (
                            <Button variant="outlined" startIcon={<PrintRounded />} onClick={() => handlePrintWaybill(bill)}>
                              {t('admin.orderDetail.printWaybill')}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  )
                })}
                {actionError ? (
                  <Typography sx={{ color: '#C62828', fontSize: '0.86rem', fontWeight: 600 }}>{actionError}</Typography>
                ) : null}
              </Stack>
            </Panel>
            <OrderMovement
              status={order.status}
              timeline={order.timeline}
              waybills={waybills}
              tracks={tracks}
              loadingNumbers={loadingNumbers}
              onRefresh={(number) => void refreshStatus(number)}
            />
            <Panel title={t('admin.orderDetail.items', { count: order.lineItems.length })}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.table.product')}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orderDetail.qty')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orderDetail.price')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orders.table.total')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ border: 0, py: 1.5 }}>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <MediaImg
                              src={item.image}
                              preset="thumb"
                              alt=""
                              sx={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'contain', bgcolor: brand.surface }}
                            />
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                {item.name ?? t(`products.${item.categoryKey}.${item.nameKey}.name`)}
                              </Typography>
                              <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary }}>
                                {t(`admin.dashboard.categories.${item.categoryKey}`)}
                              </Typography>
                              {item.gift ? <OrderGiftLine gift={item.gift} compact /> : null}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="center" sx={{ border: 0, fontWeight: 600 }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ border: 0 }}>{item.unitPrice}</TableCell>
                        <TableCell align="right" sx={{ border: 0, fontWeight: 700 }}>{item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${brand.border}` }}>
                <Stack spacing={0.75} sx={{ maxWidth: 280, ml: 'auto' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.orderDetail.subtotal')}</Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>{order.subtotal}</Typography>
                  </Stack>
                  {order.discount ? (
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>
                        {order.promoCode
                          ? `${t('admin.orderDetail.sheet.discount')} (${order.promoCode})`
                          : t('admin.orderDetail.sheet.discount')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem' }}>−{order.discount}</Typography>
                    </Stack>
                  ) : null}
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.orderDetail.shippingCost')}</Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>{order.shippingCost}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>
                      {order.taxRate
                        ? t('admin.orderDetail.taxRate', { rate: order.taxRate })
                        : t('admin.orderDetail.tax')}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>{order.tax}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700 }}>{t('admin.orders.table.total')}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: brand.plantGreenDark }}>{order.total}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary, textAlign: 'right' }}>
                    {t(`admin.orderDetail.payment.${order.paymentMethod}`)}
                  </Typography>
                </Stack>
              </Box>
            </Panel>

            {order.notes && (
              <Panel title={t('admin.orderDetail.notes')}>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>{order.notes}</Typography>
              </Panel>
            )}

            {customerOrders.length > 1 && (
              <Panel title={t('admin.orderDetail.customerOrders')}>
                <Stack spacing={0.5}>
                  {customerOrders.map((o) => (
                    <Link
                      key={o.id}
                      component={RouterLink}
                      to={`/admin/orders/${o.id}`}
                      state={location.state}
                      underline="hover"
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.75,
                        fontWeight: o.id === order.id ? 700 : 500,
                        color: o.id === order.id ? brand.plantGreenDark : brand.graphite,
                      }}
                    >
                      <span>{o.id}</span>
                      <span style={{ color: brand.textSecondary }}>{o.date} · {t(`admin.countries.${o.country}`, { defaultValue: countryDisplayName(o.country, i18n.language) })} · {o.total}</span>
                    </Link>
                  ))}
                </Stack>
              </Panel>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={statusDraft !== null} onClose={() => { if (!statusBusy) setStatusDraft(null) }} maxWidth="xs" fullWidth>
        <DialogTitle>{t('admin.orderDetail.statusConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.92rem', mb: 2 }}>
            {t('admin.orderDetail.statusConfirmBody', {
              from: t(`admin.orders.status.${order.status}`),
              to: statusDraft ? t(`admin.orders.status.${statusDraft}`) : '',
            })}
          </Typography>
          <TextField
            label={t('admin.orderDetail.statusNote')}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
            autoFocus
          />
          {statusError ? (
            <Typography sx={{ color: '#C62828', fontSize: '0.82rem', fontWeight: 600, mt: 1 }}>{statusError}</Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDraft(null)} disabled={statusBusy}>{t('admin.productEdit.cancel')}</Button>
          <Button
            variant="contained"
            disabled={statusBusy}
            onClick={() => {
              if (!statusDraft) return
              setStatusBusy(true)
              setStatusError(null)
              void updateOrderStatus(order.id, statusDraft, statusNote.trim())
                .then(() => {
                  setStatusDraft(null)
                  setStatusNote('')
                })
                .catch((err: unknown) => {
                  setStatusError(err instanceof ApiError ? err.message : t('admin.orderDetail.statusFailed'))
                })
                .finally(() => setStatusBusy(false))
            }}
          >
            {t('admin.orderDetail.statusConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <RequestReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        email={order.email}
        customerName={order.customer}
        orderId={order.id}
        products={order.lineItems
          .filter((item, index, all) => all.findIndex((other) => other.productId === item.productId) === index)
          .map((item) => ({ slug: item.productId, name: item.name || item.productId }))}
      />
      <CreateWaybillDialog
        open={waybillOpen}
        orderId={order.id}
        defaultCourier={isEcont ? 'econt' : courierId || undefined}
        codAmount={returning || order.status === 'replacement' ? undefined : order.paymentMethod === 'cod' ? order.total : undefined}
        purpose={returning ? 'return' : order.status === 'replacement' ? 'replacement' : 'shipment'}
        onClose={() => setWaybillOpen(false)}
      />
    </Box>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ flex: '1 1 180px', minWidth: 160 }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: brand.textSecondary }}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  )
}

function CountryMark({ code, name }: { code: string; name: string }) {
  const flag = countryFlag(code)
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontWeight: 700, color: brand.graphite, fontSize: '0.95rem' }}>
      {flag ? (
        <Box component="span" aria-hidden sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
          {flag}
        </Box>
      ) : null}
      {name}
    </Box>
  )
}
