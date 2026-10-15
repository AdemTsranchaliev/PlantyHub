import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { syncAnalytics, trackPageView } from '../measure/visits'
import { syncTags, trackTagPageView } from '../measure/tags'
import { setCookieConsent, useCookieConsent } from '../measure/consent'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

export default function AnalyticsConsent() {
  const { t } = useTranslation()
  const { consent, bannerOpen } = useCookieConsent()
  const location = useLocation()

  useEffect(() => {
    syncAnalytics(consent)
    syncTags(consent)
  }, [consent])

  useEffect(() => {
    if (consent === 'granted') {
      trackPageView()
      trackTagPageView()
    }
  }, [consent, location.pathname, location.search, location.hash])

  if (!bannerOpen) return null

  return (
    <Box
      role="dialog"
      aria-labelledby="cookie-consent-title"
      sx={{
        position: 'fixed',
        zIndex: 1400,
        left: { xs: 12, sm: 24 },
        right: { xs: 12, sm: 'auto' },
        bottom: 'calc(12px + env(safe-area-inset-bottom))',
        width: { sm: 340 },
        bgcolor: brand.white,
        color: brand.graphite,
        border: `1px solid ${brand.creamBorder}`,
        borderRadius: '16px',
        boxShadow: brand.shadowHover,
        p: 1.5,
      }}
    >
      <Typography id="cookie-consent-title" sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.35 }}>
        {t('cookieConsent.body')}
      </Typography>
      <Link component={RouterLink} to={navHrefs.cookies} underline="hover" sx={{ color: brand.plantGreenDark, fontWeight: 700, fontSize: '0.82rem' }}>
        {t('cookieConsent.policy')}
      </Link>
      <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
        <Button size="small" variant="outlined" color="inherit" onClick={() => setCookieConsent('denied')} sx={{ flex: 1, color: brand.graphite, borderColor: brand.creamBorder }}>
          {t('cookieConsent.reject')}
        </Button>
        <Button size="small" variant="contained" onClick={() => setCookieConsent('granted')} sx={{ flex: 1 }}>
          {t('cookieConsent.accept')}
        </Button>
      </Stack>
    </Box>
  )
}
