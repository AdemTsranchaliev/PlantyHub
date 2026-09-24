import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/fraunces/500-italic.css'
import '@fontsource/fraunces/600-italic.css'
import './index.css'
import './i18n/setup'
import theme from './theme'
import App from './App.tsx'
import { localeFromPathname, preferredLanguage } from './i18n/languages'
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
  if (!locale) {
    const base = BASE_PATH
    const rest = base && (pathname === base || pathname.startsWith(`${base}/`))
      ? pathname.slice(base.length) || '/'
      : pathname
    const target = `${base}/${preferredLanguage()}${rest === '/' ? '/' : rest}${search}${hash}`
    window.location.replace(target)
    return null
  }

  return (
    <BrowserRouter basename={`${BASE_PATH}/${locale}`}>
      <App />
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)
