import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LocalOfferRounded from '@mui/icons-material/LocalOfferRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ConfirmationNumberRounded from '@mui/icons-material/ConfirmationNumberRounded'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminFieldGroup from '../../components/admin/AdminFieldGroup'
import AdminStatCard from '../../components/admin/AdminStatCard'
import { promoApi, type PromoCode } from '../../api'
import { ApiError } from '../../api/client'
import { brand } from '../../theme'
import { formatEuro } from '../../utils/price'

const emptyForm = {
  code: '',
  type: 'percent' as 'percent' | 'fixed',
  amount: '10',
  minSubtotal: '',
  usageLimit: '',
  startsAt: '',
  endsAt: '',
  openEnded: true,
  active: true,
}

function formatDay(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return date.toLocaleDateString('bg-BG', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminPromoCodesPage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<PromoCode[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const load = () => {
    void promoApi.list().then(setRows).catch(() => setRows([]))
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    setError('')
    if (!form.openEnded && form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
      setError(t('admin.promoCodes.range'))
      return
    }
    try {
      await promoApi.create({
        code: form.code,
        type: form.type,
        amount: Number(form.amount) || 0,
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.openEnded ? null : form.endsAt || null,
        active: form.active,
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      const code = err instanceof ApiError ? err.message : ''
      setError(
        code === 'exists' || code === 'required' || code === 'used'
          ? t(`admin.promoCodes.${code}`)
          : t('admin.promoCodes.saveFailed'),
      )
    }
  }

  const toggle = async (row: PromoCode) => {
    await promoApi.update(row.id, {
      code: row.code,
      type: row.type,
      amount: row.amount,
      minSubtotal: row.minSubtotal ?? null,
      usageLimit: row.usageLimit ?? null,
      startsAt: row.startsAt ?? null,
      expiresAt: row.expiresAt ?? null,
      active: !row.active,
    })
    load()
  }

  const remove = async (row: PromoCode) => {
    if (row.usedCount > 0) {
      setError(t('admin.promoCodes.used'))
      return
    }
    setError('')
    try {
      await promoApi.remove(row.id)
      load()
    } catch (err) {
      const code = err instanceof ApiError ? err.message : ''
      setError(code === 'used' ? t('admin.promoCodes.used') : t('admin.promoCodes.saveFailed'))
    }
  }

  const activeCount = rows.filter((row) => row.active).length
  const useCount = rows.reduce((sum, row) => sum + row.usedCount, 0)

  return (
    <>
      <AdminPageHeader title={t('admin.promoCodes.title')} subtitle={t('admin.promoCodes.subtitle')} />
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard label={t('admin.promoCodes.statsCodes')} value={rows.length} icon={<LocalOfferRounded />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard label={t('admin.promoCodes.statsActive')} value={activeCount} icon={<CheckCircleRounded />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard label={t('admin.promoCodes.statsUses')} value={useCount} icon={<ConfirmationNumberRounded />} />
        </Grid>
      </Grid>

      <AdminFieldGroup title={t('admin.promoCodes.add')}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label={t('admin.promoCodes.code')} value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <TextField select fullWidth label={t('admin.promoCodes.type')} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}>
              <MenuItem value="percent">{t('admin.promoCodes.percent')}</MenuItem>
              <MenuItem value="fixed">{t('admin.promoCodes.fixed')}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <TextField fullWidth label={t('admin.promoCodes.amount')} type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label={t('admin.promoCodes.from')} type="date" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label={t('admin.promoCodes.until')} type="date" value={form.endsAt} disabled={form.openEnded} onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={form.openEnded} onChange={(e) => setForm((p) => ({ ...p, openEnded: e.target.checked, endsAt: e.target.checked ? '' : p.endsAt }))} />}
              label={
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{t('admin.promoCodes.openEnded')}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: brand.textSecondary }}>{t('admin.promoCodes.openEndedHint')}</Typography>
                </Box>
              }
            />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <TextField fullWidth label={t('admin.promoCodes.minSubtotal')} type="number" value={form.minSubtotal} onChange={(e) => setForm((p) => ({ ...p, minSubtotal: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <TextField fullWidth label={t('admin.promoCodes.usageLimit')} type="number" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />} label={t('admin.promoCodes.active')} />
          </Grid>
        </Grid>
        {error && <Typography sx={{ color: 'error.main', fontSize: '0.85rem' }}>{error}</Typography>}
        <Button variant="contained" onClick={() => void create()} sx={{ alignSelf: 'flex-start' }}>{t('admin.promoCodes.create')}</Button>
      </AdminFieldGroup>

      <Stack spacing={1.25} sx={{ mt: 2.5 }}>
        {rows.length === 0 && (
          <Box sx={{ p: 3, borderRadius: '18px', border: `1px solid ${brand.border}`, bgcolor: brand.white }}>
            <Typography sx={{ color: brand.textSecondary }}>{t('admin.promoCodes.empty')}</Typography>
          </Box>
        )}
        {rows.map((row) => {
          const used = row.usedCount > 0
          const windowLabel = `${row.startsAt ? formatDay(row.startsAt) : t('admin.promoCodes.fromNow')} · ${row.expiresAt ? formatDay(row.expiresAt) : t('admin.promoCodes.untilStopped')}`
          return (
            <Box key={row.id} sx={{ p: { xs: 1.75, sm: 2 }, borderRadius: '18px', border: `1px solid ${brand.border}`, bgcolor: brand.white }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 800, letterSpacing: '0.04em' }}>{row.code}</Typography>
                    <Chip size="small" label={row.type === 'fixed' ? `€${row.amount}` : `${row.amount}%`} sx={{ fontWeight: 700, bgcolor: brand.surface }} />
                    <Chip
                      size="small"
                      label={row.active ? t('admin.promoCodes.active') : t('admin.promoCodes.inactive')}
                      sx={{ fontWeight: 700, bgcolor: row.active ? brand.plantGreenMuted : brand.surface, color: row.active ? brand.plantGreenDark : brand.textSecondary }}
                    />
                  </Stack>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem', mt: 0.5 }}>{windowLabel}</Typography>
                </Box>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ textAlign: { sm: 'right' }, minWidth: 110 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: brand.graphite }}>
                      {row.usageLimit ? t('admin.promoCodes.timesOf', { count: row.usedCount, limit: row.usageLimit }) : t('admin.promoCodes.times', { count: row.usedCount })}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: brand.textSecondary }}>{used ? t('admin.promoCodes.uses') : t('admin.promoCodes.noUses')}</Typography>
                  </Box>
                  <Button size="small" onClick={() => void toggle(row)}>{row.active ? t('admin.promoCodes.deactivate') : t('admin.promoCodes.activate')}</Button>
                  {used ? (
                    <Button size="small" disabled>{t('admin.promoCodes.keep')}</Button>
                  ) : (
                    <Button size="small" color="inherit" onClick={() => void remove(row)}>{t('admin.promoCodes.delete')}</Button>
                  )}
                </Stack>
              </Stack>
              {used && (
                <Box sx={{ mt: 1 }}>
                  <Button size="small" onClick={() => setOpenId((id) => (id === row.id ? null : row.id))} sx={{ px: 0 }}>
                    {t('admin.promoCodes.orders')}
                  </Button>
                  <Collapse in={openId === row.id}>
                    <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                      {(row.uses ?? []).map((use) => (
                        <Stack key={use.orderId} direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Link component={RouterLink} to={`/admin/orders/${use.orderId}`} underline="hover" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {use.orderId}
                          </Link>
                          <Typography sx={{ flex: 1, fontSize: '0.85rem', color: brand.textSecondary }}>{use.customerName}</Typography>
                          <Typography sx={{ fontSize: '0.85rem' }}>−{formatEuro(use.discount)}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: brand.textSecondary }}>{formatDay(use.createdAt)}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Collapse>
                </Box>
              )}
            </Box>
          )
        })}
      </Stack>
    </>
  )
}
