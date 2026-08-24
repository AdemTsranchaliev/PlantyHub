import { useEffect, useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { couriersApi } from '../../api'
import type { CourierIdKey, CourierOfficePlace, CourierPlace } from '../../api/types'
import { brand } from '../../theme'

type LocationPatch = {
  countryCode?: string
  cityId?: string
  cityName?: string
  officeCode?: string
}

const bgRegions = new Intl.DisplayNames(['bg'], { type: 'region' })

export default function CourierLocationFields({
  courier,
  countryCode,
  cityId,
  cityName,
  officeCode,
  credentialsReady,
  onChange,
}: {
  courier: CourierIdKey
  countryCode: string
  cityId: string
  cityName: string
  officeCode: string
  credentialsReady: boolean
  onChange: (patch: LocationPatch) => void
}) {
  const { t } = useTranslation()
  const speedyLocked = courier === 'speedy' && !credentialsReady
  const dhlOfficesLocked = courier === 'dhl' && !credentialsReady
  const [countries, setCountries] = useState<CourierPlace[]>([])
  const [cities, setCities] = useState<CourierPlace[]>([])
  const [offices, setOffices] = useState<CourierOfficePlace[]>([])
  const [countryLoading, setCountryLoading] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
  const [officeLoading, setOfficeLoading] = useState(false)
  const [messageKey, setMessageKey] = useState<string | null>(null)

  const country = useMemo(
    () => countries.find((item) => item.id === countryCode || item.code === countryCode) ?? null,
    [countries, countryCode],
  )
  const city = useMemo(() => {
    return (
      cities.find((item) => item.id === cityId || item.name === cityName || item.nameEn === cityName) ??
      (cityName ? { id: cityId || cityName, code: '', name: cityName, nameEn: cityName } : null)
    )
  }, [cities, cityId, cityName])
  const office = useMemo(() => {
    return (
      offices.find((item) => item.id === officeCode || item.code === officeCode) ??
      (officeCode ? { id: officeCode, code: officeCode, name: officeCode } : null)
    )
  }, [offices, officeCode])

  useEffect(() => {
    if (speedyLocked) {
      setCountries([])
      setCities([])
      setOffices([])
      setMessageKey('needsCredentials')
      return
    }
    let cancelled = false
    setCountryLoading(true)
    void couriersApi
      .countries(courier)
      .then((data) => {
        if (cancelled) return
        setCountries(
          [...data.items].sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), 'bg')),
        )
        setMessageKey(data.message)
      })
      .catch(() => {
        if (!cancelled) setMessageKey('loadFailed')
      })
      .finally(() => {
        if (!cancelled) setCountryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courier, speedyLocked])

  useEffect(() => {
    if (!countryCode) {
      setCities([])
      return
    }
    if (speedyLocked) return
    let cancelled = false
    setCityLoading(true)
    void couriersApi
      .cities(courier, countryCode)
      .then((data) => {
        if (cancelled) return
        setCities(data.items)
        if (data.message) setMessageKey(data.message)
      })
      .catch(() => {
        if (!cancelled) setMessageKey('loadFailed')
      })
      .finally(() => {
        if (!cancelled) setCityLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courier, countryCode, speedyLocked])

  useEffect(() => {
    const selectedCity = cityId || cityName
    if (!countryCode || !selectedCity) {
      setOffices([])
      return
    }
    if (speedyLocked) return
    if (dhlOfficesLocked) {
      setOffices([])
      setMessageKey('dhlNeedsKey')
      return
    }
    let cancelled = false
    setOfficeLoading(true)
    void couriersApi
      .offices(courier, { countryId: countryCode, cityId: cityId || undefined, cityName: cityName || undefined })
      .then((data) => {
        if (cancelled) return
        setOffices(data.items)
        if (data.message) setMessageKey(data.message)
      })
      .catch(() => {
        if (!cancelled) setMessageKey('loadFailed')
      })
      .finally(() => {
        if (!cancelled) setOfficeLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courier, countryCode, cityId, cityName, speedyLocked, dhlOfficesLocked])

  useEffect(() => {
    if (countryCode || countries.length === 0) return
    const bulgaria = countries.find(
      (item) => item.code === 'BG' || item.id === 'BGR' || item.id === '100' || item.name === 'България',
    )
    if (bulgaria) onChange({ countryCode: bulgaria.id })
    // Parent onChange identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, countryCode])

  const hint = messageKey
    ? t(`admin.couriers.locations.messages.${messageKey}`, { defaultValue: t('admin.couriers.locations.messages.loadFailed') })
    : t('admin.couriers.locations.cascadeHint')

  const cityFreeSolo = cities.length === 0 && !cityLoading

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          options={countries}
          loading={countryLoading}
          value={country}
          disabled={speedyLocked}
          getOptionLabel={countryLabel}
          isOptionEqualToValue={(a, b) => a.id === b.id || a.code === b.code}
          filterOptions={(options, state) => {
            const q = state.inputValue.trim().toLowerCase()
            const filtered = q
              ? options.filter(
                  (item) =>
                    countryLabel(item).toLowerCase().includes(q) ||
                    item.name.toLowerCase().includes(q) ||
                    (item.nameEn || '').toLowerCase().includes(q) ||
                    item.code.toLowerCase().includes(q),
                )
              : options
            return q ? filtered.slice(0, 200) : filtered.slice(0, 80)
          }}
          onChange={(_, value) =>
            onChange({
              countryCode: value?.id ?? '',
              cityId: '',
              cityName: '',
              officeCode: '',
            })
          }
          noOptionsText={t('admin.couriers.locations.none')}
          loadingText={t('admin.couriers.locations.loading')}
          renderInput={(params) => (
            <TextField {...params} label={t('admin.couriers.locations.country')} />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        {courier === 'dhl' ? (
          <TextField
            label={t('admin.couriers.locations.city')}
            value={cityName}
            disabled={!countryCode}
            onChange={(e) =>
              onChange({
                cityId: e.target.value,
                cityName: e.target.value,
                officeCode: '',
              })
            }
            helperText={t('admin.couriers.locations.messages.typeCity')}
          />
        ) : (
          <Autocomplete
            freeSolo={cityFreeSolo}
            options={cities}
            loading={cityLoading}
            value={city}
            disabled={!countryCode || speedyLocked}
            getOptionLabel={(option) => (typeof option === 'string' ? option : cityLabel(option))}
            isOptionEqualToValue={(a, b) => a.id === b.id || a.name === b.name}
            filterOptions={(options, state) => filterByQuery(options, state.inputValue, cityLabel)}
            onChange={(_, value) => {
              if (typeof value === 'string') {
                onChange({ cityId: value, cityName: value, officeCode: '' })
                return
              }
              onChange({
                cityId: value?.id ?? '',
                cityName: value?.name ?? '',
                officeCode: '',
              })
            }}
            noOptionsText={t('admin.couriers.locations.none')}
            loadingText={t('admin.couriers.locations.loading')}
            renderInput={(params) => (
              <TextField {...params} label={t('admin.couriers.locations.city')} />
            )}
          />
        )}
      </Grid>
      <Grid size={12}>
        <Autocomplete
          options={offices}
          loading={officeLoading}
          value={office}
          disabled={(!cityId && !cityName) || speedyLocked || dhlOfficesLocked}
          getOptionLabel={officeLabel}
          isOptionEqualToValue={(a, b) => a.id === b.id || a.code === b.code}
          filterOptions={(options, state) => filterByQuery(options, state.inputValue, officeLabel)}
          onChange={(_, value) =>
            onChange({
              officeCode: value?.code || value?.id || '',
              cityName: value?.cityName || cityName,
              cityId: cityId || value?.cityId || '',
            })
          }
          noOptionsText={t('admin.couriers.locations.none')}
          loadingText={t('admin.couriers.locations.loading')}
          renderOption={(props, option) => {
            const { key, ...rest } = props as typeof props & { key: string }
            return (
              <Box component="li" key={key} {...rest}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{option.name}</Typography>
                  {option.address ? (
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.75rem' }}>{option.address}</Typography>
                  ) : null}
                </Box>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField {...params} label={t('admin.couriers.locations.office')} />
          )}
        />
      </Grid>
      <Grid size={12}>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.78rem', lineHeight: 1.45 }}>{hint}</Typography>
      </Grid>
    </>
  )
}

function countryLabel(place: CourierPlace) {
  const iso = (place.code.length === 2 ? place.code : place.id.length === 2 ? place.id : '').toUpperCase()
  if (iso.length === 2) {
    try {
      const label = bgRegions.of(iso)
      if (label && label !== iso) return label
    } catch {
      /* keep API name */
    }
  }
  return place.name
}

function cityLabel(place: CourierPlace) {
  return place.name
}

function officeLabel(office: CourierOfficePlace) {
  return office.name
}

function filterByQuery<T>(options: T[], input: string, label: (item: T) => string) {
  const q = input.trim().toLowerCase()
  const filtered = q ? options.filter((item) => label(item).toLowerCase().includes(q)) : options
  return q ? filtered.slice(0, 200) : filtered.slice(0, 60)
}
