import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded'
import { useTranslation } from 'react-i18next'
import type { CourierId } from '../../admin/orderDetails'
import { generateWaybillNumber } from '../../admin/orderDetails'
import { useOrdersStore } from '../../hooks/useOrders'
import { brand } from '../../theme'

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

  const handleCreate = async () => {
    const number = generateWaybillNumber(courier)
    setSubmitting(true)
    try {
      await createWaybill(orderId, {
        number,
        courier,
        weightKg: parseFloat(weightKg) || 1,
        packages: parseInt(packages, 10) || 1,
        codAmount,
        notes: notes.trim() || undefined,
      })
      onClose()
      setNotes('')
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
            onChange={(e) => setCourier(e.target.value as CourierId)}
            fullWidth
          >
            <MenuItem value="econt">{t('admin.orderDetail.couriers.econt')}</MenuItem>
            <MenuItem value="speedy">{t('admin.orderDetail.couriers.speedy')}</MenuItem>
            <MenuItem value="dhl">{t('admin.orderDetail.couriers.dhl')}</MenuItem>
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('admin.orderDetail.weight')}
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
              fullWidth
            />
            <TextField
              label={t('admin.orderDetail.packages')}
              type="number"
              value={packages}
              onChange={(e) => setPackages(e.target.value)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              fullWidth
            />
          </Stack>
          {codAmount && (
            <TextField
              label={t('admin.orderDetail.codAmount')}
              value={codAmount}
              disabled
              fullWidth
            />
          )}
          <TextField
            label={t('admin.orderDetail.waybillNotes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
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
