import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import EditRounded from '@mui/icons-material/EditRounded'
import { useTranslation } from 'react-i18next'
import { brand } from '../../theme'

type ProductRow = {
  id: string
  name: string
  price: string
  compareAt?: string
  image: string
  extra?: string
  active?: boolean
}

type Props = {
  rows: ProductRow[]
  onEdit?: (id: string) => void
}

export default function AdminProductTable({ rows, onEdit }: Props) {
  const { t } = useTranslation()

  return (
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
            <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('admin.table.product')}
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('admin.table.id')}
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('admin.table.price')}
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('admin.table.status')}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('admin.table.actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={row.image}
                    alt={row.name}
                    sx={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover', bgcolor: brand.surface, border: `1px solid ${brand.border}` }}
                  />
                  <Box>
                    <Box sx={{ fontWeight: 700, color: brand.graphite, fontSize: '0.95rem' }}>{row.name}</Box>
                    {row.extra && (
                      <Box sx={{ color: brand.textSecondary, fontSize: '0.82rem', mt: 0.25 }}>{row.extra}</Box>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={{ color: brand.textSecondary, fontFamily: 'monospace', fontSize: '0.85rem' }}>{row.id}</TableCell>
              <TableCell>
                <Box sx={{ fontWeight: 700, color: brand.graphite }}>{row.price}</Box>
                {row.compareAt && (
                  <Box sx={{ color: brand.textSecondary, fontSize: '0.82rem', textDecoration: 'line-through' }}>{row.compareAt}</Box>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.active === false ? t('admin.table.inactive') : t('admin.table.active')}
                  size="small"
                  sx={{
                    bgcolor: row.active === false ? 'rgba(28, 35, 30, 0.08)' : brand.plantGreenMuted,
                    color: row.active === false ? brand.textSecondary : brand.plantGreenDark,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  aria-label={t('admin.table.edit')}
                  onClick={() => onEdit?.(row.id)}
                  sx={{ color: brand.textSecondary, '&:hover': { color: brand.plantGreen } }}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
