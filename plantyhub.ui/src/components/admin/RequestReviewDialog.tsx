import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { reviewsApi } from '../../api'
import { ApiError } from '../../api/client'
import { activeLanguages } from '../../i18n/languages'
import { brand } from '../../theme'

export type ReviewProductChoice = { slug: string; name: string }

type Props = {
  open: boolean
  onClose: () => void
  email: string
  customerName: string
  orderId?: string
  products: ReviewProductChoice[]
}

export default function RequestReviewDialog({ open, onClose, email, customerName, orderId, products }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>([])
  const [language, setLanguage] = useState('bg')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(0)

  useEffect(() => {
    if (!open) return
    setSelected(products.map((product) => product.slug))
    setLanguage('bg')
    setError('')
    setSent(0)
  }, [open, products])

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]))
  }

  const send = async () => {
    const chosen = products.filter((product) => selected.includes(product.slug))
    if (chosen.length === 0) {
      setError(t('admin.reviews.errors.product'))
      return
    }
    setBusy(true)
    setError('')
    const failed: string[] = []
    let ok = 0
    for (const product of chosen) {
      try {
        await reviewsApi.send({
          productSlug: product.slug,
          email,
          customerName,
          orderId,
          language,
        })
        ok += 1
      } catch (err) {
        const code = err instanceof ApiError ? err.message : 'failed'
        failed.push(`${product.name}: ${t(`admin.reviews.errors.${code}`, { defaultValue: t('admin.reviews.errors.failed') })}`)
      }
    }
    setBusy(false)
    setSent(ok)
    if (failed.length > 0) setError(failed.join(' '))
    else onClose()
  }

  return (
    <Dialog open={open} onClose={() => { if (!busy) onClose() }} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin.reviews.requestTitle')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', mb: 2 }}>
          {t('admin.reviews.requestHint', { email })}
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          {products.map((product) => (
            <FormControlLabel
              key={product.slug}
              control={<Checkbox checked={selected.includes(product.slug)} onChange={() => toggle(product.slug)} />}
              label={product.name}
            />
          ))}
        </Stack>
        <TextField
          select
          fullWidth
          label={t('admin.reviews.language')}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {activeLanguages.map((language) => (
            <MenuItem key={language.code} value={language.code}>{language.label}</MenuItem>
          ))}
        </TextField>
        {sent > 0 ? (
          <Typography sx={{ color: brand.plantGreenDark, fontWeight: 700, mt: 2 }}>{t('admin.reviews.sentCount', { count: sent })}</Typography>
        ) : null}
        {error ? (
          <Typography sx={{ color: '#C62828', fontWeight: 700, mt: 1.5 }}>{error}</Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>{t('admin.productEdit.cancel')}</Button>
        <Button variant="contained" disabled={busy || products.length === 0} onClick={() => { void send() }}>
          {busy ? t('admin.reviews.sending') : t('admin.reviews.send')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
