import { useState } from 'react'
import { Outlet, Link as RouterLink, useLocation, useNavigate, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuRounded from '@mui/icons-material/MenuRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'
import { useTranslation } from 'react-i18next'
import Logo from '../Logo'
import LanguageSwitcher from '../LanguageSwitcher'
import { adminNavGroups } from '../../admin/nav'
import { clearAdminUser, getAdminUser, isAdminAuthenticated } from '../../admin/auth'
import { logoutCustomer } from '../../store/auth'
import AdminDataBootstrap from './AdminDataBootstrap'
import { brand } from '../../theme'

const SIDEBAR_WIDTH = 260

export default function AdminLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const admin = getAdminUser()

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const handleLogout = () => {
    clearAdminUser()
    logoutCustomer()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box component={RouterLink} to="/admin" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Logo size="sm" />
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.plantGreen }}>
            {t('admin.brand')}
          </Typography>
        </Box>
        <IconButton onClick={() => setMobileOpen(false)} sx={{ display: { md: 'none' } }} aria-label={t('header.closeMenu')}>
          <CloseRounded />
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1.5, py: 1, overflow: 'auto' }}>
        {adminNavGroups.map((group) => (
          <Box key={group.id} sx={{ mb: 0.75 }}>
            {group.labelKey ? (
              <Typography
                sx={{
                  px: 1.5,
                  py: 1,
                  mt: group.id === 'overview' ? 0 : 0.75,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: brand.textSecondary,
                }}
              >
                {t(group.labelKey)}
              </Typography>
            ) : null}
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <ListItemButton
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: '12px',
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: brand.plantGreenMuted, color: brand.plantGreenDark, '& .MuiListItemIcon-root': { color: brand.plantGreen } },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: brand.textSecondary }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t(item.labelKey)}
                    sx={{ '& .MuiListItemText-primary': { fontSize: '0.92rem', fontWeight: 600 } }}
                  />
                </ListItemButton>
              )
            })}
          </Box>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          component="a"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ borderRadius: '12px', mb: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: brand.textSecondary }}>
            <OpenInNewRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('admin.viewStore')}
            sx={{ '& .MuiListItemText-primary': { fontSize: '0.92rem', fontWeight: 600 } }}
          />
        </ListItemButton>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: '12px' }}>
          <ListItemIcon sx={{ minWidth: 40, color: brand.textSecondary }}>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('admin.logout')}
            sx={{ '& .MuiListItemText-primary': { fontSize: '0.92rem', fontWeight: 600 } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: brand.surface }}>
      <AdminDataBootstrap />
      <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' } }}
        >
          {sidebarContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', borderRight: `1px solid ${brand.border}` },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            height: 64,
            px: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: brand.white,
            borderBottom: `1px solid ${brand.border}`,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }} aria-label={t('header.openMenu')}>
              <MenuRounded />
            </IconButton>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', display: { xs: 'none', sm: 'block' } }}>
              {t('admin.welcome', { name: admin?.name ?? 'Admin' })}
            </Typography>
          </Box>
          <LanguageSwitcher />
        </Box>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
