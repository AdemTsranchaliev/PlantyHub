import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminFieldGroup from '../../components/admin/AdminFieldGroup'
import { reportsApi } from '../../api'
import type { AccountingReportKind } from '../../api'
import type { AccountingReportPreview } from '../../api/types'
import { brand } from '../../theme'
import { formatEuro } from '../../utils/price'

type Preset = 'thisMonth' | 'lastMonth' | 'quarter' | 'year'

function isoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function rangeFor(preset: Preset, now = new Date()) {
  const y = now.getFullYear()
  const m = now.getMonth()
  if (preset === 'thisMonth') {
    return { from: isoDate(new Date(y, m, 1)), to: isoDate(new Date(y, m + 1, 0)) }
  }
  if (preset === 'lastMonth') {
    return { from: isoDate(new Date(y, m - 1, 1)), to: isoDate(new Date(y, m, 0)) }
  }
  if (preset === 'quarter') {
    const q = Math.floor(m / 3) * 3
    return { from: isoDate(new Date(y, q, 1)), to: isoDate(new Date(y, q + 3, 0)) }
  }
  return { from: isoDate(new Date(y, 0, 1)), to: isoDate(new Date(y, 11, 31)) }
}

export default function AdminReportsPage() {
  const { t } = useTranslation()
  const initial = rangeFor('thisMonth')
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [preset, setPreset] = useState<Preset | 'custom'>('thisMonth')
  const [includeCancelled, setIncludeCancelled] = useState(false)
  const [preview, setPreview] = useState<AccountingReportPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<AccountingReportKind | null>(null)
  const [error, setError] = useState<string | null>(null)

  const applyPreset = (next: Preset) => {
    const range = rangeFor(next)
    setPreset(next)
    setFrom(range.from)
    setTo(range.to)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void reportsApi
      .preview(from, to, includeCancelled)
      .then((data) => {
        if (!cancelled) setPreview(data)
      })
      .catch(() => {
        if (!cancelled) setError(t('admin.reports.loadFailed'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from, to, includeCancelled, t])

  const download = async (kind: AccountingReportKind) => {
    setDownloading(kind)
    setError(null)
    try {
      await reportsApi.download(kind, from, to, includeCancelled)
    } catch {
      setError(t('admin.reports.downloadFailed'))
    } finally {
      setDownloading(null)
    }
  }

  const presets = useMemo(
    () =>
      ([
        ['thisMonth', t('admin.reports.thisMonth')],
        ['lastMonth', t('admin.reports.lastMonth')],
        ['quarter', t('admin.reports.quarter')],
        ['year', t('admin.reports.year')],
      ] as const),
    [t],
  )

  return (
    <>
      <AdminPageHeader
        title={t('admin.reports.title')}
        subtitle={t('admin.reports.subtitle')}
        action={
          <Button variant="contained" onClick={() => void download('pack')} disabled={downloading !== null}>
            {downloading === 'pack' ? t('admin.reports.downloading') : t('admin.reports.downloadPack')}
          </Button>
        }
      />

      {error ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.88rem', fontWeight: 600, mb: 2 }}>{error}</Typography>
      ) : null}

      <Stack spacing={2.5}>
        <AdminFieldGroup title={t('admin.reports.period')} hint={t('admin.reports.periodHint')}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {presets.map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                onClick={() => applyPreset(key)}
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  bgcolor: preset === key ? brand.plantGreenMuted : brand.surface,
                  color: preset === key ? brand.plantGreenDark : brand.textSecondary,
                }}
              />
            ))}
          </Stack>
          <Grid container spacing={1.75}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="date"
                label={t('admin.reports.from')}
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setPreset('custom')
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="date"
                label={t('admin.reports.to')}
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setPreset('custom')
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Switch checked={includeCancelled} onChange={(e) => setIncludeCancelled(e.target.checked)} />
            }
            label={t('admin.reports.includeCancelled')}
          />
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.reports.summary')} hint={t('admin.reports.summaryHint')}>
          {preview?.vatNumber ? (
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: brand.graphite }}>
              {t('admin.reports.vatNumber')}: {preview.vatNumber}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>{t('admin.reports.noVatNumber')}</Typography>
          )}
          <Grid container spacing={1.5}>
            <Stat label={t('admin.reports.orders')} value={loading ? '…' : String(preview?.orderCount ?? 0)} />
            <Stat label={t('admin.reports.net')} value={loading ? '…' : formatEuro(preview?.net ?? 0)} />
            <Stat label={t('admin.reports.vatAmount')} value={loading ? '…' : formatEuro(preview?.vat ?? 0)} />
            <Stat label={t('admin.reports.gross')} value={loading ? '…' : formatEuro(preview?.gross ?? 0)} />
          </Grid>
          {!includeCancelled && (preview?.cancelledExcluded ?? 0) > 0 ? (
            <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>
              {t('admin.reports.cancelledNote', { count: preview?.cancelledExcluded ?? 0 })}
            </Typography>
          ) : null}
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.reports.byCountry')} hint={t('admin.reports.byCountryHint')}>
          {!preview || preview.byCountry.length === 0 ? (
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem' }}>{t('admin.reports.empty')}</Typography>
          ) : (
            <Box sx={{ overflow: 'auto', border: `1px solid ${brand.border}`, borderRadius: '12px' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin.reports.colCountry')}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin.reports.colRate')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {t('admin.reports.colOrders')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {t('admin.reports.net')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {t('admin.reports.vatAmount')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {t('admin.reports.gross')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.byCountry.map((row) => (
                    <TableRow key={`${row.country}-${row.ratePercent}`}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.countryName} ({row.country})
                      </TableCell>
                      <TableCell>{row.ratePercent}%</TableCell>
                      <TableCell align="right">{row.orders}</TableCell>
                      <TableCell align="right">{formatEuro(row.net)}</TableCell>
                      <TableCell align="right">{formatEuro(row.vat)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatEuro(row.gross)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.reports.files')} hint={t('admin.reports.filesHint')}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="outlined" onClick={() => void download('sales')} disabled={downloading !== null}>
              {t('admin.reports.downloadSales')}
            </Button>
            <Button variant="outlined" onClick={() => void download('vat')} disabled={downloading !== null}>
              {t('admin.reports.downloadVat')}
            </Button>
            <Button variant="outlined" onClick={() => void download('items')} disabled={downloading !== null}>
              {t('admin.reports.downloadItems')}
            </Button>
          </Stack>
        </AdminFieldGroup>
      </Stack>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: brand.surface, border: `1px solid ${brand.border}` }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: brand.textSecondary, mb: 0.35 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 800, color: brand.graphite }}>{value}</Typography>
      </Box>
    </Grid>
  )
}
