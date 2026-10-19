import { lazy, Suspense, useLayoutEffect } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PromoBar from './components/PromoBar'
import Header from './components/Header'
import Footer from './components/Footer'
import AnalyticsConsent from './components/AnalyticsConsent'
import FloatingBuyButton from './components/FloatingBuyButton'
import NewsletterDialog from './components/NewsletterDialog'
import CartSnackbar from './components/CartSnackbar'
import HomePage from './pages/HomePage'
import DataBootstrap from './components/DataBootstrap'
import LocaleHead from './components/LocaleHead'
import SessionBootstrap from './components/SessionBootstrap'
import { ThemeProvider } from '@mui/material/styles'
import adminTheme from './admin/adminTheme'
import { resolveHref } from './paths'
import { brand } from './theme'

const ProductPage = lazy(() => import('./pages/ProductPage'))
const PodsPage = lazy(() => import('./pages/PodsPage'))
const PodDetailPage = lazy(() => import('./pages/PodDetailPage'))
const AccessoryDetailPage = lazy(() => import('./pages/AccessoryDetailPage'))
const AccessoriesPage = lazy(() => import('./pages/AccessoriesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const HowPage = lazy(() => import('./pages/HowPage'))
const StartPage = lazy(() => import('./pages/StartPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'))

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminGardensPage = lazy(() => import('./pages/admin/AdminGardensPage'))
const AdminPodsPage = lazy(() => import('./pages/admin/AdminPodsPage'))
const AdminAccessoriesPage = lazy(() => import('./pages/admin/AdminAccessoriesPage'))
const AdminHiddenProductsPage = lazy(() => import('./pages/admin/AdminHiddenProductsPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'))
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminCustomerDetailPage = lazy(() => import('./pages/admin/AdminCustomerDetailPage'))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'))
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'))
const AdminEmailsPage = lazy(() => import('./pages/admin/AdminEmailsPage'))
const AdminNewsletterPage = lazy(() => import('./pages/admin/AdminNewsletterPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminCouriersPage = lazy(() => import('./pages/admin/AdminCouriersPage'))
const AdminVatPage = lazy(() => import('./pages/admin/AdminVatPage'))
const AdminPromoCodesPage = lazy(() => import('./pages/admin/AdminPromoCodesPage'))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'))

function DismissBootScreen() {
  useLayoutEffect(() => {
    const img = document.getElementById('boot-hero-img')
    const slot = document.getElementById('hero-lcp-slot')
    if (img instanceof HTMLImageElement && slot && img.parentElement !== slot) {
      const mobile = img.dataset.posMobile || '50% 42%'
      const desktop = img.dataset.posDesktop || '58% 50%'
      const place = () => {
        img.style.objectPosition = window.matchMedia('(min-width: 900px)').matches ? desktop : mobile
      }
      place()
      img.style.position = 'absolute'
      img.style.inset = '0'
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'cover'
      slot.appendChild(img)
      window.matchMedia('(min-width: 900px)').addEventListener('change', place)
    }
    document.getElementById('boot')?.remove()
    document.getElementById('boot-css')?.remove()
    document.getElementById('boot-data')?.remove()
  }, [])
  return null
}

function AdminLoginRedirect() {
  window.location.replace(resolveHref('/login'))
  return null
}

function Masked({ children }: { children: React.ReactNode }) {
  return (
    <Box data-clarity-mask="true" sx={{ display: 'contents' }}>
      {children}
    </Box>
  )
}

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: brand.plantGreen }} />
    </Box>
  )
}

function StorefrontRoutes() {
  const location = useLocation()
  const isCheckoutFlow = /^\/(checkout|order\/)/.test(location.pathname)

  return (
    <Box data-clarity-unmask="true" sx={{ minHeight: '100vh', bgcolor: brand.white, color: brand.graphite }}>
      {!isCheckoutFlow && <PromoBar />}
      {!isCheckoutFlow && <Header />}
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/homegarder-one" element={<ProductPage />} />
          <Route path="/pods" element={<PodsPage />} />
          <Route path="/pods/:id" element={<PodDetailPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/accessories/:id" element={<AccessoryDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/contact" element={<SupportPage />} />
          <Route path="/support" element={<Navigate to="/contact" replace />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/how-it-works" element={<HowPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/privacy" element={<LegalPage doc="privacy" />} />
          <Route path="/cookies" element={<LegalPage doc="cookies" />} />
          <Route path="/terms" element={<LegalPage doc="terms" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/account/orders" element={<Masked><MyOrdersPage /></Masked>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Masked><CheckoutPage /></Masked>} />
          <Route path="/order/:orderId" element={<Masked><OrderConfirmationPage /></Masked>} />
          <Route path="/review/:token" element={<Masked><ReviewPage /></Masked>} />
        </Routes>
      </Suspense>
      {!isCheckoutFlow && <Footer />}
      {!isCheckoutFlow && <FloatingBuyButton />}
      <AnalyticsConsent />
      <NewsletterDialog />
      <CartSnackbar />
    </Box>
  )
}

function AdminRoutes() {
  return (
    <ThemeProvider theme={adminTheme}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginRedirect />} />
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gardens" element={<AdminGardensPage />} />
          <Route path="pods" element={<AdminPodsPage />} />
          <Route path="consumables" element={<Navigate to="/admin" replace />} />
          <Route path="accessories" element={<AdminAccessoriesPage />} />
          <Route path="hidden" element={<AdminHiddenProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="customers/:customerId" element={<AdminCustomerDetailPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="emails" element={<AdminEmailsPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
          <Route path="couriers" element={<AdminCouriersPage />} />
          <Route path="vat" element={<AdminVatPage />} />
          <Route path="promo-codes" element={<AdminPromoCodesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
    </ThemeProvider>
  )
}

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <AdminRoutes />
  }

  return (
    <>
      <DismissBootScreen />
      <SessionBootstrap />
      <DataBootstrap />
      <LocaleHead />
      <StorefrontRoutes />
    </>
  )
}

export default App
