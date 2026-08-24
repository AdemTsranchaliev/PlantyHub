import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { couriersApi } from '../../api'
import type { CourierIdKey, CourierOfficePlace, CourierPlace, ShippingQuote } from '../../api/types'
import AdminFieldGroup from './AdminFieldGroup'
import { brand } from '../../theme'
import { countryDisplayName } from '../../utils/country'
import { formatEuro } from '../../utils/price'

const courierIds: CourierIdKey[] = ['econt', 'speedy', 'dhl', 'boxnow']

type Destination = {
  courier: CourierIdKey
  country: string
  countryId: string
  city: string
  cityId: string
  postalCode: string
  street: string
  officeCode: string
  weightKg: number
}

const empty: Destination = {
  courier: 'econt',
  country: 'BG',
  countryId: '',
  city: '',
  cityId: '',
  postalCode: '',
  street: '',
  officeCode: '',
  weightKg: 1.5,
}

export default function ShippingCalculator() {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState<Destination>(empty)
  const [countries, setCountries] = useState<CourierPlace[]>([])
  const [cities, setCities] = useState<CourierPlace[]>([])
  const [offices, setOffices] = useState<CourierOfficePlace[]>([])
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [countryLoading, setCountryLoading] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
  const [officeLoading, setOfficeLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listMessage, setListMessage] = useState<string | null>(null)
  const [credentialsReady, setCredentialsReady] = useState(true)

  useEffect(() => {
    if (form.courier === 'econt' || form.courier === 'boxnow') {
      setCredentialsReady(true)
      return
    }
    setCredentialsReady(false)
    void couriersApi.get().then((data) => {
      setCredentialsReady(Boolean(data[form.courier]?.hasPassword))
    })
  }, [form.courier])

  const country = useMemo(
    () => countries.find((item) => item.id === form.countryId || item.code === form.country) ?? null,
    [countries, form.country, form.countryId],
  )
  const city = useMemo(() => {
    return (
      cities.find((item) => item.id === form.cityId || item.name === form.city) ??
      (form.city ? { id: form.cityId || form.city, code: form.postalCode, name: form.city, nameEn: form.city } : null)
    )
  }, [cities, form.city, form.cityId, form.postalCode])
  const office = useMemo(() => {
    return (
      offices.find((item) => item.id === form.officeCode || item.code === form.officeCode) ??
      (form.officeCode ? { id: form.officeCode, code: form.officeCode, name: form.officeCode } : null)
    )
  }, [offices, form.officeCode])

  useEffect(() => {
    if (form.courier === 'speedy' && !credentialsReady) {
      setCountries([])
      setCities([])
      setOffices([])
      setListMessage('needsCredentials')
      return
    }
    let cancelled = false
    setCountryLoading(true)
    setListMessage(null)
    void couriersApi
      .countries(form.courier)
      .then((data) => {
        if (cancelled) return
        setCountries(
          [...data.items].sort((a, b) =>
            countryLabel(a, i18n.language).localeCompare(countryLabel(b, i18n.language), i18n.language),
          ),
        )
        setListMessage(data.message)
      })
      .catch(() => {
        if (!cancelled) setListMessage('loadFailed')
      })
      .finally(() => {
        if (!cancelled) setCountryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [form.courier, credentialsReady, i18n.language])

  useEffect(() => {
    if (form.countryId || countries.length === 0) return
    const bulgaria = countries.find(
      (item) => item.code === 'BG' || item.id === 'BGR' || item.id === '100' || item.name === 'България',
    )
    if (bulgaria) {
      setForm((prev) => ({
        ...prev,
        country: iso2(bulgaria),
        countryId: bulgaria.id,
      }))
    }
  }, [countries, form.countryId])

  useEffect(() => {
    if (!form.countryId) {
      setCities([])
      return
    }
    if (form.courier === 'speedy' && !credentialsReady) return
    let cancelled = false
    setCityLoading(true)
    void couriersApi
      .cities(form.courier, form.countryId)
      .then((data) => {
        if (cancelled) return
        setCities(data.items)
        if (data.message) setListMessage(data.message)
      })
      .catch(() => {
        if (!cancelled) setCities([])
      })
      .finally(() => {
        if (!cancelled) setCityLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [form.courier, form.countryId, credentialsReady])

  useEffect(() => {
    if (!form.countryId || (!form.cityId && !form.city)) {
      setOffices([])
      return
    }
    if (form.courier === 'speedy' && !credentialsReady) return
    if (form.courier === 'dhl' && !credentialsReady) {
      setOffices([])
      setListMessage('dhlNeedsKey')
      return
    }
    let cancelled = false
    setOfficeLoading(true)
    void couriersApi
      .offices(form.courier, {
        countryId: form.countryId,
        cityId: form.cityId || undefined,
        cityName: form.city || undefined,
      })
      .then((data) => {
        if (cancelled) return
        setOffices(data.items)
        if (data.message) setListMessage(data.message)
      })
      .catch(() => {
        if (!cancelled) setOffices([])
      })
      .finally(() => {
        if (!cancelled) setOfficeLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [form.courier, form.countryId, form.cityId, form.city, credentialsReady])

  const calculate = async () => {
    if (form.city.trim().length < 2 || !form.country) return
    setLoading(true)
    setError(null)
    try {
      const data = await couriersApi.calculate({
        courier: form.courier,
        country: form.country,
        city: form.city.trim(),
        cityId: form.cityId || undefined,
        postalCode: form.postalCode.trim(),
        street: form.street.trim() || undefined,
        officeCode: form.officeCode.trim() || undefined,
        weightKg: form.weightKg,
      })
      setQuotes(data.quotes)
    } catch {
      setError(t('admin.couriers.calculator.failed'))
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  const cityFreeSolo = cities.length === 0 && !cityLoading

  return (
    <Stack spacing={2.5}>
      <AdminFieldGroup title={t('admin.couriers.calculator.title')} hint={t('admin.couriers.calculator.hint')}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label={t('admin.couriers.calculator.courier')}
              value={form.courier}
              onChange={(e) => {
                const courier = e.target.value as CourierIdKey
                setForm({ ...empty, courier, weightKg: form.weightKg, street: form.street })
                setCountries([])
                setCities([])
                setOffices([])
                setQuotes([])
                setListMessage(null)
              }}
              helperText={t('admin.couriers.calculator.courierHint')}
            >
              {courierIds.map((id) => (
                <MenuItem key={id} value={id}>
                  {t(`admin.orderDetail.couriers.${id}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {form.courier === 'speedy' && !credentialsReady ? (
            <Grid size={12}>
              <Alert severity="warning">{t('admin.couriers.locations.messages.needsCredentials')}</Alert>
            </Grid>
          ) : null}
          {form.courier === 'dhl' ? (
            <Grid size={12}>
              <Alert severity={credentialsReady ? 'info' : 'warning'}>
                {credentialsReady
                  ? t('admin.couriers.locations.messages.typeCity')
                  : t('admin.couriers.locations.messages.dhlNeedsKey')}
              </Alert>
            </Grid>
          ) : null}
          {form.courier === 'boxnow' ? (
            <Grid size={12}>
              <Alert severity="info">{t('admin.couriers.locations.messages.boxnowBgOnly')}</Alert>
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={countries}
              loading={countryLoading}
              value={country}
              disabled={form.courier === 'speedy' && !credentialsReady}
              getOptionLabel={(item) => countryLabel(item, i18n.language)}
              isOptionEqualToValue={(a, b) => a.id === b.id || a.code === b.code}
              filterOptions={(options, state) => {
                const q = state.inputValue.trim().toLowerCase()
                const filtered = q
                  ? options.filter((item) => countryLabel(item, i18n.language).toLowerCase().includes(q))
                  : options
                return q ? filtered.slice(0, 200) : filtered.slice(0, 80)
              }}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  country: value ? iso2(value) : '',
                  countryId: value?.id || '',
                  city: '',
                  cityId: '',
                  postalCode: '',
                  officeCode: '',
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('admin.couriers.locations.country')}
                  helperText={
                    countries.length > 0
                      ? t('admin.couriers.calculator.countryCount', { count: countries.length })
                      : undefined
                  }
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {form.courier === 'dhl' ? (
              <TextField
                label={t('admin.couriers.locations.city')}
                value={form.city}
                disabled={!form.countryId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    city: e.target.value,
                    cityId: e.target.value,
                    officeCode: '',
                  }))
                }
                helperText={t('admin.couriers.locations.messages.typeCity')}
              />
            ) : (
              <Autocomplete
                freeSolo={cityFreeSolo}
                options={cities}
                loading={cityLoading}
                value={city}
                disabled={!form.countryId || (form.courier === 'speedy' && !credentialsReady)}
                getOptionLabel={(item) =>
                  typeof item === 'string' ? item : item.code ? `${item.name} (${item.code})` : item.name
                }
                isOptionEqualToValue={(a, b) => a.id === b.id || a.name === b.name}
                filterOptions={(options, state) => {
                  const q = state.inputValue.trim().toLowerCase()
                  const filtered = q ? options.filter((item) => item.name.toLowerCase().includes(q)) : options
                  return q ? filtered.slice(0, 200) : filtered.slice(0, 80)
                }}
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    setForm((prev) => ({ ...prev, city: value, cityId: '', officeCode: '' }))
                    return
                  }
                  setForm((prev) => ({
                    ...prev,
                    city: value?.name || '',
                    cityId: value?.id || '',
                    postalCode: value?.code || prev.postalCode,
                    officeCode: '',
                  }))
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('admin.couriers.locations.city')}
                    helperText={
                      cities.length > 0
                        ? t('admin.couriers.calculator.cityCount', { count: cities.length })
                        : undefined
                    }
                  />
                )}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={offices}
              loading={officeLoading}
              value={office}
              disabled={!form.city && !form.cityId}
              getOptionLabel={(item) => (item.address ? `${item.name} — ${item.address}` : item.name)}
              isOptionEqualToValue={(a, b) => a.id === b.id || a.code === b.code}
              filterOptions={(options, state) => {
                const q = state.inputValue.trim().toLowerCase()
                const filtered = q
                  ? options.filter((item) => `${item.name} ${item.address || ''}`.toLowerCase().includes(q))
                  : options
                return q ? filtered.slice(0, 200) : filtered.slice(0, 80)
              }}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  officeCode: value?.code || value?.id || '',
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('admin.couriers.locations.office')}
                  helperText={t('admin.couriers.calculator.officeHint')}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t('admin.couriers.sender.postalCode')}
              value={form.postalCode}
              onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label={t('admin.couriers.calculator.weight')}
              value={form.weightKg}
              onChange={(e) => setForm((prev) => ({ ...prev, weightKg: Number(e.target.value) || 1.5 }))}
              slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t('admin.couriers.calculator.street')}
              value={form.street}
              onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
            />
          </Grid>
          {listMessage ? (
            <Grid size={12}>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>
                {t(`admin.couriers.locations.messages.${listMessage}`, {
                  defaultValue: t('admin.couriers.locations.messages.loadFailed'),
                })}
              </Typography>
            </Grid>
          ) : null}
          <Grid size={12}>
            <Button variant="contained" onClick={() => void calculate()} disabled={loading || form.city.trim().length < 2}>
              {loading ? t('admin.couriers.calculator.calculating') : t('admin.couriers.calculator.calculate')}
            </Button>
          </Grid>
        </Grid>
      </AdminFieldGroup>

      {error ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.88rem', fontWeight: 600 }}>{error}</Typography>
      ) : null}

      <AdminFieldGroup title={t('admin.couriers.calculator.results')}>
        {quotes.length === 0 ? (
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem' }}>
            {t('admin.couriers.calculator.empty')}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {quotes.map((quote) => {
              const ok = !quote.message
              return (
                <Box
                  key={quote.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 1.5,
                    py: 1.1,
                    borderRadius: '8px',
                    border: `1px solid ${ok ? brand.border : '#F3C6C6'}`,
                    bgcolor: ok ? brand.surface : '#FFF6F6',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
                      {t(`admin.orderDetail.couriers.${quote.courier}`, { defaultValue: quote.courier })} —{' '}
                      {t(`checkout.delivery.${quote.delivery}`, { defaultValue: quote.delivery })}
                    </Typography>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.78rem' }}>
                      {ok
                        ? t('admin.couriers.calculator.ok')
                        : t(`admin.couriers.locations.messages.${quote.message}`, {
                            defaultValue: t('admin.couriers.calculator.unavailable'),
                          })}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: ok ? brand.plantGreenDark : brand.textSecondary }}>
                    {ok ? formatEuro(quote.priceEur) : '—'}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
        )}
      </AdminFieldGroup>
    </Stack>
  )
}

function iso2(place: CourierPlace) {
  if (place.code.length === 2) return place.code.toUpperCase()
  if (place.id.length === 2) return place.id.toUpperCase()
  return ''
}

function countryLabel(place: CourierPlace, language: string) {
  const code = iso2(place)
  if (code.length === 2) return countryDisplayName(code, language)
  return place.name
}
