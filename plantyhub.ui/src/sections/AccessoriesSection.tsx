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
    <SectionContainer id="accessories" bgcolor={brand.surface} py={{ xs: 4, sm: 6, md: 8 }}>
      <SectionHeading title={title} subtitle={subtitle} />

      <Grid container spacing={{ xs: 1.5, md: 3 }}>
        {items.map((item, index) => (
          <Grid key={item.id} size={{ xs: items.length % 2 === 1 && index === items.length - 1 ? 12 : 6, sm: 4 }}>
            <Reveal delay={index * 0.08}>
              <ProductCard layout="grid" product={toProductCardData(item, t)} />
            </Reveal>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  )
}
