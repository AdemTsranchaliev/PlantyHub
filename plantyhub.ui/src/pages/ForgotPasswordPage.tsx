import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../components/AuthPageLayout'
import { navHrefs } from '../data/catalog'
import { authApi } from '../api'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailPattern.test(email.trim())) {
      setError(true)
      return
    }
    setSubmitting(true)
    setError(false)
    try {
      const response = await authApi.forgotPassword(email.trim())
      setMessage(response.message)
    } catch {
      setMessage(t('auth.forgotPassword.error', { defaultValue: 'Could not send reset email. Try again later.' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageLayout
      eyebrow={t('auth.forgotPassword.eyebrow')}
      title={t('auth.forgotPassword.title')}
      subtitle={message || t('auth.forgotPassword.subtitle')}
    >
      {message ? (
        <Stack spacing={2}>
          <Button variant="contained" size="large" fullWidth component={RouterLink} to={navHrefs.login}>
            {t('auth.forgotPassword.backToLogin')}
          </Button>
        </Stack>
      ) : (
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            type="email"
            label={t('auth.forgotPassword.email')}
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(false)
            }}
            error={error}
            helperText={error ? t('auth.forgotPassword.invalidEmail') : ' '}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth startIcon={<MailOutlineRounded />} disabled={submitting}>
            {t('auth.forgotPassword.submit')}
          </Button>
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem' }}>
            <RouterLink to={navHrefs.login} style={{ fontWeight: 700, textDecoration: 'none' }}>
              {t('auth.forgotPassword.backToLogin')}
            </RouterLink>
          </Typography>
        </Stack>
      )}
    </AuthPageLayout>
  )
}
