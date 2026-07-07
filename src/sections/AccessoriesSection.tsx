import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { accessoriesCatalog } from '../data/catalog'
import { brand } from '../theme'

export default function AccessoriesSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="accessories" bgcolor={brand.surface} py={{ xs: 7, sm: 9, md: 12 }}>
      <SectionHeading title={t('accessoriesSection.title')} subtitle={t('accessoriesSection.subtitle')} />

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {accessoriesCatalog.map((item, index) => (
          <Grid key={item.id} size={{ xs: 12, sm: 4 }}>
            <Reveal delay={index * 0.08}>
              <ProductCard
                layout="grid"
                product={{
                  id: item.id,
                  name: t(`products.accessories.${item.id}.name`),
                  price: item.price,
                  image: item.image,
                  imageFit: item.imageFit,
                }}
              />
            </Reveal>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  )
}
