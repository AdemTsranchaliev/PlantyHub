import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import HorizontalScroll from '../components/HorizontalScroll'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import { campaignBundleCatalog, campaignBundleIds } from '../data/catalog'
import { useProduct } from '../hooks/useProducts'
import { brand } from '../theme'

function BundleCard({ id, item }: { id: string; item: (typeof campaignBundleCatalog)[keyof typeof campaignBundleCatalog] }) {
  const { t } = useTranslation()
  const stored = useProduct('pods', item.nameKey)
  const name = stored?.name ?? t(`products.pods.${item.nameKey}.name`)
  const price = stored?.price ?? item.price

  return (
    <ProductCard
      layout="grid"
      product={{
        id,
        name,
        price,
        pack: t(`common.${item.packKey}`),
        image: stored?.image ?? item.image,
        imageFit: stored?.imageFit ?? item.imageFit ?? 'cover',
      }}
    />
  )
}

export default function CampaignHero() {
  const { t } = useTranslation()

  return (
    <SectionContainer py={{ xs: 5, sm: 6, md: 8 }} bleedX>
      <Box
        sx={{
          mx: { xs: 2, sm: 3, md: 'auto' },
          maxWidth: 1400,
          mb: { xs: 3, md: 5 },
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: brand.beige,
          border: `1px solid ${brand.beigeDark}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <SectionHeading
            align="left"
            size="md"
            compact
            eyebrow={t('campaign.eyebrow')}
            title={t('campaign.title')}
            subtitle={t('campaign.description')}
          />
          <Button variant="contained" href="#gardens" sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' }, px: 4 }}>
            {t('campaign.cta')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' }, px: { md: 0 } }}>
        <Grid container spacing={3}>
          {campaignBundleIds.map((id) => {
            const item = campaignBundleCatalog[id]
            const isFeatured = id === 'herb-mix-12'
            return (
              <Grid key={id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Box
                  sx={{
                    borderRadius: 4,
                    p: isFeatured ? '2px' : 0,
                    background: isFeatured ? brand.gradientCta : 'transparent',
                    height: '100%',
                  }}
                >
                  <Box sx={{ bgcolor: brand.white, borderRadius: isFeatured ? 3.5 : 4, height: '100%' }}>
                    <BundleCard id={id} item={item} />
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <HorizontalScroll gap={2}>
          {campaignBundleIds.map((id) => {
            const item = campaignBundleCatalog[id]
            return <BundleCard key={id} id={id} item={item} />
          })}
        </HorizontalScroll>
      </Box>
    </SectionContainer>
  )
}
