import { useEffect, useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminFieldGroup from '../../components/admin/AdminFieldGroup'
import CourierLocationFields from '../../components/admin/CourierLocationFields'
import ShippingCalculator from '../../components/admin/ShippingCalculator'
import { couriersApi } from '../../api'
import type {
  ApiCourierAccount,
  ApiCourierSender,
  ApiCourierSettings,
  CourierIdKey,
  UpdateCourierAccountPayload,
  CourierPlace,
} from '../../api/types'
import { brand } from '../../theme'
import { countryDisplayName } from '../../utils/country'

const courierIds: CourierIdKey[] = ['econt', 'speedy', 'dhl', 'boxnow']
type TabKey = 'sender' | 'calculator' | CourierIdKey

const emptySender: ApiCourierSender = {
  company: '',
  contactName: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  postalCode: '',
  country: 'BG',
  defaultCourier: 'econt',
}

function accountDraft(account: ApiCourierAccount): UpdateCourierAccountPayload & { hasPassword: boolean; configured: boolean; mode: string } {
  return {
    enabled: account.enabled,
    testMode: account.testMode,
    username: account.username,
    password: '',
    siteId: account.siteId,
    apiUrl: account.apiUrl,
    officeCode: account.officeCode,
    clientId: account.clientId,
    contractId: account.contractId,
    accountNumber: account.accountNumber,
    iban: account.iban,
    serviceType: account.serviceType,
    contents: account.contents,
    payer: account.payer || 'sender',
    defaultWeightKg: account.defaultWeightKg || 1.5,
    defaultPackages: account.defaultPackages || 1,
    labelFormat: account.labelFormat || 'pdf',
    notes: account.notes,
    countryCode: account.countryCode ?? '',
    cityId: account.cityId ?? '',
    cityName: account.cityName ?? '',
    hasPassword: account.hasPassword,
    configured: account.configured,
    mode: account.mode,
  }
}

export default function AdminCouriersPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabKey>('sender')
  const [sender, setSender] = useState<ApiCourierSender>(emptySender)
  const [accounts, setAccounts] = useState<Record<CourierIdKey, ReturnType<typeof accountDraft>> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apply = (data: ApiCourierSettings) => {
    setSender({ ...emptySender, ...data.sender })
    setAccounts({
      econt: accountDraft(data.econt),
      speedy: accountDraft(data.speedy),
      dhl: accountDraft(data.dhl),
      boxnow: accountDraft(data.boxnow),
    })
  }

  useEffect(() => {
    void couriersApi
      .get()
      .then(apply)
      .catch(() => setError(t('admin.couriers.loadFailed')))
  }, [t])

  const selectedAccount = accounts && tab !== 'sender' ? accounts[tab] : null
  const modeKey = useMemo(() => {
    const mode = selectedAccount?.mode
    return mode === 'sandbox' || mode === 'live' ? mode : 'manual'
  }, [selectedAccount?.mode])

  const handleSave = async () => {
    if (!accounts) return
    setSaving(true)
    setError(null)
    try {
      const savedSettings = await couriersApi.update({
        sender,
        econt: payload(accounts.econt),
        speedy: payload(accounts.speedy),
        dhl: payload(accounts.dhl),
        boxnow: payload(accounts.boxnow),
      })
      apply(savedSettings)
      setSaved(true)
    } catch {
      setError(t('admin.couriers.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const patchAccount = (id: CourierIdKey, patch: Partial<ReturnType<typeof accountDraft>>) => {
    setAccounts((prev) => (prev ? { ...prev, [id]: { ...prev[id], ...patch } } : prev))
    setSaved(false)
  }

  const patchSender = (patch: Partial<ApiCourierSender>) => {
    setSender((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  return (
    <>
      <AdminPageHeader
        title={t('admin.couriers.title')}
        subtitle={t('admin.couriers.subtitle')}
        action={
          tab === 'calculator' ? undefined : (
            <Button variant="contained" onClick={() => void handleSave()} disabled={!accounts || saving}>
              {saving ? t('admin.couriers.saving') : t('admin.couriers.save')}
            </Button>
          )
        }
      />

      {error ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.88rem', fontWeight: 600, mb: 2 }}>{error}</Typography>
      ) : null}
      {saved ? (
        <Typography sx={{ color: brand.plantGreenDark, fontSize: '0.88rem', fontWeight: 700, mb: 2 }}>
          {t('admin.couriers.saved')}
        </Typography>
      ) : null}

      <Tabs
        value={tab}
        onChange={(_, value: TabKey) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2.5, minHeight: 44, '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', minHeight: 44 } }}
      >
        <Tab value="sender" label={t('admin.couriers.tabs.sender')} />
        <Tab value="calculator" label={t('admin.couriers.tabs.calculator')} />
        {courierIds.map((id) => (
          <Tab key={id} value={id} label={t(`admin.orderDetail.couriers.${id}`)} />
        ))}
      </Tabs>

      {tab === 'calculator' ? (
        <ShippingCalculator />
      ) : tab === 'sender' ? (
        <Stack spacing={2.5}>
          <AdminFieldGroup title={t('admin.couriers.sender.companyGroup')} hint={t('admin.couriers.sender.hint')}>
            <Grid container spacing={1.75}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={t('admin.couriers.sender.company')} value={sender.company} onChange={(e) => patchSender({ company: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={t('admin.couriers.sender.contactName')} value={sender.contactName} onChange={(e) => patchSender({ contactName: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={t('admin.couriers.sender.phone')} value={sender.phone} onChange={(e) => patchSender({ phone: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={t('admin.couriers.sender.email')} value={sender.email} onChange={(e) => patchSender({ email: e.target.value })} />
              </Grid>
            </Grid>
          </AdminFieldGroup>
          <AdminFieldGroup title={t('admin.couriers.sender.addressGroup')}>
            <Grid container spacing={1.75}>
              <Grid size={12}>
                <TextField label={t('admin.couriers.sender.street')} value={sender.street} onChange={(e) => patchSender({ street: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label={t('admin.couriers.sender.city')} value={sender.city} onChange={(e) => patchSender({ city: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label={t('admin.couriers.sender.postalCode')} value={sender.postalCode} onChange={(e) => patchSender({ postalCode: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SenderCountryField
                  value={sender.country || 'BG'}
                  onChange={(country) => patchSender({ country })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label={t('admin.couriers.sender.defaultCourier')}
                  value={sender.defaultCourier || 'econt'}
                  onChange={(e) => patchSender({ defaultCourier: e.target.value })}
                  helperText={t('admin.couriers.sender.defaultCourierHint')}
                >
                  {courierIds.map((id) => (
                    <MenuItem key={id} value={id}>{t(`admin.orderDetail.couriers.${id}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </AdminFieldGroup>
        </Stack>
      ) : selectedAccount ? (
        <CourierAccountForm
          id={tab}
          account={selectedAccount}
          modeKey={modeKey}
          onChange={(patch) => patchAccount(tab, patch)}
        />
      ) : (
        <Typography sx={{ color: brand.textSecondary }}>{t('common.loading', { defaultValue: 'Loading…' })}</Typography>
      )}
    </>
  )
}

function CourierAccountForm({
  id,
  account,
  modeKey,
  onChange,
}: {
  id: CourierIdKey
  account: ReturnType<typeof accountDraft>
  modeKey: string
  onChange: (patch: Partial<ReturnType<typeof accountDraft>>) => void
}) {
  const { t } = useTranslation()
  const ready = Boolean(account.enabled && account.configured)

  return (
    <Stack spacing={2.5}>
      <AdminFieldGroup title={t('admin.couriers.connection')} hint={t(`admin.couriers.cards.${id}`)}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={t(`admin.couriers.modes.${modeKey}`)}
            sx={{
              fontWeight: 700,
              bgcolor: ready ? brand.plantGreenMuted : brand.surface,
              color: ready ? brand.plantGreenDark : brand.textSecondary,
            }}
          />
        </Stack>
        <FormControlLabel
          control={<Switch checked={account.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />}
          label={t('admin.couriers.enabled')}
        />
        <FormControlLabel
          control={<Switch checked={account.testMode} onChange={(e) => onChange({ testMode: e.target.checked })} />}
          label={t('admin.couriers.testMode')}
        />
        <TextField
          label={t('admin.couriers.apiUrl')}
          value={account.apiUrl ?? ''}
          onChange={(e) => onChange({ apiUrl: e.target.value })}
          helperText={t(`admin.couriers.apiUrlHint.${id}`)}
        />
        {id === 'dhl' ? (
          <TextField label={t('admin.couriers.siteId')} value={account.siteId ?? ''} onChange={(e) => onChange({ siteId: e.target.value })} />
        ) : (
          <TextField label={t('admin.couriers.username')} value={account.username ?? ''} onChange={(e) => onChange({ username: e.target.value })} />
        )}
        <TextField
          type="password"
          label={t('admin.couriers.password')}
          value={account.password ?? ''}
          onChange={(e) => onChange({ password: e.target.value })}
          helperText={account.hasPassword ? t('admin.couriers.passwordKeep') : t('admin.couriers.passwordHint')}
          autoComplete="new-password"
        />
      </AdminFieldGroup>

      <AdminFieldGroup title={t('admin.couriers.location')} hint={t('admin.couriers.locationHint')}>
        <Grid container spacing={1.75}>
          <CourierLocationFields
            courier={id}
            countryCode={account.countryCode ?? ''}
            cityId={account.cityId ?? ''}
            cityName={account.cityName ?? ''}
            officeCode={account.officeCode ?? ''}
            credentialsReady={id === 'econt' || id === 'boxnow' || account.hasPassword}
            onChange={onChange}
          />
        </Grid>
      </AdminFieldGroup>

      <AdminFieldGroup title={t('admin.couriers.account')} hint={t('admin.couriers.accountHint')}>
        <Grid container spacing={1.75}>
          {id === 'speedy' || id === 'econt' || id === 'boxnow' ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('admin.couriers.clientId')}
                value={account.clientId ?? ''}
                onChange={(e) => onChange({ clientId: e.target.value })}
              />
            </Grid>
          ) : null}
          {id === 'speedy' ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('admin.couriers.contractId')}
                value={account.contractId ?? ''}
                onChange={(e) => onChange({ contractId: e.target.value })}
              />
            </Grid>
          ) : null}
          {id === 'dhl' ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('admin.couriers.accountNumber')}
                value={account.accountNumber ?? ''}
                onChange={(e) => onChange({ accountNumber: e.target.value })}
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t('admin.couriers.iban')}
              value={account.iban ?? ''}
              onChange={(e) => onChange({ iban: e.target.value })}
              helperText={t('admin.couriers.ibanHint')}
            />
          </Grid>
        </Grid>
      </AdminFieldGroup>

      <AdminFieldGroup title={t('admin.couriers.defaults')} hint={t('admin.couriers.defaultsHint')}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t('admin.couriers.serviceType')}
              value={account.serviceType ?? ''}
              onChange={(e) => onChange({ serviceType: e.target.value })}
              helperText={t(`admin.couriers.serviceTypeHint.${id}`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label={t('admin.couriers.payer')}
              value={account.payer || 'sender'}
              onChange={(e) => onChange({ payer: e.target.value })}
            >
              <MenuItem value="sender">{t('admin.couriers.payers.sender')}</MenuItem>
              <MenuItem value="receiver">{t('admin.couriers.payers.receiver')}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label={t('admin.orderDetail.weight')}
              value={account.defaultWeightKg ?? 1.5}
              onChange={(e) => onChange({ defaultWeightKg: Number(e.target.value) || 1.5 })}
              slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label={t('admin.orderDetail.packages')}
              value={account.defaultPackages ?? 1}
              onChange={(e) => onChange({ defaultPackages: Number(e.target.value) || 1 })}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              label={t('admin.couriers.labelFormat')}
              value={account.labelFormat || 'pdf'}
              onChange={(e) => onChange({ labelFormat: e.target.value })}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="zpl">ZPL</MenuItem>
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              label={t('admin.couriers.contents')}
              value={account.contents ?? ''}
              onChange={(e) => onChange({ contents: e.target.value })}
              helperText={t('admin.couriers.contentsHint')}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label={t('admin.couriers.notes')}
              value={account.notes ?? ''}
              onChange={(e) => onChange({ notes: e.target.value })}
              multiline
              rows={3}
              helperText={t('admin.couriers.notesHint')}
            />
          </Grid>
        </Grid>
      </AdminFieldGroup>
    </Stack>
  )
}

function SenderCountryField({ value, onChange }: { value: string; onChange: (country: string) => void }) {
  const { t, i18n } = useTranslation()
  const [countries, setCountries] = useState<CourierPlace[]>([])
  const selected = countries.find((item) => item.code === value || item.id === value) ?? null

  useEffect(() => {
    void couriersApi.countries('econt').then((data) => {
      setCountries(
        [...data.items].sort((a, b) =>
          senderCountryLabel(a, i18n.language).localeCompare(senderCountryLabel(b, i18n.language), i18n.language),
        ),
      )
    })
  }, [i18n.language])

  return (
    <Autocomplete
      options={countries}
      value={selected}
      getOptionLabel={(item) => senderCountryLabel(item, i18n.language)}
      isOptionEqualToValue={(a, b) => a.id === b.id || a.code === b.code}
      filterOptions={(options, state) => {
        const q = state.inputValue.trim().toLowerCase()
        const filtered = q
          ? options.filter((item) => senderCountryLabel(item, i18n.language).toLowerCase().includes(q))
          : options
        return q ? filtered.slice(0, 200) : filtered.slice(0, 80)
      }}
      onChange={(_, item) => onChange(item?.code?.length === 2 ? item.code.toUpperCase() : 'BG')}
      renderInput={(params) => <TextField {...params} label={t('admin.couriers.sender.country')} />}
    />
  )
}

function senderCountryLabel(place: CourierPlace, language: string) {
  const iso = (place.code.length === 2 ? place.code : place.id.length === 2 ? place.id : '').toUpperCase()
  if (iso.length === 2) return countryDisplayName(iso, language)
  return place.name
}

function payload(account: UpdateCourierAccountPayload): UpdateCourierAccountPayload {
  return {
    enabled: account.enabled,
    testMode: account.testMode,
    username: account.username,
    password: account.password || undefined,
    siteId: account.siteId,
    apiUrl: account.apiUrl,
    officeCode: account.officeCode,
    clientId: account.clientId,
    contractId: account.contractId,
    accountNumber: account.accountNumber,
    iban: account.iban,
    serviceType: account.serviceType,
    contents: account.contents,
    payer: account.payer,
    defaultWeightKg: account.defaultWeightKg,
    defaultPackages: account.defaultPackages,
    labelFormat: account.labelFormat,
    notes: account.notes,
    countryCode: account.countryCode,
    cityId: account.cityId,
    cityName: account.cityName,
  }
}
