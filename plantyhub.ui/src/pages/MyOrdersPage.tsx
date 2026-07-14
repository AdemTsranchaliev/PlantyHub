import { useEffect } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
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
import SectionContainer from '../components/SectionContainer'
import { navHrefs } from '../data/catalog'
import { useCustomerAuth } from '../hooks/useCustomerAuth'
import { loadMyOrders } from '../store/orders'
import { getCustomerToken } from '../auth/session'
import { useMyOrders, useMyOrdersBootstrap, useOrdersStore } from '../hooks/useOrders'
import { brand } from '../theme'

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(227, 159, 118, 0.15)', color: '#C47A4A' },
  processing: { bg: 'rgba(47, 125, 83, 0.12)', color: brand.plantGreenDark },
  shipped: { bg: 'rgba(76, 163, 116, 0.15)', color: brand.plantGreen },
  delivered: { bg: brand.plantGreenMuted, color: brand.plantGreenDark },
  cancelled: { bg: 'rgba(28, 35, 30, 0.08)', color: brand.textSecondary },
}

export default function MyOrdersPage() {
  const { t } = useTranslation()
  const { customer } = useCustomerAuth()
  const orders = useMyOrders()
  const { loading, error } = useOrdersStore()

  useMyOrdersBootstrap()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (!getCustomerToken()) {
    return <Navigate to={navHrefs.login} replace state={{ from: '/account/orders' }} />
  }

  return (
    <SectionContainer py={{ xs: 4, md: 6 }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography component="h1" variant="h3" sx={{ color: brand.graphite, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
          {t('account.title')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: '1rem' }}>
          {t('account.subtitle', { name: customer?.name ?? customer?.email })}
        </Typography>
      </Stack>

      {loading && orders.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: brand.plantGreen }} />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: 'error.main', mb: 2 }}>{error}</Typography>
          <Button variant="contained" onClick={() => void loadMyOrders()}>
            {t('account.retry')}
          </Button>
        </Box>
      ) : orders.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            bgcolor: brand.surface,
            borderRadius: '24px',
            border: `1px solid ${brand.border}`,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 1 }}>{t('account.emptyTitle')}</Typography>
          <Typography sx={{ color: brand.textSecondary, mb: 3 }}>{t('account.emptySubtitle')}</Typography>
          <Button variant="contained" component={RouterLink} to={navHrefs.pods}>
            {t('account.startShopping')}
          </Button>
        </Box>
      ) : (
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
                  {t('account.table.id')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {t('account.table.items')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {t('account.table.total')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {t('account.table.status')}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {t('account.table.date')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {t('account.table.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const colors = statusColors[order.status]
                return (
                  <TableRow key={order.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: brand.graphite }}>{order.id}</TableCell>
                    <TableCell>{order.items}</TableCell>
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
                      <IconButton
                        component={RouterLink}
                        to={`/order/${order.id}`}
                        size="small"
                        aria-label={t('account.viewOrder')}
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
    </SectionContainer>
  )
}
