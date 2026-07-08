import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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
import Typography from '@mui/material/Typography'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EmailRounded from '@mui/icons-material/EmailRounded'
import PhoneRounded from '@mui/icons-material/PhoneRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { useTranslation } from 'react-i18next'
import { AdminBreadcrumb } from '../../components/admin/AdminPageHeader'
import { useCustomerDetail } from '../../hooks/useCustomers'
import { brand } from '../../theme'

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(227, 159, 118, 0.15)', color: '#C47A4A' },
  processing: { bg: 'rgba(47, 125, 83, 0.12)', color: brand.plantGreenDark },
  shipped: { bg: 'rgba(76, 163, 116, 0.15)', color: brand.plantGreen },
  delivered: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  cancelled: { bg: 'rgba(28, 35, 30, 0.08)', color: brand.textSecondary },
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
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
      <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '1.05rem', mb: 2 }}>{title}</Typography>
      {children}
    </Box>
  )
}

export default function AdminCustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, loading } = useCustomerDetail(customerId)
  const customer = data?.customer
  const customerOrders = data?.orders ?? []

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Typography sx={{ color: brand.textSecondary }}>{t('common.loading', { defaultValue: 'Loading…' })}</Typography>
      </Box>
    )
  }

  if (!customer) {
    return (
      <Box>
        <AdminBreadcrumb
          items={[
            { label: t('admin.customers.title'), to: '/admin/customers' },
            { label: customerId ?? '—' },
          ]}
        />
        <Typography sx={{ color: brand.textSecondary }}>{t('admin.customerDetail.notFound')}</Typography>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/admin/customers')} sx={{ mt: 2 }}>
          {t('admin.customerDetail.backToCustomers')}
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <AdminBreadcrumb
        items={[
          { label: t('admin.customers.title'), to: '/admin/customers' },
          { label: customer.name },
        ]}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/admin/customers')} sx={{ bgcolor: brand.surface }}>
            <ArrowBackRounded />
          </IconButton>
          <Avatar sx={{ width: 56, height: 56, bgcolor: brand.plantGreenMuted, color: brand.plantGreenDark, fontWeight: 700, fontSize: '1.25rem' }}>
            {customer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: brand.graphite, fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
              {customer.name}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>
              {customer.id} · {t(`admin.countries.${customer.country}`)}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Panel title={t('admin.customerDetail.contact')}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <EmailRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  <Link href={`mailto:${customer.email}`} sx={{ fontSize: '0.9rem' }}>{customer.email}</Link>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PhoneRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  <Typography sx={{ fontSize: '0.9rem' }}>{customer.phone}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PublicRounded sx={{ fontSize: 18, color: brand.textSecondary }} />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{t(`admin.countries.${customer.country}`)}</Typography>
                </Stack>
              </Stack>
            </Panel>

            <Panel title={t('admin.customerDetail.stats')}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('admin.customers.table.orders')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{customer.orders}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('admin.customers.table.totalSpent')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: brand.plantGreenDark }}>{customer.totalSpent}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('admin.customers.table.joined')}
                  </Typography>
                  <Typography>{customer.joined}</Typography>
                </Grid>
              </Grid>
            </Panel>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel title={t('admin.customerDetail.orders', { count: customerOrders.length })}>
            {customerOrders.length === 0 ? (
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem' }}>{t('admin.customerDetail.noOrders')}</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orders.table.id')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.table.country')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orders.table.total')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orders.table.status')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.orders.table.date')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.78rem', textTransform: 'uppercase', border: 0 }}>
                        {t('admin.table.actions')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerOrders.map((order) => {
                      const colors = statusColors[order.status]
                      return (
                        <TableRow key={order.id}>
                          <TableCell sx={{ border: 0, fontFamily: 'monospace', fontWeight: 700 }}>{order.id}</TableCell>
                          <TableCell sx={{ border: 0 }}>{t(`admin.countries.${order.country}`)}</TableCell>
                          <TableCell sx={{ border: 0, fontWeight: 700 }}>{order.total}</TableCell>
                          <TableCell sx={{ border: 0 }}>
                            <Chip
                              label={t(`admin.orders.status.${order.status}`)}
                              size="small"
                              sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ border: 0, color: brand.textSecondary }}>{order.date}</TableCell>
                          <TableCell align="right" sx={{ border: 0 }}>
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
            )}
          </Panel>
        </Grid>
      </Grid>
    </Box>
  )
}
