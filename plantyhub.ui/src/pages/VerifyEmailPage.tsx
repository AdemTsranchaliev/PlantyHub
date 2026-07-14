import { useEffect, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import AuthPageLayout from '../components/AuthPageLayout'
import { navHrefs } from '../data/catalog'
import { authApi } from '../api'
import { brand } from '../theme'

export default function VerifyEmailPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const userId = params.get('userId') ?? ''
  const token = params.get('token') ?? ''
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (!userId || !token) {
      setMessage(t('auth.verifyEmail.invalidLink'))
      setLoading(false)
      return
    }

    void authApi
      .verifyEmail({ userId, token })
      .then((response) => {
        setMessage(response.message)
        setSuccess(true)
      })
      .catch(() => {
        setMessage(t('auth.verifyEmail.error', { defaultValue: 'Invalid or expired verification link.' }))
      })
      .finally(() => setLoading(false))
  }, [userId, token, t])

  return (
    <AuthPageLayout
      eyebrow={t('auth.verifyEmail.eyebrow')}
      title={t('auth.verifyEmail.title')}
      subtitle={loading ? t('auth.verifyEmail.loading') : message}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress sx={{ color: brand.plantGreen }} />
        </Box>
      ) : (
        <Stack spacing={2}>
          <Button variant="contained" size="large" fullWidth component={RouterLink} to={navHrefs.login}>
            {success ? t('auth.verifyEmail.goToLogin') : t('auth.verifyEmail.backToLogin')}
          </Button>
        </Stack>
      )}
    </AuthPageLayout>
  )
}
