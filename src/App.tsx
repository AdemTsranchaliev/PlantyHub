import Box from '@mui/material/Box'
import PromoBar from './components/PromoBar'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingBuyButton from './components/FloatingBuyButton'
import HeroSection from './sections/HeroSection'
import GrowSmarterSection from './sections/GrowSmarterSection'
import ProductSection from './sections/ProductSection'
import HowItWorksSection from './sections/HowItWorksSection'
import LightCycleSection from './sections/LightCycleSection'
import PodsGridSection from './sections/PodsGridSection'
import SocialProofSection from './sections/SocialProofSection'
import GuaranteesSection from './sections/GuaranteesSection'
import AccessoriesSection from './sections/AccessoriesSection'
import CtaSection from './sections/CtaSection'
import { brand } from './theme'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: brand.white, color: brand.graphite }}>
      <PromoBar />
      <Header />
      <main>
        <HeroSection />
        <GrowSmarterSection />
        <ProductSection />
        <HowItWorksSection />
        <LightCycleSection />
        <PodsGridSection />
        <SocialProofSection />
        <GuaranteesSection />
        <AccessoriesSection />
        <CtaSection />
      </main>
      <Footer />
      <FloatingBuyButton />
    </Box>
  )
}

export default App
