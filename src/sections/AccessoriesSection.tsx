import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import HorizontalScroll from '../components/HorizontalScroll'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import { accessoriesCatalog } from '../data/catalog'

export default function AccessoriesSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="accessories">
      <Typography
        variant="h2"
        sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, textAlign: 'center', mb: 5 }}
      >
        {t('accessoriesSection.title')}
      </Typography>

      <HorizontalScroll gap={2.5}>
        {accessoriesCatalog.map((item) => (
          <ProductCard
            key={item.id}
            product={{
              id: item.id,
              name: t(`products.accessories.${item.id}.name`),
              price: item.price,
              image: item.image,
            }}
            width={240}
          />
        ))}
      </HorizontalScroll>
    </SectionContainer>
  )
}
