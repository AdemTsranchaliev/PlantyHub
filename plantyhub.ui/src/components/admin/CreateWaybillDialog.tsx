import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded'
import { useTranslation } from 'react-i18next'
import type { CourierId } from '../../admin/orderDetails'
import { couriersApi, ordersApi } from '../../api'
import { ApiError } from '../../api/client'
import type { ApiCourierSettings, EcontCheckResult } from '../../api/types'
import { useOrdersStore } from '../../hooks/useOrders'
import { brand } from '../../theme'

const courierIds: CourierId[] = ['econt', 'speedy', 'dhl', 'boxnow']

function enabledCouriers(settings: ApiCourierSettings | null): CourierId[] {
  if (!settings) return ['econt']
  const enabled = courierIds.filter((id) => settings[id]?.enabled)
  return enabled.length > 0 ? enabled : ['econt']
}

type Props = {
  open: boolean
  orderId: string
  defaultCourier?: string
  codAmount?: string
  purpose?: 'shipment' | 'return' | 'replacement'
  onClose: () => void
  onCreated?: () => void
}

export default function CreateWaybillDialog({ open, orderId, defaultCourier, codAmount, purpose = 'shipment', onClose, onCreated }: Props) {
  const { t } = useTranslation()
  const { createWaybill } = useOrdersStore()
  const [courier, setCourier] = useState<CourierId>('econt')
  const [weightKg, setWeightKg] = useState('1.5')
  const [packages, setPackages] = useState('1')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState<ApiCourierSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [check, setCheck] = useState<EcontCheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [payer, setPayer] = useState<'customer' | 'merchant'>(purpose === 'shipment' ? 'customer' : 'merchant')
  const direction = purpose === 'return' ? 'customer_to_merchant' : 'merchant_to_customer'

  useEffect(() => {
    if (!open) return
    setCheck(null)
    setError(null)
    setPayer(purpose === 'shipment' ? 'customer' : 'merchant')
    void couriersApi
      .get()
      .then((data) => {
        setSettings(data)
        const choices = enabledCouriers(data)
        const preferred = (defaultCourier || data.sender.defaultCourier) as CourierId
        const nextCourier = choices.includes(preferred) ? preferred : choices[0]
        setCourier(nextCourier)
        const account = data[nextCourier]
        setWeightKg(String(account.defaultWeightKg || 1.5))
        setPackages(String(account.defaultPackages || 1))
      })
      .catch(() => setSettings(null))
  }, [open, defaultCourier, purpose])

  useEffect(() => {
    if (!open || courier !== 'econt') {
      setCheck(null)
      return
    }
    let cancelled = false
    setChecking(true)
    const timer = window.setTimeout(() => {
      void ordersApi
        .checkEcont(orderId, {
          courier,
          weightKg: parseFloat(weightKg) || 1.5,
          packages: parseInt(packages, 10) || 1,
        })
        .then((result) => {
          if (!cancelled) setCheck(result)
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(err instanceof ApiError ? err.message : t('admin.orderDetail.statusFailed'))
        })
        .finally(() => {
          if (!cancelled) setChecking(false)
        })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, orderId, courier, weightKg, packages, t])

  const selected = settings?.[courier]
  const modeKey = selected?.mode === 'sandbox' || selected?.mode === 'live' ? selected.mode : 'manual'

  const handleCourierChange = (id: CourierId) => {
    setCourier(id)
    setCheck(null)
    setError(null)
    const account = settings?.[id]
    if (!account) return
    setWeightKg(String(account.defaultWeightKg || 1.5))
    setPackages(String(account.defaultPackages || 1))
  }

  const blockingIssues = check?.issues.filter((issue) => issue.severity === 'error') ?? []

  const handleCreate = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await createWaybill(orderId, {
        courier,
        weightKg: parseFloat(weightKg) || 1,
        packages: parseInt(packages, 10) || 1,
        codAmount,
        notes: notes.trim() || undefined,
        payer,
      })
      onCreated?.()
      onClose()
      setNotes('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.orderDetail.waybillFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalShippingRounded sx={{ color: brand.plantGreen }} />
        {purpose === 'return'
          ? t('admin.orderDetail.sendReturnWaybill')
          : purpose === 'replacement'
            ? t('admin.orderDetail.createReplacementWaybill')
            : t('admin.orderDetail.createWaybill')}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', mb: 2 }}>
          {purpose === 'return'
            ? t('admin.orderDetail.createReturnWaybillHint')
            : purpose === 'replacement'
              ? t('admin.orderDetail.createReplacementWaybillHint')
              : t('admin.orderDetail.createWaybillHint')}
        </Typography>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: brand.textSecondary }}>
              {t('admin.orderDetail.direction')}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', mt: 0.5 }}>
              {t(`admin.orderDetail.directions.${direction}`)}
            </Typography>
          </Box>
          <TextField
            select
            label={t('admin.orderDetail.payer')}
            value={payer}
            onChange={(e) => setPayer(e.target.value as 'customer' | 'merchant')}
          >
            <MenuItem value="customer">{t('admin.orderDetail.payers.customer')}</MenuItem>
            <MenuItem value="merchant">{t('admin.orderDetail.payers.merchant')}</MenuItem>
          </TextField>
          <TextField
            select
            label={t('admin.orderDetail.courier')}
            value={courier}
            onChange={(e) => handleCourierChange(e.target.value as CourierId)}
            helperText={t(`admin.couriers.modes.${modeKey}`)}
          >
            {enabledCouriers(settings).map((id) => (
              <MenuItem key={id} value={id}>
                {t(`admin.orderDetail.couriers.${id}`)}
              </MenuItem>
            ))}
          </TextField>
          {selected ? (
            <Chip
              size="small"
              label={courier === 'econt' && modeKey === 'sandbox' ? t('admin.orderDetail.econtDemo') : t(`admin.couriers.modes.${modeKey}`)}
              sx={{
                alignSelf: 'flex-start',
                fontWeight: 700,
                bgcolor: selected.configured && selected.enabled ? brand.plantGreenMuted : brand.surface,
                color: selected.configured && selected.enabled ? brand.plantGreenDark : brand.textSecondary,
              }}
            />
          ) : null}
          {settings?.sender.company ? (
            <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>
              {t('admin.orderDetail.waybillSender', {
                company: settings.sender.company,
                city: settings.sender.city,
              })}
            </Typography>
          ) : courier === 'econt' && modeKey === 'sandbox' ? (
            <Typography sx={{ fontSize: '0.82rem', color: brand.textSecondary }}>
              {t('admin.orderDetail.demoSender')}{' '}
              <Link component={RouterLink} to="/admin/couriers" underline="hover">
                {t('admin.nav.couriers')}
              </Link>
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.82rem', color: '#C47A4A' }}>
              {t('admin.orderDetail.waybillSenderMissing')}{' '}
              <Link component={RouterLink} to="/admin/couriers" underline="hover">
                {t('admin.nav.couriers')}
              </Link>
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('admin.orderDetail.weight')}
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
              helperText={t('admin.orderDetail.weightHint')}
            />
            <TextField
              label={t('admin.orderDetail.packages')}
              type="number"
              value={packages}
              onChange={(e) => setPackages(e.target.value)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              helperText={t('admin.orderDetail.packagesHint')}
            />
          </Stack>
          {codAmount && (
            <TextField label={t('admin.orderDetail.codAmount')} value={codAmount} disabled fullWidth />
          )}
          <TextField
            label={t('admin.orderDetail.waybillNotes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <Link component={RouterLink} to="/admin/couriers" underline="hover" sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
            {t('admin.orderDetail.editCourierProfile')}
          </Link>
          {courier === 'econt' && checking ? (
            <Typography sx={{ fontSize: '0.86rem', color: brand.textSecondary }}>{t('admin.orderDetail.checking')}</Typography>
          ) : null}
          {check ? (
            <Stack spacing={0.5}>
              {check.ok ? (
                <Typography sx={{ color: brand.plantGreenDark, fontSize: '0.88rem', fontWeight: 700 }}>{t('admin.orderDetail.checkOk')}</Typography>
              ) : null}
              {check.issues.map((issue, index) => (
                <Typography key={`${issue.code}-${index}`} sx={{ color: issue.severity === 'error' ? '#C62828' : '#C47A4A', fontSize: '0.86rem', fontWeight: 600 }}>
                  {issue.code === 'econt' && issue.message
                    ? issue.message
                    : t(`admin.orderDetail.checkIssues.${issue.code}`, { defaultValue: issue.message || issue.code })}
                </Typography>
              ))}
              {check.price != null ? (
                <Typography sx={{ fontSize: '0.86rem', color: brand.textSecondary }}>
                  {t('admin.orderDetail.checkPrice', { price: check.price, currency: check.currency || '' })}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          {error ? (
            <Typography sx={{ color: '#C62828', fontSize: '0.82rem', fontWeight: 600 }}>{error}</Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t('admin.productEdit.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => void handleCreate()}
          disabled={submitting || checking || blockingIssues.length > 0}
        >
          {t('admin.orderDetail.createWaybillSubmit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
