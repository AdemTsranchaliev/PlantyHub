import { useEffect, useState } from 'react'
import Fab from '@mui/material/Fab'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCookieConsent } from '../analytics/consent'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

const hiddenPathPrefixes = ['/cart', '/checkout', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/account', '/order', '/learn', '/privacy', '/cookies', '/terms', '/faq', '/contact', '/support']

export default function FloatingBuyButton() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { bannerOpen } = useCookieConsent()
  const [visible, setVisible] = useState(false)

  const hidden = hiddenPathPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  useEffect(() => {
    if (hidden) {
      setVisible(false)
      return
    }
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hidden])

  if (hidden || !visible) return null

  return (
    <Fab
      component={RouterLink}
      to={navHrefs.buy}
      variant="extended"
      aria-label={t('nav.buyNow')}
      sx={{
        position: 'fixed',
        bottom: bannerOpen
          ? { xs: 'calc(132px + env(safe-area-inset-bottom))', sm: 24 }
          : { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1200,
        bgcolor: brand.plantGreen,
        color: brand.white,
        fontWeight: 800,
        fontSize: { xs: '0.82rem', sm: '0.9rem' },
        minHeight: brand.touchMin,
        px: { xs: 2, sm: 2.5 },
        boxShadow: brand.shadowGreen,
        '&:hover': { bgcolor: brand.plantGreenDark },
        animation: 'fadeUp 0.35s ease-out both',
      }}
    >
      <ShoppingBagOutlinedIcon sx={{ mr: 1, fontSize: 20 }} />
      {t('nav.buyNow')}
    </Fab>
  )
}
