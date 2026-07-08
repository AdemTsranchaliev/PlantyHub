import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import HorizontalScroll from '../components/HorizontalScroll'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import SectionLink from '../components/SectionLink'
import { navHrefs } from '../data/catalog'
import { useSeedPodsCatalog, toProductCardData } from '../hooks/useProducts'

export default function PodsCarouselSection() {
  const { t } = useTranslation()
  const pods = useSeedPodsCatalog()

  return (
    <SectionContainer id="pods" py={{ xs: 5, sm: 7, md: 9 }} bleedX>
      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionHeading eyebrow={t('podsSection.eyebrow')} title={t('podsSection.title')} />
      </Box>

      <HorizontalScroll gap={2}>
        {pods.map((pod) => (
          <ProductCard key={pod.id} product={toProductCardData(pod, t)} />
        ))}
      </HorizontalScroll>

      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionLink href={navHrefs.pods} label={t('podsSection.shopAll')} />
      </Box>
    </SectionContainer>
  )
}
