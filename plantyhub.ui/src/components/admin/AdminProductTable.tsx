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
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { useTranslation } from 'react-i18next'
import { brand } from '../../theme'
import MediaImg from '../MediaImg'

type ProductRow = {
  id: string
  name: string
  price: string
  compareAt?: string
  image: string
  extra?: string
  active?: boolean
  featured?: boolean
}

type Props = {
  rows: ProductRow[]
  onEdit?: (id: string) => void
  onHide?: (id: string) => void
  onRestore?: (id: string) => void
  emptyLabel?: string
}

const headerCellSx = {
  fontWeight: 700,
  color: brand.textSecondary,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: `1px solid ${brand.border}`,
} as const

export default function AdminProductTable({ rows, onEdit, onHide, onRestore, emptyLabel }: Props) {
  const { t } = useTranslation()

  return (
    <TableContainer
      sx={{
        bgcolor: brand.white,
        borderRadius: '18px',
        border: `1px solid ${brand.border}`,
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: brand.surface }}>
            <TableCell sx={headerCellSx}>{t('admin.table.product')}</TableCell>
            <TableCell sx={{ ...headerCellSx, display: { xs: 'none', md: 'table-cell' } }}>{t('admin.table.id')}</TableCell>
            <TableCell sx={headerCellSx}>{t('admin.table.price')}</TableCell>
            <TableCell sx={headerCellSx}>{t('admin.table.status')}</TableCell>
            <TableCell align="right" sx={headerCellSx}>{t('admin.table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} sx={{ color: brand.textSecondary, py: 4, border: 0 }}>
                {emptyLabel ?? t('admin.table.empty')}
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              onClick={() => onEdit?.(row.id)}
              sx={{ cursor: onEdit ? 'pointer' : 'default', '&:last-child td': { borderBottom: 0 } }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <MediaImg
                    src={row.image}
                    preset="thumb"
                    alt=""
                    sx={{ width: 52, height: 52, borderRadius: '12px', objectFit: 'cover', bgcolor: brand.surface, border: `1px solid ${brand.border}`, flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ fontWeight: 800, color: brand.graphite, fontSize: '0.95rem' }}>{row.name}</Box>
                      {row.featured && (
                        <Chip
                          label={t('admin.table.featured')}
                          size="small"
                          sx={{ height: 22, bgcolor: 'rgba(227, 159, 118, 0.18)', color: '#C47A4A', fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    {row.extra && (
                      <Box
                        sx={{
                          color: brand.textSecondary,
                          fontSize: '0.8rem',
                          mt: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: 180, sm: 360, md: 420 },
                        }}
                      >
                        {row.extra}
                      </Box>
                    )}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, color: brand.textSecondary, fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.25 }}>
                      {row.id}
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={{ color: brand.textSecondary, fontFamily: 'monospace', fontSize: '0.82rem', display: { xs: 'none', md: 'table-cell' } }}>{row.id}</TableCell>
              <TableCell>
                <Box sx={{ fontWeight: 800, color: brand.graphite, fontVariantNumeric: 'tabular-nums' }}>{row.price}</Box>
                {row.compareAt && (
                  <Box sx={{ color: brand.textSecondary, fontSize: '0.8rem', textDecoration: 'line-through' }}>{row.compareAt}</Box>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.active === false ? t('admin.table.hidden') : t('admin.table.active')}
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
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit?.(row.id)
                  }}
                  sx={{ color: brand.textSecondary, '&:hover': { color: brand.plantGreen, bgcolor: brand.plantGreenMuted } }}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
                {onHide && (
                  <IconButton
                    size="small"
                    aria-label={t('admin.table.hide')}
                    onClick={(event) => {
                      event.stopPropagation()
                      onHide(row.id)
                    }}
                    sx={{ color: brand.textSecondary, '&:hover': { color: '#C62828', bgcolor: 'rgba(198, 40, 40, 0.08)' } }}
                  >
                    <VisibilityOffRounded fontSize="small" />
                  </IconButton>
                )}
                {onRestore && (
                  <IconButton
                    size="small"
                    aria-label={t('admin.table.restore')}
                    onClick={(event) => {
                      event.stopPropagation()
                      onRestore(row.id)
                    }}
                    sx={{ color: brand.textSecondary, '&:hover': { color: brand.plantGreen, bgcolor: brand.plantGreenMuted } }}
                  >
                    <VisibilityRounded fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
