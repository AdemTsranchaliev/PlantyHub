import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
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
import { couriersApi } from '../../api'
import type { ApiCourierSettings } from '../../api/types'
import { useOrdersStore } from '../../hooks/useOrders'
import { brand } from '../../theme'

const courierIds: CourierId[] = ['econt', 'speedy', 'dhl', 'boxnow']

type Props = {
  open: boolean
  orderId: string
  codAmount?: string
  onClose: () => void
}

export default function CreateWaybillDialog({ open, orderId, codAmount, onClose }: Props) {
  const { t } = useTranslation()
  const { createWaybill } = useOrdersStore()
  const [courier, setCourier] = useState<CourierId>('econt')
  const [weightKg, setWeightKg] = useState('1.5')
  const [packages, setPackages] = useState('1')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState<ApiCourierSettings | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    void couriersApi
      .get()
      .then((data) => {
        setSettings(data)
        const nextCourier = (courierIds.includes(data.sender.defaultCourier as CourierId)
          ? data.sender.defaultCourier
          : 'econt') as CourierId
        setCourier(nextCourier)
        const account = data[nextCourier]
        setWeightKg(String(account.defaultWeightKg || 1.5))
        setPackages(String(account.defaultPackages || 1))
      })
      .catch(() => setSettings(null))
  }, [open])

  const selected = settings?.[courier]
  const modeKey = selected?.mode === 'sandbox' || selected?.mode === 'live' ? selected.mode : 'manual'

  const handleCourierChange = (id: CourierId) => {
    setCourier(id)
    const account = settings?.[id]
    if (!account) return
    setWeightKg(String(account.defaultWeightKg || 1.5))
    setPackages(String(account.defaultPackages || 1))
  }

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
      })
      onClose()
      setNotes('')
    } catch {
      setError(t('admin.orderDetail.waybillFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalShippingRounded sx={{ color: brand.plantGreen }} />
        {t('admin.orderDetail.createWaybill')}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', mb: 2 }}>
          {t('admin.orderDetail.createWaybillHint')}
        </Typography>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label={t('admin.orderDetail.courier')}
            value={courier}
            onChange={(e) => handleCourierChange(e.target.value as CourierId)}
            helperText={t(`admin.couriers.modes.${modeKey}`)}
          >
            {courierIds.map((id) => (
              <MenuItem key={id} value={id}>
                {t(`admin.orderDetail.couriers.${id}`)}
              </MenuItem>
            ))}
          </TextField>
          {selected ? (
            <Chip
              size="small"
              label={t(`admin.couriers.modes.${modeKey}`)}
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
          {error ? (
            <Typography sx={{ color: '#C62828', fontSize: '0.82rem', fontWeight: 600 }}>{error}</Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t('admin.productEdit.cancel')}</Button>
        <Button variant="contained" onClick={() => void handleCreate()} disabled={submitting}>
          {t('admin.orderDetail.createWaybillSubmit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
