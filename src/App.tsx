import { lazy, Suspense } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Routes, Route } from 'react-router-dom'
import PromoBar from './components/PromoBar'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingBuyButton from './components/FloatingBuyButton'
import NewsletterDialog from './components/NewsletterDialog'
import HomePage from './pages/HomePage'
import { brand } from './theme'

const ProductPage = lazy(() => import('./pages/ProductPage'))
const PodsPage = lazy(() => import('./pages/PodsPage'))
const PodDetailPage = lazy(() => import('./pages/PodDetailPage'))
const AccessoriesPage = lazy(() => import('./pages/AccessoriesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: brand.plantGreen }} />
    </Box>
  )
}

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: brand.white, color: brand.graphite }}>
      <PromoBar />
      <Header />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/homegarder-one" element={<ProductPage />} />
          <Route path="/pods" element={<PodsPage />} />
          <Route path="/pods/:id" element={<PodDetailPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <FloatingBuyButton />
      <NewsletterDialog />
    </Box>
  )
}

export default App
