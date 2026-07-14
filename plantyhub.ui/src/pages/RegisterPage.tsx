import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import PersonAddRounded from '@mui/icons-material/PersonAddRounded'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../components/AuthPageLayout'
import { navHrefs } from '../data/catalog'
import { authApi } from '../api'
import { brand } from '../theme'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = {
  name?: boolean
  email?: boolean
  password?: boolean
  confirmPassword?: boolean
  terms?: boolean
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const handleResend = async () => {
    if (!submittedEmail) return
    try {
      const response = await authApi.resendVerification(submittedEmail)
      setResendMessage(response.message)
    } catch {
      setResendMessage(t('auth.verifyEmail.resendError', { defaultValue: 'Could not resend verification email.' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {
      name: name.trim().length < 2,
      email: !emailPattern.test(email.trim()),
      password: password.length < 6,
      confirmPassword: password !== confirmPassword,
      terms: !termsAccepted,
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setAuthError('')
    try {
      const response = await authApi.register({ name: name.trim(), email: email.trim(), password })
      setSubmittedEmail(response.email)
      setSubmitted(true)
    } catch {
      setAuthError(t('auth.register.error', { defaultValue: 'Could not create account. Email may already be in use.' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AuthPageLayout eyebrow={t('auth.register.eyebrow')} title={t('auth.register.title')} subtitle={t('auth.register.verifySubtitle', { email: submittedEmail })}>
        <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center', py: 1 }}>
          <CheckCircleRounded sx={{ fontSize: 56, color: brand.plantGreen }} />
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem' }}>
            {t('auth.register.verifyHint')}
          </Typography>
          <Button variant="outlined" fullWidth onClick={() => void handleResend()}>
            {t('auth.verifyEmail.resend')}
          </Button>
          {resendMessage && <Typography sx={{ fontSize: '0.85rem', color: brand.textSecondary }}>{resendMessage}</Typography>}
          <Button variant="contained" size="large" fullWidth onClick={() => navigate(navHrefs.login)}>
            {t('auth.register.goToLogin')}
          </Button>
        </Stack>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout eyebrow={t('auth.register.eyebrow')} title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          label={t('auth.register.name')}
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: false }))
          }}
          error={errors.name}
          helperText={errors.name ? t('auth.register.invalidName') : ' '}
          fullWidth
        />
        <TextField
          type="email"
          label={t('auth.register.email')}
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: false }))
          }}
          error={errors.email}
          helperText={errors.email ? t('auth.register.invalidEmail') : ' '}
          fullWidth
        />
        <TextField
          type="password"
          label={t('auth.register.password')}
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors((prev) => ({ ...prev, password: false }))
          }}
          error={errors.password}
          helperText={errors.password ? t('auth.register.invalidPassword') : ' '}
          fullWidth
        />
        <TextField
          type="password"
          label={t('auth.register.confirmPassword')}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: false }))
          }}
          error={errors.confirmPassword}
          helperText={errors.confirmPassword ? t('auth.register.passwordMismatch') : ' '}
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked)
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: false }))
              }}
              sx={{ color: errors.terms ? 'error.main' : brand.textSecondary, '&.Mui-checked': { color: brand.plantGreen } }}
            />
          }
          label={
            <Typography sx={{ fontSize: '0.88rem', color: errors.terms ? 'error.main' : brand.textSecondary, lineHeight: 1.5 }}>
              {t('auth.register.terms')}
            </Typography>
          }
        />

        {authError && (
          <Typography sx={{ color: 'error.main', fontSize: '0.9rem', textAlign: 'center' }}>{authError}</Typography>
        )}

        <Button type="submit" variant="contained" size="large" fullWidth startIcon={<PersonAddRounded />} disabled={submitting}>
          {submitting ? t('common.loading', { defaultValue: 'Loading…' }) : t('auth.register.submit')}
        </Button>

        <Box sx={{ textAlign: 'center', pt: 0.5 }}>
          <Typography component="span" sx={{ color: brand.textSecondary, fontSize: '0.95rem' }}>
            {t('auth.register.haveAccount')}{' '}
          </Typography>
          <Link component={RouterLink} to={navHrefs.login} underline="hover" sx={{ fontWeight: 700, color: brand.plantGreenDark }}>
            {t('auth.register.loginLink')}
          </Link>
        </Box>
      </Stack>
    </AuthPageLayout>
  )
}
