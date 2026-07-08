import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import SectionLink from '../components/SectionLink'
import Reveal from '../components/Reveal'
import { homepagePodIds, navHrefs } from '../data/catalog'
import { useSeedPodsCatalog, toProductCardData } from '../hooks/useProducts'
import { useHt } from '../hooks/useHomepage'
import { brand } from '../theme'

export default function PodsGridSection() {
  const { t } = useTranslation()
  const pods = useSeedPodsCatalog()
  const podsById = Object.fromEntries(pods.map((p) => [p.id, p]))
  const eyebrow = useHt('podsSection.eyebrow')
  const title = useHt('podsSection.title')
  const subtitle = useHt('podsSection.subtitle')

  return (
    <SectionContainer id="pods" bgcolor={brand.surface} py={{ xs: 7, sm: 9, md: 12 }}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {homepagePodIds.map((id, index) => {
          const pod = podsById[id]
          if (!pod) return null
          return (
            <Grid key={id} size={{ xs: 6, sm: 4, md: 4, lg: 2 }}>
              <Reveal delay={(index % 6) * 0.06}>
                <ProductCard layout="grid" to={`/pods/${pod.id}`} product={toProductCardData(pod, t)} />
              </Reveal>
            </Grid>
          )
        })}
      </Grid>

      <SectionLink href={navHrefs.pods} label={t('sleek.discoverAll')} />
    </SectionContainer>
  )
}
