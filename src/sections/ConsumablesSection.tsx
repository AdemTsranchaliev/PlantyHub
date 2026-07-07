import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import HorizontalScroll from '../components/HorizontalScroll'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import { consumablesCatalog } from '../data/catalog'
import { brand } from '../theme'

export default function ConsumablesSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="consumables" bgcolor={brand.surface} py={{ xs: 5, sm: 7, md: 9 }} bleedX>
      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionHeading
          eyebrow={t('consumablesSection.eyebrow')}
          title={t('consumablesSection.title')}
          subtitle={t('consumablesSection.subtitle')}
        />
      </Box>

      <HorizontalScroll gap={2}>
        {consumablesCatalog.map((item) => (
          <ProductCard
            key={item.id}
            product={{
              id: item.id,
              name: t(`products.consumables.${item.id}.name`),
              price: item.price,
              pack: t(`common.${item.packKey}`),
              image: item.image,
              imageFit: item.imageFit,
            }}
          />
        ))}
      </HorizontalScroll>
    </SectionContainer>
  )
}
