import { Link as RouterLink } from 'react-router-dom'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { mockCustomers } from '../../admin/mockData'
import { brand } from '../../theme'

export default function AdminCustomersPage() {
  const { t } = useTranslation()

  return (
    <>
      <AdminPageHeader title={t('admin.customers.title')} subtitle={t('admin.customers.subtitle')} />
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
                {t('admin.customers.table.name')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.customers.table.email')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.table.country')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.customers.table.orders')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.customers.table.totalSpent')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.customers.table.joined')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {t('admin.table.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockCustomers.map((customer) => (
              <TableRow key={customer.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: brand.plantGreenMuted, color: brand.plantGreenDark, fontSize: '0.9rem', fontWeight: 700 }}>
                      {customer.name.charAt(0)}
                    </Avatar>
                    <span style={{ fontWeight: 600 }}>{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell sx={{ color: brand.textSecondary }}>{customer.email}</TableCell>
                <TableCell>{t(`admin.countries.${customer.country}`)}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{customer.totalSpent}</TableCell>
                <TableCell sx={{ color: brand.textSecondary }}>{customer.joined}</TableCell>
                <TableCell align="right">
                  <IconButton
                    component={RouterLink}
                    to={`/admin/customers/${customer.id}`}
                    size="small"
                    aria-label={t('admin.customers.view')}
                    sx={{ color: brand.textSecondary }}
                  >
                    <VisibilityRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
