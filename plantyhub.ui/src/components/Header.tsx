import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import CloseIcon from '@mui/icons-material/Close'
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { pagePaddingX } from './SectionContainer'
import { navHrefs } from '../data/catalog'
import { resolveHref } from '../paths'
import { useCart } from '../hooks/useCart'
import { useCustomerAuth } from '../hooks/useCustomerAuth'
import { hasAdminRole } from '../auth/session'
import { brand } from '../theme'

const desktopNavKeys = [
  { key: 'product', href: navHrefs.product },
  { key: 'howItWorks', href: navHrefs.howItWorks },
  { key: 'pods', href: navHrefs.pods },
  { key: 'accessories', href: navHrefs.accessories },
  { key: 'about', href: navHrefs.about },
] as const

const mobileNavKeys = [
  ...desktopNavKeys,
  { key: 'blog', href: navHrefs.blog },
  { key: 'learn', href: navHrefs.learn },
  { key: 'faq', href: navHrefs.faq },
  { key: 'contact', href: navHrefs.contact },
] as const

const headerTextButtonSx = {
  display: { xs: 'none', md: 'inline-flex' },
  flexShrink: 0,
  whiteSpace: 'nowrap',
  color: brand.plantGreenDark,
  fontWeight: 700,
  fontSize: '0.85rem',
  minHeight: 40,
  height: 40,
  px: 1.25,
  py: 0,
  lineHeight: 1,
} as const

export default function Header() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const onProduct = pathname === navHrefs.buy
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount: cartCount } = useCart()
  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const isAdmin = hasAdminRole(customer?.roles)

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: brand.graphite,
          borderBottom: `1px solid ${brand.border}`,
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            justifyContent: 'space-between',
            gap: { xs: 0.5, sm: 1 },
            minHeight: { xs: 48, sm: 60, md: 68 },
            py: { xs: 0.25, md: 1 },
            px: pagePaddingX,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 }, flex: '0 0 auto', minWidth: 0 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: 'none' }, color: brand.graphite, ml: { xs: -0.5, sm: 0 } }}
              aria-label={t('header.openMenu')}
            >
              <MenuIcon />
            </IconButton>
            <Link component={RouterLink} to="/" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Logo size="md" />
            </Link>
          </Box>

          <Box
            component="nav"
            aria-label="Main"
            sx={{
              display: { xs: 'none', lg: 'flex' },
              gap: { lg: 2, xl: 3 },
              flex: '1 1 auto',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            {desktopNavKeys.map((link) => (
              <Link
                key={link.href}
                href={resolveHref(link.href)}
                underline="none"
                color="inherit"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  py: 0.5,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: 2,
                    bgcolor: brand.plantGreen,
                    transform: 'scaleX(0)',
                    transition: 'transform 0.2s ease',
                    borderRadius: 1,
                  },
                  '&:hover': { color: brand.plantGreenDark },
                  '&:hover::after': { transform: 'scaleX(1)' },
                }}
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.25, sm: 0.75 },
              flex: '0 0 auto',
              justifyContent: 'flex-end',
            }}
          >
            <LanguageSwitcher />
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Button
                    component="a"
                    href={`${resolveHref('/admin')}`}
                    sx={headerTextButtonSx}
                  >
                    {t('header.admin')}
                  </Button>
                )}
                <Button
                  component={RouterLink}
                  to={navHrefs.myOrders}
                  startIcon={<PersonOutlineRounded />}
                  sx={{ ...headerTextButtonSx, color: brand.graphite }}
                >
                  {customer?.name?.split(' ')[0] ?? t('header.account')}
                </Button>
              </>
            ) : (
              <Button
                component={RouterLink}
                to={navHrefs.login}
                startIcon={<PersonOutlineRounded />}
                sx={{ ...headerTextButtonSx, color: brand.graphite }}
              >
                {t('header.login')}
              </Button>
            )}
            <IconButton
              aria-label={t('header.cart')}
              component={RouterLink}
              to={navHrefs.cart}
              sx={{ color: brand.graphite }}
            >
              <Badge data-clarity-unmask="true" badgeContent={cartCount} color="primary" showZero={false}>
                <ShoppingBagOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
            {!onProduct && (
              <Button
                variant="contained"
                component={RouterLink}
                to={navHrefs.buy}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  fontWeight: 800,
                  minHeight: 40,
                  height: 40,
                  px: 2.25,
                  py: 0,
                  fontSize: '0.85rem',
                  lineHeight: 1,
                  boxShadow: 'none',
                }}
              >
                {t('nav.buyNow')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: { 'data-clarity-unmask': 'true', sx: { width: { xs: 'min(100vw, 320px)', sm: 340 } } },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: pagePaddingX }}>
          <Logo />
          <IconButton onClick={() => setMobileOpen(false)} aria-label={t('header.closeMenu')}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: pagePaddingX, pb: 2 }}>
          <LanguageSwitcher />
        </Box>
        <Divider />
        {isLoggedIn ? (
          <Box sx={{ px: pagePaddingX, py: 1.5 }}>
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 1 }}>{customer?.name}</Typography>
            {isAdmin && (
              <Button component="a" href={resolveHref('/admin')} fullWidth variant="contained" onClick={() => setMobileOpen(false)} sx={{ mb: 1 }}>
                {t('header.admin')}
              </Button>
            )}
            <Button component={RouterLink} to={navHrefs.myOrders} fullWidth variant="outlined" onClick={() => setMobileOpen(false)} sx={{ mb: 1 }}>
              {t('header.myOrders')}
            </Button>
            <Button
              fullWidth
              onClick={() => {
                logout()
                setMobileOpen(false)
              }}
            >
              {t('header.logout')}
            </Button>
          </Box>
        ) : (
          <Box sx={{ px: pagePaddingX, py: 1.5 }}>
            <Button component={RouterLink} to={navHrefs.login} fullWidth variant="outlined" onClick={() => setMobileOpen(false)}>
              {t('header.login')}
            </Button>
          </Box>
        )}
        <Divider />
        <List sx={{ px: 1, py: 1 }}>
          {mobileNavKeys.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                component="a"
                href={resolveHref(link.href)}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 2, py: 1.75, minHeight: 52 }}
              >
                <ListItemText
                  primary={t(`nav.${link.key}`)}
                  sx={{ '& .MuiListItemText-primary': { fontWeight: 700, fontSize: '1rem' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {!onProduct && (
          <Box sx={{ p: 2, px: pagePaddingX }}>
            <Button variant="contained" fullWidth size="large" component={RouterLink} to={navHrefs.buy} onClick={() => setMobileOpen(false)}>
              {t('nav.buyNow')}
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  )
}
