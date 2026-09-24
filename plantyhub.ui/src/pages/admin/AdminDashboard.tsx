import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Link from '@mui/material/Link'
import EuroRounded from '@mui/icons-material/EuroRounded'
import ShoppingBagRounded from '@mui/icons-material/ShoppingBagRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { countryDisplayName } from '../../utils/country'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminBarChart from '../../components/admin/AdminBarChart'
import AdminProgressList from '../../components/admin/AdminProgressList'
import { useCategoryProducts } from '../../hooks/useProducts'
import { formatEuro, type OrderStatus } from '../../admin/mockData'
import { useDashboard } from '../../hooks/useDashboard'
import { useCustomers } from '../../hooks/useCustomers'
import { useOrders } from '../../hooks/useOrders'
import { brand } from '../../theme'

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(227, 159, 118, 0.15)', color: '#C47A4A' },
  processing: { bg: 'rgba(47, 125, 83, 0.12)', color: brand.plantGreenDark },
  shipped: { bg: 'rgba(76, 163, 116, 0.15)', color: brand.plantGreen },
  delivered: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  cancelled: { bg: 'rgba(28, 35, 30, 0.08)', color: brand.textSecondary },
}

const orderStatusBarColors: Record<string, string> = {
  pending: '#E39F76',
  processing: brand.plantGreenLight,
  shipped: brand.plantGreen,
  delivered: brand.plantGreenDark,
  cancelled: brand.textSecondary,
}

function Panel({
  title,
  subtitle,
  action,
  children,
  flush,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  flush?: boolean
}) {
  return (
    <Box
      sx={{
        bgcolor: brand.white,
        borderRadius: '18px',
        border: `1px solid ${brand.border}`,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, px: { xs: 2, sm: 2.5 }, pt: 2, pb: flush ? 1.5 : 0 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '1rem' }}>{title}</Typography>
          {subtitle && (
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem', mt: 0.25 }}>{subtitle}</Typography>
          )}
        </Box>
        {action}
      </Box>
      <Box sx={{ p: flush ? 0 : { xs: 2, sm: 2.5 }, pt: flush ? 0 : 2 }}>{children}</Box>
    </Box>
  )
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: dashboard, loading: dashboardLoading } = useDashboard()
  const { customers } = useCustomers()
  const gardens = useCategoryProducts('gardens')
  const pods = useCategoryProducts('pods')
  const consumables = useCategoryProducts('consumables')
  const accessories = useCategoryProducts('accessories')
  const productCount = gardens.length + pods.length + consumables.length + accessories.length
  const allOrders = useOrders()
  const recentOrders = allOrders.slice(0, 5)

  const stats = dashboard?.stats
  const weeklySales = dashboard?.weeklySales ?? []
  const topProducts = dashboard?.topProducts ?? []
  const weeklyTotal = weeklySales.reduce((sum, d) => sum + d.amount, 0)

  const orderStatusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const order of allOrders) counts[order.status]++
    return counts
  }, [allOrders])

  const categoryBreakdown = useMemo(() => {
    const categories = [
      { key: 'gardens' as const, count: gardens.length },
      { key: 'pods' as const, count: pods.length },
      { key: 'consumables' as const, count: consumables.length },
      { key: 'accessories' as const, count: accessories.length },
    ]
    return categories.map((cat) => ({
      key: cat.key,
      count: cat.count,
    }))
  }, [gardens.length, pods.length, consumables.length, accessories.length])

  const trendLabel = (value: number) => (value > 0 ? t('admin.dashboard.stats.trendUp', { value }) : undefined)
  const secondaryStats = [
    { label: t('admin.dashboard.stats.avgOrder'), value: dashboardLoading ? '—' : formatEuro(stats?.avgOrderValue ?? 0) },
    { label: t('admin.dashboard.stats.products'), value: productCount },
    { label: t('admin.dashboard.stats.newsletter'), value: (stats?.newsletterSubscribers ?? 0).toLocaleString() },
    { label: t('admin.dashboard.stats.conversion'), value: `${stats?.conversionRate ?? 0}%` },
  ]

  return (
    <Box>
      <AdminPageHeader title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')} />

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.revenue')}
            value={dashboardLoading ? '—' : formatEuro(stats?.totalRevenue ?? 0)}
            icon={<EuroRounded />}
            trend={stats ? trendLabel(stats.revenueTrend) : undefined}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.ordersMonth')}
            value={dashboardLoading ? '—' : (stats?.ordersThisMonth ?? 0)}
            icon={<ShoppingBagRounded />}
            trend={stats ? trendLabel(stats.ordersTrend) : undefined}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.pending')}
            value={stats?.pendingOrders ?? 0}
            icon={<PendingActionsRounded />}
            attention={(stats?.pendingOrders ?? 0) > 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.customers')}
            value={customers.length}
            icon={<PeopleRounded />}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          bgcolor: brand.white,
          border: `1px solid ${brand.border}`,
          borderRadius: '18px',
          mb: 2.5,
          overflow: 'hidden',
        }}
      >
        {secondaryStats.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              px: 2,
              py: 1.5,
              borderRight: { md: index < 3 ? `1px solid ${brand.border}` : 'none' },
              borderBottom: { xs: index < 2 ? `1px solid ${brand.border}` : 'none', md: 'none' },
              borderLeft: { xs: index % 2 === 1 ? `1px solid ${brand.border}` : 'none', md: 'none' },
            }}
          >
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.75rem', fontWeight: 700 }}>{item.label}</Typography>
            <Typography sx={{ color: brand.graphite, fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', mt: 0.25 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Charts row */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Panel
            title={t('admin.dashboard.weeklySales')}
            subtitle={t('admin.dashboard.weeklySalesSubtitle', { total: formatEuro(weeklyTotal) })}
          >
            <AdminBarChart
              items={weeklySales.map((d) => ({
                label: t(`admin.dashboard.days.${d.dayKey}`),
                value: d.amount,
              }))}
              formatValue={(value) => formatEuro(value)}
            />
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Panel title={t('admin.dashboard.orderStatus')} subtitle={t('admin.dashboard.orderStatusSubtitle')}>
            <AdminProgressList
              items={Object.entries(orderStatusCounts).map(([status, value]) => ({
                label: t(`admin.orders.status.${status}`),
                value,
                color: orderStatusBarColors[status],
              }))}
            />
          </Panel>
        </Grid>
      </Grid>

      {/* Products & categories */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Panel title={t('admin.dashboard.topProducts')} subtitle={t('admin.dashboard.topProductsSubtitle')}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                    {t('admin.table.product')}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                    {t('admin.dashboard.sales')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                    {t('admin.dashboard.revenue')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ border: 0, color: brand.textSecondary, py: 3 }}>
                      {t('admin.dashboard.emptyProducts')}
                    </TableCell>
                  </TableRow>
                )}
                {topProducts.map((product, i) => (
                  <TableRow key={product.id}>
                    <TableCell sx={{ border: 0, py: 1.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '8px',
                            bgcolor: brand.plantGreenMuted,
                            color: brand.plantGreenDark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}
                        >
                          {i + 1}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: brand.graphite }}>
                            {t(`products.${product.categoryKey}.${product.nameKey}.name`)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary }}>
                            {t(`admin.dashboard.categories.${product.categoryKey}`)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ border: 0, fontWeight: 700, color: brand.graphite }}>
                      {product.sales}
                    </TableCell>
                    <TableCell align="right" sx={{ border: 0, fontWeight: 700, color: brand.plantGreenDark }}>
                      {product.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Panel title={t('admin.dashboard.byCategory')} subtitle={t('admin.dashboard.byCategorySubtitle')}>
            <Grid container spacing={1.25}>
              {categoryBreakdown.map((cat) => (
                <Grid key={cat.key} size={6}>
                  <Box sx={{ bgcolor: brand.surface, borderRadius: '14px', px: 1.75, py: 1.5 }}>
                    <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: brand.graphite, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {cat.count}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: brand.textSecondary, mt: 0.5 }}>
                      {t(`admin.dashboard.categories.${cat.key}`)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Panel>
        </Grid>
      </Grid>

      <Panel
        flush
        title={t('admin.dashboard.recentOrders')}
        action={
          <Link component={RouterLink} to="/admin/orders" underline="hover" sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.plantGreenDark, whiteSpace: 'nowrap' }}>
            {t('admin.dashboard.viewOrders')}
          </Link>
        }
      >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: brand.surface }}>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.id')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.customer')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', display: { xs: 'none', md: 'table-cell' } }}>
                {t('admin.table.country')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.total')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.status')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', display: { xs: 'none', sm: 'table-cell' } }}>
                {t('admin.orders.table.date')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.map((order) => {
              const colors = statusColors[order.status]
              return (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: brand.graphite }}>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t(`admin.countries.${order.country}`, { defaultValue: countryDisplayName(order.country, i18n.language) })}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{order.total}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`admin.orders.status.${order.status}`)}
                      size="small"
                      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: brand.textSecondary, display: { xs: 'none', sm: 'table-cell' } }}>{order.date}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      </Panel>
    </Box>
  )
}
