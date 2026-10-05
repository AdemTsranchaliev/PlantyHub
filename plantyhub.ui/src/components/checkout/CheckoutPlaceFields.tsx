import { useEffect, useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { shippingApi } from '../../api'
import type { CourierOfficePlace, CourierPlace } from '../../api/types'
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
  onChange,
}: {
  value: CheckoutDestination
  errors: { city?: boolean }
  onChange: (patch: Partial<CheckoutDestination>) => void
}) {
  const { t } = useTranslation()
  const [countries, setCountries] = useState<CourierPlace[]>([])
  const [cities, setCities] = useState<CourierPlace[]>([])
  const [cityLoading, setCityLoading] = useState(false)

  const city = useMemo(() => {
    return (
      cities.find((item) => item.id === value.cityId || item.name === value.city) ??
      (value.city ? { id: value.cityId || value.city, code: value.postalCode, name: value.city, nameEn: value.city } : null)
    )
  }, [cities, value.city, value.cityId, value.postalCode])

  useEffect(() => {
    let cancelled = false
    void shippingApi
      .countries('econt')
      .then((data) => {
        if (cancelled) return
        setCountries(data.items.filter((item) => item.code === 'BG' || item.id === 'BGR'))
      })
    return () => {
      cancelled = true
    }
  }, [])

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
    if (countries.length === 0) return
    const bulgaria = countries.find((item) => item.code === 'BG' || item.id === 'BGR')
    if (!bulgaria) return
    const code = bulgaria.code || 'BG'
    if (value.country === code && value.countryId === bulgaria.id) return
    onChange({
      country: code,
      countryId: bulgaria.id,
      city: '',
      cityId: '',
      postalCode: '',
      officeCode: '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, value.country, value.countryId])

  return (
    <Stack spacing={1.25}>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.45 }}>
        {t('checkout.bulgariaOnly')}
      </Typography>
      <PlaceAutocomplete
        id="checkout-city"
        requireQuery
        label={t('checkout.city')}
        options={cities}
        loading={cityLoading}
        value={city}
        disabled={!value.countryId}
        error={errors.city}
        helperText={t('checkout.required')}
        freeSolo={cities.length === 0 && !cityLoading}
        placeholder={t('checkout.citySearch')}
        getOptionLabel={(item) => (typeof item === 'string' ? item : cityLabel(item))}
        onChange={(item) => {
          if (typeof item === 'string') {
            onChange({ city: item, cityId: '', postalCode: '', officeCode: '' })
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
    </Stack>
  )
}

export function CheckoutOfficeField({
  value,
  errors,
  pickupCourier,
  officeRequired,
  onChange,
}: {
  value: CheckoutDestination
  errors: { officeCode?: boolean }
  pickupCourier: 'econt' | 'speedy' | 'boxnow'
  officeRequired?: boolean
  onChange: (patch: Partial<CheckoutDestination>) => void
}) {
  const { t } = useTranslation()
  const [offices, setOffices] = useState<CourierOfficePlace[]>([])
  const [officeLoading, setOfficeLoading] = useState(false)
  const office = useMemo(() => {
    return (
      offices.find((item) => item.id === value.officeCode || item.code === value.officeCode) ??
      (value.officeCode ? { id: value.officeCode, code: value.officeCode, name: value.officeCode } : null)
    )
  }, [offices, value.officeCode])

  useEffect(() => {
    if (!value.country || (!value.cityId && !value.city)) {
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

  return (
    <PlaceAutocomplete
      id="checkout-office"
      requireQuery
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
      placeholder={t('checkout.officeOptional')}
    />
  )
}

function PlaceAutocomplete<T extends { id: string }>({
  id,
  label,
  options,
  loading,
  value,
  disabled,
  error,
  helperText,
  placeholder,
  freeSolo,
  requireQuery,
  getOptionLabel,
  onChange,
}: {
  id?: string
  label: string
  options: T[]
  loading: boolean
  value: T | null
  disabled?: boolean
  error?: boolean
  helperText?: string
  placeholder?: string
  freeSolo?: boolean
  requireQuery?: boolean
  getOptionLabel: (item: T | string) => string
  onChange: (item: T | string | null) => void
}) {
  const { t } = useTranslation()
  const [showMatches, setShowMatches] = useState(false)

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
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
        id={id}
        freeSolo={freeSolo}
        options={options}
        loading={loading}
        value={value}
        disabled={disabled}
        openOnFocus={false}
        selectOnFocus={false}
        getOptionLabel={(item) => getOptionLabel(item)}
        isOptionEqualToValue={(a, b) => (typeof a === 'string' ? a : a.id) === (typeof b === 'string' ? b : b.id)}
        filterOptions={(items, state) => {
          const q = state.inputValue.trim().toLowerCase()
          if (q.length < 2) return requireQuery ? [] : items.slice(0, 40)
          return items.filter((item) => getOptionLabel(item).toLowerCase().includes(q)).slice(0, 30)
        }}
        onChange={(_, item) => onChange(item)}
        onInputChange={(_, input, reason) => {
          if (requireQuery) setShowMatches(reason === 'input' && input.trim().length >= 2)
          if (freeSolo && reason === 'input') onChange(input)
        }}
        noOptionsText={t('checkout.placesNone')}
        loadingText={t('checkout.quoting')}
        slotProps={{
          popper: {
            sx: requireQuery && !showMatches ? { display: 'none' } : undefined,
          },
          listbox: {
            sx: { maxHeight: { xs: 220, sm: 280 }, scrollBehavior: 'auto' },
          },
        }}
        renderInput={(params) => {
          const incoming = params.slotProps?.htmlInput
          const htmlInput = typeof incoming === 'object' && incoming ? incoming : undefined
          return (
            <TextField
              {...params}
              placeholder={placeholder}
              error={error}
              helperText={error ? helperText : undefined}
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...htmlInput,
                  autoComplete: 'off',
                  autoCorrect: 'off',
                  spellCheck: false,
                  enterKeyHint: 'done',
                },
                formHelperText: { sx: { mx: 0, mt: 0.4, fontSize: '0.75rem' } },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 44,
                  borderRadius: '10px',
                  bgcolor: '#fff',
                  fontSize: '16px',
                  py: 0,
                  pl: 0.5,
                  '& fieldset': { borderColor: '#D4D7D2' },
                  '@media (hover: hover) and (pointer: fine)': {
                    '&:hover fieldset': { borderColor: '#A8ACA6' },
                  },
                  '&.Mui-focused fieldset': { borderColor: '#2F7D53', borderWidth: 1 },
                  '&.Mui-error fieldset': { borderColor: '#C62828' },
                },
                '& .MuiAutocomplete-input': {
                  py: '0 !important',
                  px: '8px !important',
                  fontSize: '16px',
                  scrollMarginTop: '20px',
                  scrollMarginBottom: '30vh',
                },
              }}
            />
          )
        }}
      />
    </Box>
  )
}

function cityLabel(place: CourierPlace) {
  return place.code ? `${place.name} (${place.code})` : place.name
}

function officeLabel(office: CourierOfficePlace) {
  return office.address ? `${office.name} — ${office.address}` : office.name
}
