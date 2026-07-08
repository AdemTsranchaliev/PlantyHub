import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
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
import PrintRounded from '@mui/icons-material/PrintRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import { useTranslation } from 'react-i18next'
import { AdminBreadcrumb } from '../../components/admin/AdminPageHeader'
import CreateWaybillDialog from '../../components/admin/CreateWaybillDialog'
import {
  getCustomerByEmail,
  getCustomerOrderNumber,
  getOrdersByEmail,
  isFirstOrder,
} from '../../admin/orderDetails'
import type { OrderStatus } from '../../admin/mockData'
import { useOrderDetail, useOrdersStore } from '../../hooks/useOrders'
import { brand } from '../../theme'

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(227, 159, 118, 0.15)', color: '#C47A4A' },
  processing: { bg: 'rgba(47, 125, 83, 0.12)', color: brand.plantGreenDark },
  shipped: { bg: 'rgba(76, 163, 116, 0.15)', color: brand.plantGreen },
  delivered: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  cancelled: { bg: 'rgba(28, 35, 30, 0.08)', color: brand.textSecondary },
}

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
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '1.05rem' }}>{title}</Typography>
        {action}
      </Stack>
      {children}
    </Box>
  )
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const order = useOrderDetail(orderId)
  const { updateOrderStatus } = useOrdersStore()
  const [waybillOpen, setWaybillOpen] = useState(false)

  if (!order) {
    return (
      <Box>
        <AdminBreadcrumb
          items={[
            { label: t('admin.orders.title'), to: '/admin/orders' },
            { label: orderId ?? '—' },
          ]}
        />
        <Typography sx={{ color: brand.textSecondary }}>{t('admin.orderDetail.notFound')}</Typography>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/admin/orders')} sx={{ mt: 2 }}>
          {t('admin.orderDetail.backToOrders')}
        </Button>
      </Box>
    )
  }

  const customer = getCustomerByEmail(order.email)
  const firstOrder = isFirstOrder(order.id)
  const orderNumber = getCustomerOrderNumber(order.id)
  const customerOrders = getOrdersByEmail(order.email)
  const colors = statusColors[order.status]
  const canCreateWaybill = !order.waybill && order.status !== 'cancelled' && order.status !== 'delivered'

  const handlePrintWaybill = () => {
    if (!order.waybill) return
    const w = window.open('', '_blank', 'width=600,height=800')
    if (!w) return
    w.document.write(`
      <html><head><title>${order.waybill.number}</title>
      <style>body{font-family:sans-serif;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td{padding:6px 0}</style>
      </head><body>
      <h1>${t('admin.orderDetail.waybillTitle')} — ${order.waybill.number}</h1>
      <table>
        <tr><td><b>${t('admin.orderDetail.courier')}</b></td><td>${t(`admin.orderDetail.couriers.${order.waybill.courier}`)}</td></tr>
        <tr><td><b>${t('admin.orders.table.id')}</b></td><td>${order.id}</td></tr>
        <tr><td><b>${t('admin.orderDetail.recipient')}</b></td><td>${order.shipping.name}</td></tr>
        <tr><td><b>${t('admin.orderDetail.address')}</b></td><td>${order.shipping.street}, ${order.shipping.city} ${order.shipping.postalCode}, ${t(`admin.countries.${order.shipping.country}`)}</td></tr>
        <tr><td><b>${t('admin.orderDetail.phone')}</b></td><td>${order.shipping.phone}</td></tr>
        <tr><td><b>${t('admin.orderDetail.weight')}</b></td><td>${order.waybill.weightKg} kg</td></tr>
        <tr><td><b>${t('admin.orderDetail.packages')}</b></td><td>${order.waybill.packages}</td></tr>
        ${order.waybill.codAmount ? `<tr><td><b>${t('admin.orderDetail.codAmount')}</b></td><td>${order.waybill.codAmount}</td></tr>` : ''}
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
          { label: t('admin.orders.title'), to: '/admin/orders' },
          { label: order.id },
        ]}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/admin/orders')} sx={{ bgcolor: brand.surface }}>
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
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', mt: 0.5 }}>
              {t('admin.orderDetail.placedOn', { date: order.date })} · {t(`admin.countries.${order.country}`)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {canCreateWaybill && (
            <Button
              variant="contained"
              startIcon={<LocalShippingRounded />}
              onClick={() => setWaybillOpen(true)}
            >
              {t('admin.orderDetail.createWaybill')}
            </Button>
          )}
          {order.waybill && (
            <Button variant="outlined" startIcon={<PrintRounded />} onClick={handlePrintWaybill}>
              {t('admin.orderDetail.printWaybill')}
            </Button>
          )}
          <TextField
            select
            size="small"
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
            sx={{ minWidth: 160 }}
          >
            {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
              <MenuItem key={s} value={s}>
                {t(`admin.orders.status.${s}`)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

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
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{t(`admin.countries.${order.country}`)}</Typography>
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid size={6}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('admin.orderDetail.orderCount')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {t('admin.orderDetail.orderNumberOf', { current: orderNumber, total: customer?.orders ?? customerOrders.length })}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('admin.customers.table.totalSpent')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{customer?.totalSpent ?? order.total}</Typography>
                </Grid>
                {customer && (
                  <Grid size={12}>
                    <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                      {t('admin.customers.table.joined')}
                    </Typography>
                    <Typography>{customer.joined}</Typography>
                  </Grid>
                )}
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
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', fontWeight: 600 }}>
                {t(`admin.countries.${order.shipping.country}`)}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>{order.shipping.phone}</Typography>
            </Panel>

            {order.waybill && (
              <Panel
                title={t('admin.orderDetail.waybill')}
                action={
                  <IconButton size="small" onClick={handlePrintWaybill} aria-label={t('admin.orderDetail.printWaybill')}>
                    <PrintRounded fontSize="small" />
                  </IconButton>
                }
              >
                <Stack spacing={1}>
                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('admin.orderDetail.waybillNumber')}
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem' }}>
                      {order.waybill.number}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    {t('admin.orderDetail.courier')}: {t(`admin.orderDetail.couriers.${order.waybill.courier}`)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: brand.textSecondary }}>
                    {t('admin.orderDetail.weight')}: {order.waybill.weightKg} kg · {t('admin.orderDetail.packages')}: {order.waybill.packages}
                  </Typography>
                  {order.waybill.codAmount && (
                    <Typography sx={{ fontSize: '0.9rem' }}>
                      {t('admin.orderDetail.codAmount')}: {order.waybill.codAmount}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>
                    {formatDateTime(order.waybill.createdAt)}
                  </Typography>
                </Stack>
              </Panel>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
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
                            <Box
                              component="img"
                              src={item.image}
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
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.orderDetail.shippingCost')}</Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>{order.shippingCost}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.orderDetail.tax')}</Typography>
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

            <Panel title={t('admin.orderDetail.timeline')}>
              <Stack spacing={0}>
                {order.timeline.map((entry, i) => {
                  const entryColors = statusColors[entry.status]
                  return (
                    <Stack key={`${entry.at}-${i}`} direction="row" spacing={2} sx={{ py: 1.25 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: entryColors.color,
                          mt: 0.75,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {t(`admin.orders.status.${entry.status}`)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>
                            {formatDateTime(entry.at)}
                          </Typography>
                        </Stack>
                        {entry.note && (
                          <Typography sx={{ fontSize: '0.85rem', color: brand.textSecondary, mt: 0.25 }}>
                            {entry.note}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  )
                })}
              </Stack>
            </Panel>

            {customerOrders.length > 1 && (
              <Panel title={t('admin.orderDetail.customerOrders')}>
                <Stack spacing={0.5}>
                  {customerOrders.map((o) => (
                    <Link
                      key={o.id}
                      component={RouterLink}
                      to={`/admin/orders/${o.id}`}
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
                      <span style={{ color: brand.textSecondary }}>{o.date} · {t(`admin.countries.${o.country}`)} · {o.total}</span>
                    </Link>
                  ))}
                </Stack>
              </Panel>
            )}
          </Stack>
        </Grid>
      </Grid>

      <CreateWaybillDialog
        open={waybillOpen}
        orderId={order.id}
        codAmount={order.paymentMethod === 'cod' ? order.total : undefined}
        onClose={() => setWaybillOpen(false)}
      />
    </Box>
  )
}
