import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import SectionLink from '../components/SectionLink'
import Reveal from '../components/Reveal'
import { homepagePodIds, navHrefs, seedPodsCatalog } from '../data/catalog'
import { brand } from '../theme'

const podsById = Object.fromEntries(seedPodsCatalog.map((p) => [p.id, p]))

export default function PodsGridSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="pods" bgcolor={brand.surface} py={{ xs: 7, sm: 9, md: 12 }}>
      <SectionHeading
        eyebrow={t('podsSection.eyebrow')}
        title={t('podsSection.title')}
        subtitle={t('podsSection.subtitle')}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {homepagePodIds.map((id, index) => {
          const pod = podsById[id]
          if (!pod) return null
          return (
            <Grid key={id} size={{ xs: 6, sm: 4, md: 4, lg: 2 }}>
              <Reveal delay={(index % 6) * 0.06}>
                <ProductCard
                  layout="grid"
                  product={{
                    id: pod.id,
                    name: t(`products.pods.${pod.id}.name`),
                    price: pod.price,
                    pack: t(`common.${pod.packKey}`),
                    image: pod.image,
                    imageFit: pod.imageFit,
                  }}
                />
              </Reveal>
            </Grid>
          )
        })}
      </Grid>

      <SectionLink href={navHrefs.pods} label={t('sleek.discoverAll')} />
    </SectionContainer>
  )
}
