import { createTheme } from '@mui/material/styles'

export const brand = {
  plantGreen: '#2F7D53',
  plantGreenDark: '#1F5A3B',
  plantGreenLight: '#4CA374',
  plantGreenMuted: 'rgba(47, 125, 83, 0.10)',
  plantGreenGlow: 'rgba(47, 125, 83, 0.16)',
  peach: '#E39F76',
  peachSoft: '#F3E1D2',
  peachGlow: 'rgba(227, 159, 118, 0.28)',
  graphite: '#22301F',
  graphiteSoft: '#16211A',
  white: '#FFFFFF',
  beige: '#EFE9DB',
  beigeDark: '#E2DBC9',
  textSecondary: '#5f665a',
  surface: '#F7F4EC',
  surfaceWarm: '#F0EADC',
  border: '#E6DFCF',
  shadow: '0 6px 28px rgba(34, 48, 31, 0.06)',
  shadowHover: '0 22px 60px rgba(34, 48, 31, 0.14)',
  shadowGreen: '0 12px 30px rgba(47, 125, 83, 0.22)',
  touchMin: 44,
  gradientHero: 'linear-gradient(165deg, #FBF9F3 0%, #F3EEE1 55%, #ECF1E9 100%)',
  gradientCta: 'linear-gradient(140deg, #1F5A3B 0%, #2F7D53 62%, #4CA374 100%)',
} as const

export const carouselCardWidth = {
  xs: 'min(78vw, 260px)',
  sm: 'min(42vw, 280px)',
  md: 250,
  lg: 260,
} as const

const displayFont = '"Fraunces", "Georgia", "Times New Roman", serif'
const bodyFont = '"Nunito Sans", "Helvetica Neue", "Arial", sans-serif'

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
    fontFamily: bodyFont,
    h1: {
      fontFamily: displayFont,
      fontWeight: 600,
      fontSize: '2.35rem',
      lineHeight: 1.06,
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': { fontSize: '3.2rem' },
      '@media (min-width:900px)': { fontSize: '3.9rem' },
    },
    h2: {
      fontFamily: displayFont,
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.1,
      letterSpacing: '-0.015em',
      '@media (min-width:900px)': { fontSize: '2.6rem' },
    },
    h3: {
      fontFamily: displayFont,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: { fontFamily: bodyFont, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          minHeight: brand.touchMin,
          padding: '12px 26px',
          boxShadow: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease',
          '&:hover': { boxShadow: 'none' },
        },
        sizeLarge: { minHeight: 52, padding: '15px 32px', fontSize: '0.95rem' },
        contained: {
          backgroundColor: brand.plantGreen,
          color: brand.white,
          '@media (hover: hover)': {
            '&:hover': { backgroundColor: brand.plantGreenDark, transform: 'translateY(-2px)', boxShadow: brand.shadowGreen },
          },
        },
        outlined: {
          borderColor: brand.graphite,
          color: brand.graphite,
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5, backgroundColor: brand.graphite, borderColor: brand.graphite, color: brand.white },
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
