import { createTheme } from '@mui/material/styles'

export const brand = {
  plantGreen: '#4CAF50',
  plantGreenDark: '#3d8b40',
  plantGreenLight: '#66bb6a',
  plantGreenMuted: 'rgba(76, 175, 80, 0.12)',
  plantGreenGlow: 'rgba(76, 175, 80, 0.22)',
  graphite: '#2B2B2B',
  graphiteSoft: '#1a1a1a',
  white: '#FFFFFF',
  beige: '#E8E5DA',
  beigeDark: '#d9d5c8',
  textSecondary: '#6b6b6b',
  surface: '#f7f6f3',
  surfaceWarm: '#f0efe9',
  border: '#e5e4e0',
  shadow: '0 8px 32px rgba(43, 43, 43, 0.08)',
  shadowHover: '0 16px 48px rgba(43, 43, 43, 0.12)',
  shadowGreen: '0 20px 60px rgba(76, 175, 80, 0.18)',
  touchMin: 44,
  gradientHero: 'linear-gradient(135deg, #f7f6f3 0%, #eef5ee 45%, #E8E5DA 100%)',
  gradientCta: 'linear-gradient(135deg, #3d8b40 0%, #4CAF50 55%, #66bb6a 100%)',
} as const

export const carouselCardWidth = {
  xs: 'min(78vw, 260px)',
  sm: 'min(42vw, 280px)',
  md: 250,
  lg: 260,
} as const

const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1400 },
  },
  palette: {
    mode: 'light',
    primary: { main: brand.plantGreen, light: brand.plantGreenLight, dark: brand.plantGreenDark, contrastText: brand.white },
    secondary: { main: brand.graphite },
    text: { primary: brand.graphite, secondary: brand.textSecondary },
    background: { default: brand.white, paper: brand.white },
    divider: brand.border,
  },
  typography: {
    fontFamily: '"Nunito Sans", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.08,
      letterSpacing: '-0.035em',
      '@media (min-width:600px)': { fontSize: '2.75rem' },
      '@media (min-width:900px)': { fontSize: '3.25rem' },
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.12,
      letterSpacing: '-0.03em',
      '@media (min-width:900px)': { fontSize: '2.25rem' },
    },
    button: { fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          minHeight: brand.touchMin,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        sizeLarge: { minHeight: 48, padding: '14px 28px', fontSize: '0.95rem' },
        contained: { backgroundColor: brand.plantGreen, color: brand.white, '&:hover': { backgroundColor: brand.plantGreenDark } },
        outlined: {
          borderColor: brand.border,
          color: brand.graphite,
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5, backgroundColor: brand.surface, borderColor: brand.graphite },
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { width: brand.touchMin, height: brand.touchMin } } },
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: 'none', paddingTop: 'env(safe-area-inset-top)' } } },
    MuiDrawer: { styleOverrides: { paper: { paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' } } },
    MuiLink: { styleOverrides: { root: { cursor: 'pointer' } } },
    MuiListItemButton: { styleOverrides: { root: { minHeight: 48 } } },
  },
})

export default theme
