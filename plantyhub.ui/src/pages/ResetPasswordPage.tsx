import { useEffect, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LockResetRounded from '@mui/icons-material/LockResetRounded'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../components/AuthPageLayout'
import { navHrefs } from '../data/catalog'
import { authApi } from '../api'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({ password: false, confirmPassword: false })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (!email || !token) {
    return (
      <AuthPageLayout
        eyebrow={t('auth.resetPassword.eyebrow')}
        title={t('auth.resetPassword.title')}
        subtitle={t('auth.resetPassword.invalidLink')}
      >
        <Button variant="contained" size="large" fullWidth component={RouterLink} to={navHrefs.forgotPassword}>
          {t('auth.resetPassword.requestNew')}
        </Button>
      </AuthPageLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = {
      password: password.length < 6,
      confirmPassword: password !== confirmPassword,
    }
    setErrors(nextErrors)
    if (nextErrors.password || nextErrors.confirmPassword) return

    setSubmitting(true)
    setAuthError('')
    try {
      const response = await authApi.resetPassword({ email, token, newPassword: password })
      setMessage(response.message)
    } catch {
      setAuthError(t('auth.resetPassword.error', { defaultValue: 'Could not reset password. The link may have expired.' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageLayout
      eyebrow={t('auth.resetPassword.eyebrow')}
      title={t('auth.resetPassword.title')}
      subtitle={message || t('auth.resetPassword.subtitle')}
    >
      {message ? (
        <Button variant="contained" size="large" fullWidth component={RouterLink} to={navHrefs.login}>
          {t('auth.resetPassword.backToLogin')}
        </Button>
      ) : (
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField type="email" label={t('auth.resetPassword.email')} value={email} disabled fullWidth />
          <TextField
            type="password"
            label={t('auth.resetPassword.password')}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: false }))
            }}
            error={errors.password}
            helperText={errors.password ? t('auth.resetPassword.invalidPassword') : ' '}
            fullWidth
          />
          <TextField
            type="password"
            label={t('auth.resetPassword.confirmPassword')}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: false }))
            }}
            error={errors.confirmPassword}
            helperText={errors.confirmPassword ? t('auth.resetPassword.passwordMismatch') : ' '}
            fullWidth
          />
          {authError && <Typography sx={{ color: 'error.main', fontSize: '0.9rem' }}>{authError}</Typography>}
          <Button type="submit" variant="contained" size="large" fullWidth startIcon={<LockResetRounded />} disabled={submitting}>
            {t('auth.resetPassword.submit')}
          </Button>
        </Stack>
      )}
    </AuthPageLayout>
  )
}
