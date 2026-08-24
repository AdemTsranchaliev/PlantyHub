import { useEffect, useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
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
import { storeApi } from '../../api'
import type { StoreVatRate, StoreVatSettings } from '../../api/types'
import { brand } from '../../theme'
import { countryDisplayName } from '../../utils/country'
import { formatEuro } from '../../utils/price'

const SAMPLE_AMOUNT = 100

function preview(applies: boolean, includeVat: boolean, rate: number) {
  if (!applies || rate <= 0) {
    return { rate: 0, tax: 0, total: SAMPLE_AMOUNT, net: SAMPLE_AMOUNT }
  }
  if (includeVat) {
    const tax = Math.round((SAMPLE_AMOUNT * rate) / (100 + rate) * 100) / 100
    return { rate, tax, total: SAMPLE_AMOUNT, net: Math.round((SAMPLE_AMOUNT - tax) * 100) / 100 }
  }
  const tax = Math.round((SAMPLE_AMOUNT * rate) / 100 * 100) / 100
  return { rate, tax, total: Math.round((SAMPLE_AMOUNT + tax) * 100) / 100, net: SAMPLE_AMOUNT }
}

export default function AdminVatPage() {
  const { t, i18n } = useTranslation()
  const [vat, setVat] = useState<StoreVatSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewCountry, setPreviewCountry] = useState('BG')
  const [rateQuery, setRateQuery] = useState('')

  useEffect(() => {
    void storeApi
      .get()
      .then(setVat)
      .catch(() => setError(t('admin.vat.loadFailed')))
  }, [t])

  const patch = (next: Partial<StoreVatSettings>) => {
    setVat((prev) => (prev ? { ...prev, ...next } : prev))
    setSaved(false)
  }

  const save = async () => {
    if (!vat) return
    setSaving(true)
    setError(null)
    try {
      const savedSettings = await storeApi.update({
        enabled: vat.enabled,
        pricesIncludeVat: vat.pricesIncludeVat,
        vatNumber: vat.vatNumber,
      })
      setVat(savedSettings)
      setSaved(true)
    } catch {
      setError(t('admin.vat.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const rates = vat?.rates ?? []
  const homeCountry = (vat?.homeCountry || 'BG').toUpperCase()
  const previewRate = rates.find((r) => r.country === previewCountry)?.ratePercent ?? 0
  const vatApplies = previewCountry === homeCountry || Boolean(vat?.enabled)
  const quote = preview(vatApplies, Boolean(vat?.pricesIncludeVat), previewRate)

  const filteredRates = useMemo(() => {
    const q = rateQuery.trim().toLowerCase()
    if (!q) return rates
    return rates.filter((rate) => {
      const name = countryDisplayName(rate.country, i18n.language).toLowerCase()
      return name.includes(q) || rate.country.toLowerCase().includes(q) || String(rate.ratePercent).includes(q)
    })
  }, [rates, rateQuery, i18n.language])

  const countryOption = (rate: StoreVatRate) => ({
    ...rate,
    label: `${countryDisplayName(rate.country, i18n.language)} (${rate.country})`,
  })

  return (
    <>
      <AdminPageHeader
        title={t('admin.vat.title')}
        subtitle={t('admin.vat.subtitle')}
        action={
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Chip
              size="small"
              label={t('admin.vat.statusBgAlways')}
              sx={{
                fontWeight: 700,
                bgcolor: brand.plantGreenMuted,
                color: brand.plantGreenDark,
              }}
            />
            <Chip
              size="small"
              label={vat?.enabled ? t('admin.vat.statusOssOn') : t('admin.vat.statusOssOff')}
              sx={{
                fontWeight: 700,
                bgcolor: vat?.enabled ? brand.plantGreenMuted : brand.surface,
                color: vat?.enabled ? brand.plantGreenDark : brand.textSecondary,
              }}
            />
            <Button variant="contained" onClick={() => void save()} disabled={!vat || saving}>
              {saving ? t('admin.vat.saving') : t('admin.vat.save')}
            </Button>
          </Stack>
        }
      />

      {error ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.88rem', fontWeight: 600, mb: 2 }}>{error}</Typography>
      ) : null}
      {saved ? (
        <Typography sx={{ color: brand.plantGreenDark, fontSize: '0.88rem', fontWeight: 700, mb: 2 }}>
          {t('admin.vat.saved')}
        </Typography>
      ) : null}

      <Stack spacing={2.5}>
        <AdminFieldGroup title={t('admin.vat.turnOn')} hint={t('admin.vat.hint')}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(vat?.enabled)}
                onChange={(e) => patch({ enabled: e.target.checked })}
                disabled={!vat}
              />
            }
            label={t('admin.vat.enabled')}
          />
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.vat.company')} hint={t('admin.vat.vatNumberHint')}>
          <TextField
            label={t('admin.vat.vatNumber')}
            value={vat?.vatNumber ?? ''}
            onChange={(e) => patch({ vatNumber: e.target.value })}
            disabled={!vat}
            placeholder="BG123456789"
          />
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.vat.priceMode')} hint={t('admin.vat.priceModeHint')}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PriceModeCard
                selected={Boolean(vat?.pricesIncludeVat)}
                title={t('admin.vat.includeTitle')}
                body={t('admin.vat.includeBody')}
                onClick={() => patch({ pricesIncludeVat: true })}
                disabled={!vat}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PriceModeCard
                selected={vat != null && !vat.pricesIncludeVat}
                title={t('admin.vat.excludeTitle')}
                body={t('admin.vat.excludeBody')}
                onClick={() => patch({ pricesIncludeVat: false })}
                disabled={!vat}
              />
            </Grid>
          </Grid>
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.vat.preview')} hint={t('admin.vat.previewHint')}>
          <Autocomplete
            options={rates.map(countryOption)}
            value={rates.map(countryOption).find((r) => r.country === previewCountry) ?? null}
            onChange={(_, value) => setPreviewCountry(value?.country ?? 'BG')}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(a, b) => a.country === b.country}
            renderInput={(params) => <TextField {...params} label={t('admin.vat.previewCountry')} />}
            disabled={!vat}
          />
          <Grid container spacing={1.5}>
            <PreviewStat label={t('admin.vat.previewAmount')} value={formatEuro(SAMPLE_AMOUNT)} />
            <PreviewStat label={t('admin.vat.previewRate')} value={`${quote.rate}%`} />
            <PreviewStat label={t('admin.vat.previewTax')} value={formatEuro(quote.tax)} />
            <PreviewStat label={t('admin.vat.previewTotal')} value={formatEuro(quote.total)} />
          </Grid>
          {!vatApplies ? (
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>{t('admin.vat.previewOff')}</Typography>
          ) : previewRate <= 0 ? (
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>{t('admin.vat.previewExport')}</Typography>
          ) : vat.pricesIncludeVat ? (
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>
              {t('admin.vat.previewIncludeNote', { net: formatEuro(quote.net) })}
            </Typography>
          ) : (
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>{t('admin.vat.previewExcludeNote')}</Typography>
          )}
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.vat.rates')} hint={t('admin.vat.ratesHint')}>
          <TextField
            size="small"
            label={t('admin.vat.searchRates')}
            value={rateQuery}
            onChange={(e) => setRateQuery(e.target.value)}
          />
          <Box sx={{ maxHeight: 360, overflow: 'auto', border: `1px solid ${brand.border}`, borderRadius: '12px' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>{t('admin.vat.rateCountry')}</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: 72 }}>{t('admin.vat.rateCode')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, width: 88 }}>
                    {t('admin.vat.rateValue')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRates.map((rate) => (
                  <TableRow
                    key={rate.country}
                    selected={rate.country === previewCountry}
                    hover
                    onClick={() => setPreviewCountry(rate.country)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <span>{countryDisplayName(rate.country, i18n.language)}</span>
                        {rate.country === homeCountry ? (
                          <Chip size="small" label={t('admin.vat.alwaysOn')} sx={{ fontWeight: 700, height: 22, bgcolor: brand.plantGreenMuted, color: brand.plantGreenDark }} />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: brand.textSecondary }}>{rate.country}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {rate.ratePercent}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </AdminFieldGroup>
      </Stack>
    </>
  )
}

function PriceModeCard({
  selected,
  title,
  body,
  onClick,
  disabled,
}: {
  selected: boolean
  title: string
  body: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        p: 1.75,
        borderRadius: '14px',
        border: `1.5px solid ${selected ? brand.plantGreen : brand.border}`,
        bgcolor: selected ? brand.plantGreenMuted : brand.white,
        cursor: disabled ? 'default' : 'pointer',
        font: 'inherit',
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', mb: 0.5, color: brand.graphite }}>{title}</Typography>
      <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem', lineHeight: 1.45 }}>{body}</Typography>
    </Box>
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: brand.surface, border: `1px solid ${brand.border}` }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: brand.textSecondary, mb: 0.35 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 800, color: brand.graphite }}>{value}</Typography>
      </Box>
    </Grid>
  )
}
