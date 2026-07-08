import { lazy, Suspense } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Routes, Route, useLocation } from 'react-router-dom'
import PromoBar from './components/PromoBar'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingBuyButton from './components/FloatingBuyButton'
import NewsletterDialog from './components/NewsletterDialog'
import CartSnackbar from './components/CartSnackbar'
import HomePage from './pages/HomePage'
import DataBootstrap from './components/DataBootstrap'
import { brand } from './theme'

const ProductPage = lazy(() => import('./pages/ProductPage'))
const PodsPage = lazy(() => import('./pages/PodsPage'))
const PodDetailPage = lazy(() => import('./pages/PodDetailPage'))
const AccessoriesPage = lazy(() => import('./pages/AccessoriesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminGardensPage = lazy(() => import('./pages/admin/AdminGardensPage'))
const AdminPodsPage = lazy(() => import('./pages/admin/AdminPodsPage'))
const AdminConsumablesPage = lazy(() => import('./pages/admin/AdminConsumablesPage'))
const AdminAccessoriesPage = lazy(() => import('./pages/admin/AdminAccessoriesPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'))
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminCustomerDetailPage = lazy(() => import('./pages/admin/AdminCustomerDetailPage'))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'))
const AdminNewsletterPage = lazy(() => import('./pages/admin/AdminNewsletterPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))

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
    <Box sx={{ minHeight: '100vh', bgcolor: brand.white, color: brand.graphite }}>
      {!isCheckoutFlow && <PromoBar />}
      {!isCheckoutFlow && <Header />}
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/homegarder-one" element={<ProductPage />} />
          <Route path="/pods" element={<PodsPage />} />
          <Route path="/pods/:id" element={<PodDetailPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderConfirmationPage />} />
        </Routes>
      </Suspense>
      {!isCheckoutFlow && <Footer />}
      {!isCheckoutFlow && <FloatingBuyButton />}
      <NewsletterDialog />
      <CartSnackbar />
    </Box>
  )
}

function AdminRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gardens" element={<AdminGardensPage />} />
          <Route path="pods" element={<AdminPodsPage />} />
          <Route path="consumables" element={<AdminConsumablesPage />} />
          <Route path="accessories" element={<AdminAccessoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="customers/:customerId" element={<AdminCustomerDetailPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
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
      <DataBootstrap />
      <StorefrontRoutes />
    </>
  )
}

export default App
