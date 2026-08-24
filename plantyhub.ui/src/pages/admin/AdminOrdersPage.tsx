import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { useTranslation } from 'react-i18next'
import { countryDisplayName } from '../../utils/country'
import type { AdminOrder, OrderStatus } from '../../admin/mockData'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { useOrders } from '../../hooks/useOrders'
import { brand } from '../../theme'

const statusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(227, 159, 118, 0.15)', color: '#C47A4A' },
  processing: { bg: 'rgba(47, 125, 83, 0.12)', color: brand.plantGreenDark },
  shipped: { bg: 'rgba(76, 163, 116, 0.15)', color: brand.plantGreen },
  delivered: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  cancelled: { bg: 'rgba(28, 35, 30, 0.08)', color: brand.textSecondary },
}

export default function AdminOrdersPage() {
  const { t } = useTranslation()
  const orders = useOrders()

  return (
    <>
      <AdminPageHeader title={t('admin.orders.title')} subtitle={t('admin.orders.subtitle')} />
      <Stack spacing={2.5}>
        {statusOrder.map((status) => {
          const sectionOrders = orders.filter((order) => order.status === status)
          return (
            <Box
              key={status}
              sx={{
                bgcolor: brand.white,
                borderRadius: '20px',
                border: `1px solid ${brand.border}`,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: 'center', px: 2.25, py: 1.5, borderBottom: `1px solid ${brand.border}` }}
              >
                <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '0.95rem' }}>
                  {t(`admin.orders.sections.${status}`)}
                </Typography>
                <Chip
                  size="small"
                  label={sectionOrders.length}
                  sx={{
                    fontWeight: 800,
                    bgcolor: statusColors[status].bg,
                    color: statusColors[status].color,
                  }}
                />
              </Stack>
              {sectionOrders.length === 0 ? (
                <Typography sx={{ px: 2.25, py: 2, color: brand.textSecondary, fontSize: '0.88rem' }}>
                  {t('admin.orders.emptySection')}
                </Typography>
              ) : (
                <OrdersTable orders={sectionOrders} />
              )}
            </Box>
          )
        })}
      </Stack>
    </>
  )
}

function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const { t, i18n } = useTranslation()

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: brand.surface }}>
            <TableCell sx={headCell}>{t('admin.orders.table.id')}</TableCell>
            <TableCell sx={headCell}>{t('admin.orders.table.customer')}</TableCell>
            <TableCell sx={headCell}>{t('admin.table.country')}</TableCell>
            <TableCell sx={headCell}>{t('admin.orders.table.items')}</TableCell>
            <TableCell sx={headCell}>{t('admin.orders.table.total')}</TableCell>
            <TableCell sx={headCell}>{t('admin.orderDetail.courier')}</TableCell>
            <TableCell sx={headCell}>{t('admin.orders.table.date')}</TableCell>
            <TableCell align="right" sx={headCell}>{t('admin.table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const colors = statusColors[order.status]
            return (
              <TableRow key={order.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: brand.graphite }}>{order.id}</TableCell>
                <TableCell>
                  <div style={{ fontWeight: 600 }}>{order.customer}</div>
                  <div style={{ fontSize: '0.82rem', color: brand.textSecondary }}>{order.email}</div>
                </TableCell>
                <TableCell>{t(`admin.countries.${order.country}`, { defaultValue: countryDisplayName(order.country, i18n.language) })}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{order.total}</TableCell>
                <TableCell>
                  {order.courier ? (
                    <Chip
                      size="small"
                      label={t(`admin.orderDetail.couriers.${order.courier}`)}
                      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  ) : (
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem' }}>—</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ color: brand.textSecondary }}>{order.date}</TableCell>
                <TableCell align="right">
                  <IconButton
                    component={RouterLink}
                    to={`/admin/orders/${order.id}`}
                    size="small"
                    aria-label={t('admin.orders.view')}
                    sx={{ color: brand.textSecondary }}
                  >
                    <VisibilityRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const headCell = {
  fontWeight: 700,
  color: brand.textSecondary,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
} as const
