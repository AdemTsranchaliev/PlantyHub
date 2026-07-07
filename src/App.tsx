import Box from '@mui/material/Box'
import PromoBar from './components/PromoBar'
import Header from './components/Header'
import Footer from './components/Footer'
import HeroSection from './sections/HeroSection'
import FeaturedGardenSection from './sections/FeaturedGardenSection'
import GardensGridSection from './sections/GardensGridSection'
import CampaignHero from './sections/CampaignHero'
import PodsCarouselSection from './sections/PodsCarouselSection'
import GrowSmarterSection from './sections/GrowSmarterSection'
import GuaranteesSection from './sections/GuaranteesSection'
import PressSection from './sections/PressSection'
import CommunitySection from './sections/CommunitySection'
import CtaSection from './sections/CtaSection'
import { brand } from './theme'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: brand.white, color: brand.graphite }}>
      <PromoBar />
      <Header />
      <main>
        <HeroSection />
        <FeaturedGardenSection />
        <GardensGridSection />
        <CampaignHero />
        <PodsCarouselSection />
        <GrowSmarterSection />
        <GuaranteesSection />
        <PressSection />
        <CommunitySection />
        <CtaSection />
      </main>
      <Footer />
    </Box>
  )
}

export default App
