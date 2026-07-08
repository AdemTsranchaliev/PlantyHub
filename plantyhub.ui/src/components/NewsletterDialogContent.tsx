import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import CloseRounded from '@mui/icons-material/CloseRounded'
import CardGiftcardRounded from '@mui/icons-material/CardGiftcardRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import { useTranslation } from 'react-i18next'
import { newsletterApi } from '../api'
import { brand } from '../theme'

const DISCOUNT_CODE = 'PLANTY5'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Props = {
  open: boolean
  onClose: () => void
  onSubscribed: () => void
}

export default function NewsletterDialogContent({ open, onClose, onSubscribed }: Props) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailPattern.test(email.trim())) {
      setError(true)
      return
    }
    setError(false)
    setSubmitError(false)
    setSubmitting(true)
    try {
      await newsletterApi.subscribe(email.trim())
      setSubmitted(true)
      onSubscribed()
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', overflow: 'hidden' } } }}
    >
      <Box sx={{ position: 'relative', p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <IconButton
          onClick={onClose}
          aria-label={t('common.closeMenu')}
          sx={{ position: 'absolute', top: 8, right: 8, color: brand.textSecondary }}
        >
          <CloseRounded />
        </IconButton>

        {submitted ? (
          <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
            <CheckCircleRounded sx={{ fontSize: 56, color: brand.plantGreen }} />
            <Typography component="h2" variant="h3" sx={{ fontSize: '1.5rem', color: brand.graphite }}>
              {t('newsletter.successTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, lineHeight: 1.6 }}>
              {t('newsletter.success')}
            </Typography>
            <Tooltip title={copied ? t('newsletter.copied') : t('newsletter.copy')} arrow>
              <Box
                component="button"
                type="button"
                onClick={handleCopy}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  px: 3,
                  py: 1.5,
                  borderRadius: '14px',
                  border: `2px dashed ${brand.plantGreen}`,
                  bgcolor: brand.plantGreenMuted,
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              >
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.08em', color: brand.plantGreenDark }}>
                  {DISCOUNT_CODE}
                </Typography>
                <ContentCopyRounded sx={{ fontSize: 18, color: brand.plantGreenDark }} />
              </Box>
            </Tooltip>
            <Button variant="contained" onClick={onClose} sx={{ mt: 1 }}>
              {t('newsletter.done')}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: brand.plantGreenMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CardGiftcardRounded sx={{ fontSize: 32, color: brand.plantGreenDark }} />
            </Box>
            <Typography
              sx={{
                display: 'inline-block',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: brand.plantGreen,
                bgcolor: brand.plantGreenMuted,
                borderRadius: 999,
                px: 1.5,
                py: 0.5,
              }}
            >
              {t('newsletter.badge')}
            </Typography>
            <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '1.7rem' }, color: brand.graphite }}>
              {t('newsletter.title')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, lineHeight: 1.6, fontSize: '0.98rem' }}>
              {t('newsletter.subtitle')}
            </Typography>

            <Stack component="form" onSubmit={handleSubmit} spacing={1.5} sx={{ width: '100%', mt: 1 }}>
              <TextField
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(false)
                }}
                placeholder={t('newsletter.placeholder')}
                error={error}
                helperText={error ? t('newsletter.invalid') : submitError ? t('newsletter.error', { defaultValue: 'Could not subscribe. Please try again.' }) : ' '}
                fullWidth
                size="medium"
                aria-label={t('newsletter.placeholder')}
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                {submitting ? t('common.loading', { defaultValue: 'Loading…' }) : t('newsletter.button')}
              </Button>
            </Stack>

            <Button onClick={onClose} sx={{ color: brand.textSecondary, fontWeight: 600 }}>
              {t('newsletter.dismiss')}
            </Button>
            <Typography variant="caption" sx={{ color: brand.textSecondary, opacity: 0.8 }}>
              {t('newsletter.disclaimer')}
            </Typography>
          </Stack>
        )}
      </Box>
    </Dialog>
  )
}
