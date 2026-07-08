import { Link as RouterLink } from 'react-router-dom'
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
import EuroRounded from '@mui/icons-material/EuroRounded'
import ShoppingBagRounded from '@mui/icons-material/ShoppingBagRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import InventoryRounded from '@mui/icons-material/InventoryRounded'
import MailRounded from '@mui/icons-material/MailRounded'
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
      <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '1.05rem', mb: subtitle ? 0.5 : 2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', mb: 2 }}>{subtitle}</Typography>
      )}
      {children}
    </Box>
  )
}

export default function AdminDashboard() {
  const { t } = useTranslation()
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
    const total = productCount || 1
    return categories.map((cat) => ({
      key: cat.key,
      share: Math.round((cat.count / total) * 100),
      revenue: String(cat.count),
    }))
  }, [gardens.length, pods.length, consumables.length, accessories.length, productCount])

  const trendLabel = (value: number) => t('admin.dashboard.stats.trendUp', { value })

  return (
    <Box>
      <AdminPageHeader title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')} />

      {/* Primary KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.revenue')}
            value={dashboardLoading ? '—' : formatEuro(stats?.totalRevenue ?? 0)}
            icon={<EuroRounded />}
            trend={stats ? trendLabel(stats.revenueTrend) : undefined}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.ordersMonth')}
            value={dashboardLoading ? '—' : (stats?.ordersThisMonth ?? 0)}
            icon={<ShoppingBagRounded />}
            trend={stats ? trendLabel(stats.ordersTrend) : undefined}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.avgOrder')}
            value={dashboardLoading ? '—' : formatEuro(stats?.avgOrderValue ?? 0)}
            icon={<TrendingUpRounded />}
            trend={stats ? trendLabel(stats.avgOrderTrend) : undefined}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.customers')}
            value={customers.length}
            icon={<PeopleRounded />}
            trend={t('admin.dashboard.stats.customersTrend')}
            trendUp
          />
        </Grid>
      </Grid>

      {/* Secondary KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <AdminStatCard label={t('admin.dashboard.stats.products')} value={productCount} icon={<InventoryRounded />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.newsletter')}
            value={(stats?.newsletterSubscribers ?? 0).toLocaleString()}
            icon={<MailRounded />}
            trend={t('admin.dashboard.stats.newsletterTrend')}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.pending')}
            value={stats?.pendingOrders ?? 0}
            icon={<PendingActionsRounded />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <AdminStatCard
            label={t('admin.dashboard.stats.conversion')}
            value={`${stats?.conversionRate ?? 0}%`}
            icon={<VisibilityRounded />}
            trend={stats ? trendLabel(stats.conversionTrend) : undefined}
            trendUp
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
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
        <Grid size={{ xs: 12, lg: 6 }}>
          <Panel title={t('admin.dashboard.byCategory')} subtitle={t('admin.dashboard.byCategorySubtitle')}>
            <AdminProgressList
              items={categoryBreakdown.map((cat) => ({
                label: t(`admin.dashboard.categories.${cat.key}`),
                value: cat.share,
              }))}
            />
            <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${brand.border}` }}>
              {categoryBreakdown.map((cat) => (
                <Box key={cat.key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography sx={{ fontSize: '0.85rem', color: brand.textSecondary }}>
                    {t(`admin.dashboard.categories.${cat.key}`)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.graphite }}>
                    {cat.revenue}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Panel>
        </Grid>
      </Grid>

      {/* Recent orders */}
      <Typography variant="h6" sx={{ color: brand.graphite, mb: 2, fontSize: '1.1rem' }}>
        {t('admin.dashboard.recentOrders')}
      </Typography>
      <TableContainer
        sx={{
          bgcolor: brand.white,
          borderRadius: '20px',
          border: `1px solid ${brand.border}`,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: brand.surface }}>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.id')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.customer')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.table.country')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.total')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.status')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.orders.table.date')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.table.actions')}
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
                  component={RouterLink}
                  to={`/admin/orders/${order.id}`}
                  sx={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: brand.graphite }}>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{t(`admin.countries.${order.country}`)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{order.total}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`admin.orders.status.${order.status}`)}
                      size="small"
                      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: brand.textSecondary }}>{order.date}</TableCell>
                  <TableCell align="right">
                    <VisibilityRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
