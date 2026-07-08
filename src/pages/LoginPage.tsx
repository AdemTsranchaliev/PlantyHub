import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import LoginRounded from '@mui/icons-material/LoginRounded'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../components/AuthPageLayout'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = {
  email?: boolean
  password?: boolean
}

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {
      email: !emailPattern.test(email.trim()),
      password: password.length < 6,
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    const user = { email: email.trim() }
    if (rememberMe) {
      localStorage.setItem('plantyhub_user', JSON.stringify(user))
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthPageLayout eyebrow={t('auth.login.eyebrow')} title={t('auth.login.title')} subtitle={t('auth.login.success')}>
        <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center', py: 1 }}>
          <CheckCircleRounded sx={{ fontSize: 56, color: brand.plantGreen }} />
          <Button variant="contained" size="large" fullWidth onClick={() => navigate('/')}>
            {t('auth.login.continue')}
          </Button>
        </Stack>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout eyebrow={t('auth.login.eyebrow')} title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          type="email"
          label={t('auth.login.email')}
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: false }))
          }}
          error={errors.email}
          helperText={errors.email ? t('auth.login.invalidEmail') : ' '}
          fullWidth
        />
        <TextField
          type="password"
          label={t('auth.login.password')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors((prev) => ({ ...prev, password: false }))
          }}
          error={errors.password}
          helperText={errors.password ? t('auth.login.invalidPassword') : ' '}
          fullWidth
        />

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{ color: brand.textSecondary, '&.Mui-checked': { color: brand.plantGreen } }}
              />
            }
            label={<Typography sx={{ fontSize: '0.9rem', color: brand.textSecondary }}>{t('auth.login.rememberMe')}</Typography>}
          />
          <Link href="mailto:support@plantyhub.com" underline="hover" sx={{ fontSize: '0.9rem', fontWeight: 600, color: brand.plantGreenDark }}>
            {t('auth.login.forgotPassword')}
          </Link>
        </Stack>

        <Button type="submit" variant="contained" size="large" fullWidth startIcon={<LoginRounded />}>
          {t('auth.login.submit')}
        </Button>

        <Box sx={{ textAlign: 'center', pt: 0.5 }}>
          <Typography component="span" sx={{ color: brand.textSecondary, fontSize: '0.95rem' }}>
            {t('auth.login.noAccount')}{' '}
          </Typography>
          <Link component={RouterLink} to={navHrefs.register} underline="hover" sx={{ fontWeight: 700, color: brand.plantGreenDark }}>
            {t('auth.login.registerLink')}
          </Link>
        </Box>
      </Stack>
    </AuthPageLayout>
  )
}
