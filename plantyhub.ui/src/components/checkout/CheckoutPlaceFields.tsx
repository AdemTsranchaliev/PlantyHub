import { useEffect, useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { shippingApi } from '../../api'
import type { CourierOfficePlace, CourierPlace } from '../../api/types'
import { checkout } from './CheckoutOrderSummary'
import { countryDisplayName } from '../../utils/country'
import CheckoutField from './CheckoutField'

export type CheckoutDestination = {
  country: string
  countryId: string
  city: string
  cityId: string
  postalCode: string
  officeCode: string
}

export default function CheckoutPlaceFields({
  value,
  errors,
  pickupCourier,
  officeRequired,
  onChange,
}: {
  value: CheckoutDestination
  errors: { city?: boolean; postalCode?: boolean; officeCode?: boolean }
  pickupCourier?: 'econt' | 'speedy' | 'boxnow' | null
  officeRequired?: boolean
  onChange: (patch: Partial<CheckoutDestination>) => void
}) {
  const { t, i18n } = useTranslation()
  const [countries, setCountries] = useState<CourierPlace[]>([])
  const [cities, setCities] = useState<CourierPlace[]>([])
  const [offices, setOffices] = useState<CourierOfficePlace[]>([])
  const [countryLoading, setCountryLoading] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
  const [officeLoading, setOfficeLoading] = useState(false)

  const country = useMemo(
    () =>
      countries.find((item) => item.code === value.country || item.id === value.countryId) ?? null,
    [countries, value.country, value.countryId],
  )
  const city = useMemo(() => {
    return (
      cities.find((item) => item.id === value.cityId || item.name === value.city) ??
      (value.city ? { id: value.cityId || value.city, code: value.postalCode, name: value.city, nameEn: value.city } : null)
    )
  }, [cities, value.city, value.cityId, value.postalCode])
  const office = useMemo(() => {
    return (
      offices.find((item) => item.id === value.officeCode || item.code === value.officeCode) ??
      (value.officeCode ? { id: value.officeCode, code: value.officeCode, name: value.officeCode } : null)
    )
  }, [offices, value.officeCode])

  useEffect(() => {
    let cancelled = false
    setCountryLoading(true)
    void shippingApi
      .countries('econt')
      .then((data) => {
        if (cancelled) return
        setCountries(
          [...data.items].sort((a, b) =>
            placeCountryLabel(a, i18n.language).localeCompare(placeCountryLabel(b, i18n.language), i18n.language),
          ),
        )
      })
      .finally(() => {
        if (!cancelled) setCountryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [i18n.language])

  useEffect(() => {
    if (!value.countryId) {
      setCities([])
      return
    }
    let cancelled = false
    setCityLoading(true)
    void shippingApi
      .cities('econt', value.countryId)
      .then((data) => {
        if (!cancelled) setCities(data.items)
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
  }, [value.countryId])

  useEffect(() => {
    if (!pickupCourier || !value.country || (!value.cityId && !value.city)) {
      setOffices([])
      return
    }
    let cancelled = false
    setOfficeLoading(true)
    const countryId = pickupCourier === 'boxnow' ? value.country || 'BG' : value.countryId || value.country
    void shippingApi
      .offices(pickupCourier, {
        countryId,
        cityId: value.cityId || undefined,
        cityName: value.city || undefined,
      })
      .then((data) => {
        if (!cancelled) setOffices(data.items)
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
  }, [pickupCourier, value.country, value.countryId, value.cityId, value.city])

  useEffect(() => {
    if (value.countryId || countries.length === 0) return
    const bulgaria = countries.find((item) => item.code === 'BG' || item.id === 'BGR')
    if (bulgaria) {
      onChange({
        country: bulgaria.code || 'BG',
        countryId: bulgaria.id,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, value.countryId])

  return (
    <Box>
      <PlaceAutocomplete
        label={t('checkout.country')}
        options={countries}
        loading={countryLoading}
        value={country}
        getOptionLabel={(item) => (typeof item === 'string' ? item : placeCountryLabel(item, i18n.language))}
        onChange={(item) => {
          if (!item || typeof item === 'string') return
          onChange({
            country: item.code || '',
            countryId: item.id || '',
            city: '',
            cityId: '',
            postalCode: '',
            officeCode: '',
          })
        }}
      />
      <Box sx={{ mt: 1.25 }}>
        <PlaceAutocomplete
          label={t('checkout.city')}
          options={cities}
          loading={cityLoading}
          value={city}
          disabled={!value.countryId}
          error={errors.city}
          helperText={t('checkout.required')}
          freeSolo={cities.length === 0 && !cityLoading}
          getOptionLabel={(item) => (typeof item === 'string' ? item : cityLabel(item))}
          onChange={(item) => {
            if (typeof item === 'string') {
              onChange({ city: item, cityId: '', officeCode: '' })
              return
            }
            onChange({
              city: item?.name || '',
              cityId: item?.id || '',
              postalCode: item?.code || '',
              officeCode: '',
            })
          }}
        />
      </Box>
      <Grid container spacing={1.25} sx={{ mt: 0.25 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CheckoutField
            label={t('checkout.postalCode')}
            autoComplete="postal-code"
            value={value.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            error={errors.postalCode}
            helperText={t('checkout.required')}
          />
        </Grid>
        {pickupCourier ? (
          <Grid size={{ xs: 12, sm: 6 }}>
            <PlaceAutocomplete
              label={pickupCourier === 'boxnow' ? t('checkout.locker') : t('checkout.office')}
              options={offices}
              loading={officeLoading}
              value={office}
              disabled={!value.cityId && !value.city}
              error={errors.officeCode}
              helperText={officeRequired ? t('checkout.required') : undefined}
              getOptionLabel={(item) => officeLabel(item)}
              onChange={(item) =>
                onChange({
                  officeCode: typeof item === 'object' && item ? item.code || item.id || '' : '',
                })
              }
              placeholder={officeRequired ? undefined : t('checkout.officeOptional')}
            />
          </Grid>
        ) : null}
      </Grid>
      <Typography sx={{ mt: 1, fontSize: '0.75rem', color: checkout.muted, lineHeight: 1.45 }}>
        {t('checkout.placesHint')}
      </Typography>
    </Box>
  )
}

function PlaceAutocomplete<T extends { id: string }>({
  label,
  options,
  loading,
  value,
  disabled,
  error,
  helperText,
  placeholder,
  freeSolo,
  getOptionLabel,
  onChange,
}: {
  label: string
  options: T[]
  loading: boolean
  value: T | null
  disabled?: boolean
  error?: boolean
  helperText?: string
  placeholder?: string
  freeSolo?: boolean
  getOptionLabel: (item: T | string) => string
  onChange: (item: T | string | null) => void
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography
        component="label"
        sx={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#6B6F6C',
          mb: 0.4,
        }}
      >
        {label}
      </Typography>
      <Autocomplete
        freeSolo={freeSolo}
        options={options}
        loading={loading}
        value={value}
        disabled={disabled}
        getOptionLabel={(item) => getOptionLabel(item)}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        filterOptions={(items, state) => {
          const q = state.inputValue.trim().toLowerCase()
          const filtered = q
            ? items.filter((item) => getOptionLabel(item).toLowerCase().includes(q))
            : items
          return q ? filtered.slice(0, 200) : filtered.slice(0, 80)
        }}
        onChange={(_, item) => onChange(item)}
        onInputChange={(_, input, reason) => {
          if (freeSolo && reason === 'input') onChange(input)
        }}
        noOptionsText={t('checkout.placesNone')}
        loadingText={t('checkout.quoting')}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={error}
            helperText={error ? helperText : undefined}
            slotProps={{
              formHelperText: { sx: { mx: 0, mt: 0.4, fontSize: '0.75rem' } },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 40,
                borderRadius: '5px',
                bgcolor: '#fff',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#D4D7D2' },
                '&:hover fieldset': { borderColor: '#A8ACA6' },
                '&.Mui-focused fieldset': { borderColor: '#2F7D53', borderWidth: 1 },
              },
              '& .MuiOutlinedInput-input': { py: 0.85, px: 1.25 },
            }}
          />
        )}
      />
    </Box>
  )
}

function placeCountryLabel(place: CourierPlace, language: string) {
  const iso = (place.code.length === 2 ? place.code : place.id.length === 2 ? place.id : '').toUpperCase()
  if (iso.length === 2) return countryDisplayName(iso, language)
  return place.name
}

function cityLabel(place: CourierPlace) {
  return place.code ? `${place.name} (${place.code})` : place.name
}

function officeLabel(office: CourierOfficePlace) {
  return office.address ? `${office.name} — ${office.address}` : office.name
}
