import { useMemo, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { useTranslation } from 'react-i18next'
import { isCustomerFirstOrder } from '../../admin/orderDetails'
import type { AdminOrder, OrderStatus } from '../../admin/mockData'
import { orderStatusColors, orderStatusOrder } from '../../admin/orderStatus'
import { downloadOrderSheet } from '../../admin/orderSheet'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { ordersApi } from '../../api'
import { ApiError } from '../../api/client'
import { useOrders, useOrdersStore } from '../../hooks/useOrders'
import { brand } from '../../theme'
import { countryDisplayName } from '../../utils/country'

const sortKeys = ['date', 'id', 'customer', 'country', 'items', 'total', 'status', 'courier'] as const
type SortKey = (typeof sortKeys)[number]
type SortDir = 'asc' | 'desc'
type StatusFilter = 'all' | OrderStatus

const headCell = {
  fontWeight: 700,
  color: brand.textSecondary,
  fontSize: '0.75rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
} as const

function isStatus(value: string | null): value is OrderStatus {
  return orderStatusOrder.includes(value as OrderStatus)
}

function isSortKey(value: string | null): value is SortKey {
  return sortKeys.includes(value as SortKey)
}

function parseMoney(value: string) {
  const normalized = value.replace(/\s/g, '').replace(/[^\d,.-]/g, '')
  const lastComma = normalized.lastIndexOf(',')
  const lastDot = normalized.lastIndexOf('.')
  const cleaned = lastComma > lastDot
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized.replace(/,/g, '')
  const amount = Number.parseFloat(cleaned)
  return Number.isFinite(amount) ? amount : 0
}

function formatOrderDate(value: string, language: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function defaultDir(key: SortKey): SortDir {
  return key === 'customer' || key === 'country' || key === 'status' || key === 'courier' ? 'asc' : 'desc'
}

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const orders = useOrders()
  const { loading, error } = useOrdersStore()
  const [params, setParams] = useSearchParams()
  const [sheetBusy, setSheetBusy] = useState<string | null>(null)
  const [sheetError, setSheetError] = useState<string | null>(null)

  const downloadSheet = async (id: string) => {
    setSheetBusy(id)
    setSheetError(null)
    try {
      const detail = await ordersApi.getAdminById(id)
      await downloadOrderSheet(detail, t, i18n.language, { firstOrder: isCustomerFirstOrder(orders, detail) })
    } catch (err) {
      setSheetError(err instanceof ApiError ? err.message : t('admin.orderDetail.downloadSheetFailed'))
    } finally {
      setSheetBusy(null)
    }
  }

  const firstOrderIds = useMemo(() => {
    const ids = new Set<string>()
    const seen = new Set<string>()
    for (const order of orders) {
      const email = order.email.trim().toLowerCase()
      if (seen.has(email)) continue
      if (isCustomerFirstOrder(orders, order)) {
        ids.add(order.id)
        seen.add(email)
      }
    }
    return ids
  }, [orders])

  const query = params.get('q') ?? ''
  const status: StatusFilter = isStatus(params.get('status')) ? (params.get('status') as OrderStatus) : 'all'
  const country = params.get('country') ?? 'all'
  const courier = params.get('courier') ?? 'all'
  const sort: SortKey = isSortKey(params.get('sort')) ? (params.get('sort') as SortKey) : 'date'
  const dir: SortDir = params.get('dir') === 'asc' ? 'asc' : 'desc'

  const patch = (next: Partial<{ q: string; status: StatusFilter; country: string; courier: string; sort: SortKey; dir: SortDir }>) => {
    const merged = { q: query, status, country, courier, sort, dir, ...next }
    const updated = new URLSearchParams(params)
    const write = (key: string, value: string, fallback: string) => {
      if (!value || value === fallback) updated.delete(key)
      else updated.set(key, value)
    }
    write('q', merged.q.trim() ? merged.q : '', '')
    write('status', merged.status, 'all')
    write('country', merged.country, 'all')
    write('courier', merged.courier, 'all')
    write('sort', merged.sort, 'date')
    write('dir', merged.dir, 'desc')
    setParams(updated, { replace: true })
  }

  const countryLabel = (code: string) =>
    t(`admin.countries.${code}`, { defaultValue: countryDisplayName(code, i18n.language) })

  const courierLabel = (id: string) => t(`admin.orderDetail.couriers.${id}`, { defaultValue: id })

  const countries = useMemo(() => {
    const codes = [...new Set(orders.map((order) => order.country).filter(Boolean))]
    return codes.sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), i18n.language))
  }, [orders, i18n.language, t])

  const couriers = useMemo(() => {
    const ids = [...new Set(orders.map((order) => order.courier).filter((id): id is string => Boolean(id)))]
    return ids.sort((a, b) => courierLabel(a).localeCompare(courierLabel(b), i18n.language))
  }, [orders, i18n.language, t])

  const hasUnassigned = orders.some((order) => !order.courier)
  const filtersActive = Boolean(query.trim()) || status !== 'all' || country !== 'all' || courier !== 'all'

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((order) => {
      if (country !== 'all' && order.country !== country) return false
      if (courier === 'none' && order.courier) return false
      if (courier !== 'all' && courier !== 'none' && order.courier !== courier) return false
      if (!q) return true
      const haystack = [
        order.id,
        order.customer,
        order.email,
        order.waybillNumber,
        order.country,
        countryLabel(order.country),
        order.courier ? courierLabel(order.courier) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [orders, query, country, courier, i18n.language, t])

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(orderStatusOrder.map((item) => [item, 0])) as Record<OrderStatus, number>
    for (const order of searched) byStatus[order.status] += 1
    return byStatus
  }, [searched])

  const visible = useMemo(() => {
    const rows = status === 'all' ? searched : searched.filter((order) => order.status === status)
    const factor = dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compareOrders(a, b, sort, i18n.language, countryLabel, courierLabel) || b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [searched, status, sort, dir, i18n.language])

  const openOrder = (id: string) => {
    navigate(`/admin/orders/${id}`, { state: { ordersSearch: location.search } })
  }

  const toggleSort = (key: SortKey) => {
    if (sort === key) patch({ dir: dir === 'asc' ? 'desc' : 'asc' })
    else patch({ sort: key, dir: defaultDir(key) })
  }

  return (
    <>
      <AdminPageHeader title={t('admin.orders.title')} subtitle={t('admin.orders.subtitle')} />

      {error ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.88rem', fontWeight: 600, mb: 2 }}>{error}</Typography>
      ) : null}
      {sheetError ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.88rem', fontWeight: 600, mb: 2 }}>{sheetError}</Typography>
      ) : null}

      <Box
        sx={{
          bgcolor: brand.white,
          borderRadius: '20px',
          border: `1px solid ${brand.border}`,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.25,
            p: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${brand.border}`,
          }}
        >
          <TextField
            size="small"
            value={query}
            onChange={(event) => patch({ q: event.target.value })}
            placeholder={t('admin.orders.search')}
            aria-label={t('admin.orders.search')}
            sx={{ flex: { xs: '1 1 100%', xl: '1 1 280px' }, minWidth: { xl: 240 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: brand.textSecondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            label={t('admin.orders.filters.country')}
            value={countries.includes(country) || country === 'all' ? country : 'all'}
            onChange={(event) => patch({ country: event.target.value })}
            sx={{ flex: '1 1 160px', minWidth: 150 }}
          >
            <MenuItem value="all">{t('admin.orders.filters.allCountries')}</MenuItem>
            {countries.map((code) => (
              <MenuItem key={code} value={code}>{countryLabel(code)}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={t('admin.orders.filters.courier')}
            value={courier}
            onChange={(event) => patch({ courier: event.target.value })}
            sx={{ flex: '1 1 160px', minWidth: 150 }}
          >
            <MenuItem value="all">{t('admin.orders.filters.allCouriers')}</MenuItem>
            {hasUnassigned ? <MenuItem value="none">{t('admin.orders.filters.noCourier')}</MenuItem> : null}
            {couriers.map((id) => (
              <MenuItem key={id} value={id}>{courierLabel(id)}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={t('admin.orders.sortBy')}
            value={sort}
            onChange={(event) => {
              const key = event.target.value as SortKey
              patch({ sort: key, dir: sort === key ? dir : defaultDir(key) })
            }}
            sx={{ flex: '1 1 150px', minWidth: 140 }}
          >
            {sortKeys.map((key) => (
              <MenuItem key={key} value={key}>{t(`admin.orders.sort.${key}`)}</MenuItem>
            ))}
          </TextField>
          <Tooltip title={dir === 'asc' ? t('admin.orders.sortAsc') : t('admin.orders.sortDesc')}>
            <IconButton
              onClick={() => patch({ dir: dir === 'asc' ? 'desc' : 'asc' })}
              aria-label={dir === 'asc' ? t('admin.orders.sortAsc') : t('admin.orders.sortDesc')}
              sx={{
                width: 40,
                height: 40,
                border: `1px solid ${brand.border}`,
                borderRadius: '12px',
                color: brand.graphite,
                bgcolor: brand.surface,
              }}
            >
              {dir === 'asc' ? <ArrowUpwardRounded fontSize="small" /> : <ArrowDownwardRounded fontSize="small" />}
            </IconButton>
          </Tooltip>
          {filtersActive ? (
            <Tooltip title={t('admin.orders.clear')}>
              <IconButton
                onClick={() => patch({ q: '', status: 'all', country: 'all', courier: 'all' })}
                aria-label={t('admin.orders.clear')}
                sx={{
                  width: 40,
                  height: 40,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '12px',
                  color: brand.textSecondary,
                }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
            borderBottom: `1px solid ${brand.border}`,
            bgcolor: brand.surface,
          }}
        >
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', flex: '1 1 280px' }}>
            <StatusChip
              label={t('admin.orders.allStatuses')}
              count={searched.length}
              selected={status === 'all'}
              onClick={() => patch({ status: 'all' })}
            />
            {orderStatusOrder.map((item) => (
              <StatusChip
                key={item}
                label={t(`admin.orders.status.${item}`)}
                count={counts[item]}
                selected={status === item}
                colors={orderStatusColors[item]}
                onClick={() => patch({ status: item })}
              />
            ))}
          </Stack>
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', ml: 'auto', pt: 0.7 }}>
            {t('admin.orders.showing', { shown: visible.length, total: orders.length })}
          </Typography>
        </Stack>

        {loading && orders.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} sx={{ color: brand.plantGreen }} />
          </Box>
        ) : visible.length === 0 ? (
          <Typography sx={{ px: 2.25, py: 4, color: brand.textSecondary, fontSize: '0.92rem' }}>
            {orders.length === 0 ? t('admin.orders.emptyAll') : t('admin.orders.empty')}
          </Typography>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: brand.white }}>
                  <SortHeader label={t('admin.orders.table.id')} column="id" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.orders.table.customer')} column="customer" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.orders.table.status')} column="status" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.orders.table.total')} column="total" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.orders.table.date')} column="date" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.table.country')} column="country" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.orders.table.items')} column="items" sort={sort} dir={dir} onSort={toggleSort} />
                  <SortHeader label={t('admin.orderDetail.courier')} column="courier" sort={sort} dir={dir} onSort={toggleSort} />
                  <TableCell align="right" sx={headCell}>{t('admin.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((order) => {
                  const colors = orderStatusColors[order.status]
                  return (
                    <TableRow
                      key={order.id}
                      hover
                      onClick={() => openOrder(order.id)}
                      sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Box sx={{ fontFamily: 'monospace', fontWeight: 800, color: brand.graphite }}>{order.id}</Box>
                        {firstOrderIds.has(order.id) ? (
                          <Chip
                            size="small"
                            icon={<StarRounded sx={{ fontSize: '0.95rem !important', color: '#8A5A00 !important' }} />}
                            label={t('admin.orderDetail.firstOrder')}
                            sx={{ mt: 0.6, height: 24, bgcolor: '#FFF1CC', color: '#8A5A00', fontWeight: 800, border: '1px solid #E2B34A' }}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ fontWeight: 700, color: brand.graphite }}>{order.customer}</Box>
                        <Box sx={{ fontSize: '0.8rem', color: brand.textSecondary }}>{order.email}</Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t(`admin.orders.status.${order.status}`)}
                          sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{order.total}</TableCell>
                      <TableCell sx={{ color: brand.textSecondary, whiteSpace: 'nowrap' }}>
                        {formatOrderDate(order.date, i18n.language)}
                      </TableCell>
                      <TableCell>{countryLabel(order.country)}</TableCell>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{order.items}</TableCell>
                      <TableCell>
                        {order.courier ? (
                          <Box>
                            <Box sx={{ fontWeight: 700, color: brand.graphite, fontSize: '0.88rem' }}>{courierLabel(order.courier)}</Box>
                            {order.waybillNumber ? (
                              <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: brand.textSecondary }}>{order.waybillNumber}</Box>
                            ) : null}
                          </Box>
                        ) : (
                          <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('admin.orders.downloadSheet')}>
                          <IconButton
                            size="small"
                            aria-label={t('admin.orders.downloadSheet')}
                            disabled={sheetBusy === order.id}
                            onClick={(event) => {
                              event.stopPropagation()
                              void downloadSheet(order.id)
                            }}
                            sx={{ color: brand.textSecondary, width: 36, height: 36 }}
                          >
                            {sheetBusy === order.id ? (
                              <CircularProgress size={16} sx={{ color: brand.plantGreen }} />
                            ) : (
                              <FileDownloadRounded fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          component={RouterLink}
                          to={`/admin/orders/${order.id}`}
                          state={{ ordersSearch: location.search }}
                          size="small"
                          aria-label={t('admin.orders.view')}
                          onClick={(event) => event.stopPropagation()}
                          sx={{ color: brand.textSecondary, width: 36, height: 36 }}
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
      </Box>
    </>
  )
}

function compareOrders(
  a: AdminOrder,
  b: AdminOrder,
  key: SortKey,
  language: string,
  countryLabel: (code: string) => string,
  courierLabel: (id: string) => string,
) {
  switch (key) {
    case 'id':
      return a.id.localeCompare(b.id)
    case 'customer':
      return a.customer.localeCompare(b.customer, language)
    case 'country':
      return countryLabel(a.country).localeCompare(countryLabel(b.country), language)
    case 'items':
      return a.items - b.items
    case 'total':
      return parseMoney(a.total) - parseMoney(b.total)
    case 'status':
      return orderStatusOrder.indexOf(a.status) - orderStatusOrder.indexOf(b.status)
    case 'courier':
      return (a.courier ? courierLabel(a.courier) : '').localeCompare(b.courier ? courierLabel(b.courier) : '', language)
    case 'date':
      return a.date.localeCompare(b.date)
  }
}

function SortHeader({
  label,
  column,
  sort,
  dir,
  onSort,
}: {
  label: string
  column: SortKey
  sort: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  return (
    <TableCell sortDirection={sort === column ? dir : false} sx={headCell}>
      <TableSortLabel
        active={sort === column}
        direction={sort === column ? dir : 'asc'}
        onClick={() => onSort(column)}
        sx={{
          color: `${brand.textSecondary} !important`,
          '&.Mui-active': { color: `${brand.graphite} !important` },
          '& .MuiTableSortLabel-icon': { color: `${brand.plantGreen} !important` },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )
}

function StatusChip({
  label,
  count,
  selected,
  colors,
  onClick,
}: {
  label: string
  count: number
  selected: boolean
  colors?: { bg: string; color: string }
  onClick: () => void
}) {
  const tone = colors ?? { bg: brand.graphite, color: brand.white }
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        border: 0,
        cursor: 'pointer',
        borderRadius: '999px',
        px: 1.25,
        py: 0.6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontWeight: 700,
        fontSize: '0.8rem',
        fontFamily: 'inherit',
        color: selected ? tone.color : brand.textSecondary,
        bgcolor: selected ? tone.bg : brand.white,
        boxShadow: selected ? `inset 0 0 0 1.5px ${tone.color}` : `inset 0 0 0 1px ${brand.border}`,
        opacity: count === 0 && !selected ? 0.45 : 1,
        '&:hover': {
          bgcolor: selected ? tone.bg : (colors?.bg ?? brand.beigeDark),
          color: selected ? tone.color : (colors?.color ?? brand.graphite),
        },
        '&:focus-visible': { outline: `2px solid ${brand.plantGreen}`, outlineOffset: 2 },
      }}
    >
      {label}
      <Box
        component="span"
        sx={{
          minWidth: 18,
          px: 0.55,
          borderRadius: '999px',
          fontSize: '0.7rem',
          fontWeight: 800,
          lineHeight: '18px',
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
          bgcolor: selected ? brand.white : brand.beige,
          color: selected ? (colors?.color ?? brand.graphite) : 'inherit',
        }}
      >
        {count}
      </Box>
    </Box>
  )
}
