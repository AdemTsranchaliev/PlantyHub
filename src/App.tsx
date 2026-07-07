import Box from '@mui/material/Box'
import { Routes, Route } from 'react-router-dom'
import PromoBar from './components/PromoBar'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingBuyButton from './components/FloatingBuyButton'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import { brand } from './theme'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: brand.white, color: brand.graphite }}>
      <PromoBar />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/homegarder-one" element={<ProductPage />} />
      </Routes>
      <Footer />
      <FloatingBuyButton />
    </Box>
  )
}

export default App
