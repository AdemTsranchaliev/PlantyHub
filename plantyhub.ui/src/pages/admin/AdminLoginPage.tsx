import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { brand } from '../../theme'
import { isAdminAuthenticated, loginAdmin } from '../../admin/auth'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailPattern.test(email.trim()) || password.length < 6) {
      setError(true)
      return
    }
    setSubmitting(true)
    const user = await loginAdmin(email, password)
    setSubmitting(false)
    if (user) {
      navigate('/admin')
    } else {
      setError(true)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: brand.surface,
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: brand.white,
          borderRadius: '28px',
          border: `1px solid ${brand.border}`,
          boxShadow: brand.shadowHover,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: brand.plantGreenMuted,
              color: brand.plantGreen,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AdminPanelSettingsRounded />
          </Box>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: brand.plantGreen,
              bgcolor: brand.plantGreenMuted,
              borderRadius: 999,
              px: 1.5,
              py: 0.6,
              mb: 2,
            }}
          >
            {t('admin.login.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h4" sx={{ color: brand.graphite, fontSize: '1.6rem', mb: 1 }}>
            {t('admin.login.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem' }}>{t('admin.login.subtitle')}</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {t('admin.login.error')}
          </Alert>
        )}

        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            type="email"
            label={t('admin.login.email')}
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(false)
            }}
            fullWidth
          />
          <TextField
            type="password"
            label={t('admin.login.password')}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth startIcon={<AdminPanelSettingsRounded />} disabled={submitting}>
            {t('admin.login.submit')}
          </Button>
        </Stack>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.85rem', color: brand.textSecondary }}>
          <RouterLink to="/" style={{ color: brand.plantGreenDark, fontWeight: 700, textDecoration: 'none' }}>
            {t('admin.login.backToStore')}
          </RouterLink>
        </Typography>
      </Box>
    </Box>
  )
}
