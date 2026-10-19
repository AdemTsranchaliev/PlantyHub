import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import { i18nReady } from './i18n'
import theme from './theme'
import App from './App.tsx'
import { defaultLanguage, isActiveLanguage, localeFromPathname } from './i18n/languages'
import { BASE_PATH } from './paths'

function isAdminPath(pathname: string) {
  const base = BASE_PATH
  const rest = base && (pathname === base || pathname.startsWith(`${base}/`))
    ? pathname.slice(base.length)
    : pathname
  return rest === '/admin' || rest.startsWith('/admin/')
}

function AppRouter() {
  const { pathname, search, hash } = window.location

  if (isAdminPath(pathname)) {
    return (
      <BrowserRouter basename={BASE_PATH || undefined}>
        <App />
      </BrowserRouter>
    )
  }

  const locale = localeFromPathname(pathname, BASE_PATH)
  if (locale === defaultLanguage || (locale && !isActiveLanguage(locale))) {
    const base = BASE_PATH
    const rest = base && (pathname === base || pathname.startsWith(`${base}/`))
      ? pathname.slice(base.length) || '/'
      : pathname
    const tail = `/${rest.split('/').filter(Boolean).slice(1).join('/')}`
    const path = tail === '/' ? '/' : tail.replace(/\/$/, '')
    window.location.replace(`${base}${path}${search}${hash}`)
    return null
  }

  if (!locale) {
    return (
      <BrowserRouter basename={BASE_PATH || undefined}>
        <App />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter basename={`${BASE_PATH}/${locale}`}>
      <App />
    </BrowserRouter>
  )
}

await i18nReady

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)

const hero = document.getElementById('boot-hero-img')
if (hero instanceof HTMLImageElement && !hero.complete) {
  const loadFonts = () => void import('./fonts')
  hero.addEventListener('load', loadFonts, { once: true })
  hero.addEventListener('error', loadFonts, { once: true })
} else {
  void import('./fonts')
}
