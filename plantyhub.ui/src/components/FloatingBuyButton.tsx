import { useEffect, useState } from 'react'
import Fab from '@mui/material/Fab'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

export default function FloatingBuyButton() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <Fab
      component={RouterLink}
      to={navHrefs.buy}
      variant="extended"
      aria-label={t('nav.buyNow')}
      sx={{
        position: 'fixed',
        bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1200,
        bgcolor: brand.plantGreen,
        color: brand.white,
        fontWeight: 800,
        fontSize: '0.9rem',
        px: 2.5,
        boxShadow: brand.shadowGreen,
        '&:hover': { bgcolor: brand.plantGreenDark },
        animation: 'fadeUp 0.35s ease-out both',
      }}
    >
      <ShoppingBagOutlinedIcon sx={{ mr: 1 }} />
      {t('nav.buyNow')}
    </Fab>
  )
}
