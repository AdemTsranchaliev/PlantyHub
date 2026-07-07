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
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { pagePaddingX } from './SectionContainer'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

const navKeys = [
  { key: 'product', href: navHrefs.product },
  { key: 'howItWorks', href: navHrefs.howItWorks },
  { key: 'pods', href: navHrefs.pods },
  { key: 'accessories', href: navHrefs.accessories },
] as const

export default function Header() {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(0)

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
            minHeight: { xs: 56, sm: 60, md: 68 },
            py: { xs: 0.5, md: 1 },
            px: pagePaddingX,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 }, flex: 1, minWidth: 0 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: 'none' }, color: brand.graphite, ml: { xs: -0.5, sm: 0 } }}
              aria-label={t('header.openMenu')}
            >
              <MenuIcon />
            </IconButton>
            <Link href="#" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Logo size="md" />
            </Link>
          </Box>

          <Box
            component="nav"
            aria-label="Main"
            sx={{
              display: { xs: 'none', lg: 'flex' },
              gap: 3,
              flex: 2,
              justifyContent: 'center',
            }}
          >
            {navKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                underline="none"
                color="inherit"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
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
              gap: { xs: 0.5, sm: 1 },
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <Typography
              component="span"
              sx={{
                display: { xs: 'none', xl: 'inline' },
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              {t('header.region')}
            </Typography>
            <LanguageSwitcher />
            <IconButton aria-label={t('header.cart')} sx={{ color: brand.graphite, display: { xs: 'inline-flex', lg: 'none' } }}>
              <Badge badgeContent={cartCount} color="primary" showZero>
                <ShoppingBagOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
            <Button
              variant="contained"
              href={navHrefs.product}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontWeight: 800,
                px: { sm: 2.5, md: 3 },
                fontSize: '0.85rem',
                boxShadow: brand.shadowGreen,
              }}
            >
              {t('nav.buyNow')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: { sx: { width: { xs: 'min(100vw, 320px)', sm: 340 } } },
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
        <List sx={{ px: 1, py: 1 }}>
          {navKeys.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                component="a"
                href={link.href}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                <ListItemText
                  primary={t(`nav.${link.key}`)}
                  sx={{ '& .MuiListItemText-primary': { fontWeight: 700, fontSize: '1rem' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2, px: pagePaddingX }}>
          <Button variant="contained" fullWidth size="large" href={navHrefs.product} onClick={() => setMobileOpen(false)}>
            {t('nav.buyNow')}
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
