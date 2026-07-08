import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { useAccessoriesCatalog, toProductCardData } from '../hooks/useProducts'
import { useHt } from '../hooks/useHomepage'
import { brand } from '../theme'

export default function AccessoriesSection() {
  const { t } = useTranslation()
  const items = useAccessoriesCatalog()
  const title = useHt('accessoriesSection.title')
  const subtitle = useHt('accessoriesSection.subtitle')

  return (
    <SectionContainer id="accessories" bgcolor={brand.surface} py={{ xs: 7, sm: 9, md: 12 }}>
      <SectionHeading title={title} subtitle={subtitle} />

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {items.map((item, index) => (
          <Grid key={item.id} size={{ xs: 12, sm: 4 }}>
            <Reveal delay={index * 0.08}>
              <ProductCard layout="grid" product={toProductCardData(item, t)} />
            </Reveal>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  )
}
