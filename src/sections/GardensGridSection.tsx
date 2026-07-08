import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useTranslation } from 'react-i18next'
import HorizontalScroll from '../components/HorizontalScroll'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import SectionLink from '../components/SectionLink'
import { navHrefs } from '../data/catalog'
import { useGardensCatalog } from '../hooks/useProducts'
import { useAddProductToCart } from '../hooks/useCart'
import { brand } from '../theme'

function GardenCard({
  name,
  tagline,
  image,
  price,
  compareAt,
  featured,
  imageFit = 'cover',
  onAddToCart,
}: {
  name: string
  tagline?: string
  image: string
  price: string
  compareAt?: string
  featured?: boolean
  imageFit?: 'cover' | 'contain'
  onAddToCart?: () => void
}) {
  const { t } = useTranslation()

  return (
    <Box
      data-scroll-item
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: brand.white,
        borderRadius: 4,
        border: featured ? `2px solid ${brand.plantGreen}` : `1px solid ${brand.border}`,
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        '@media (hover: hover)': {
          '&:hover': { boxShadow: brand.shadowHover, transform: 'translateY(-6px)' },
        },
      }}
    >
      <Box sx={{ position: 'relative', bgcolor: brand.surface, aspectRatio: '4/3', overflow: 'hidden' }}>
        {featured && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 1,
              bgcolor: brand.plantGreen,
              color: brand.white,
              fontSize: '0.7rem',
              fontWeight: 700,
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
            }}
          >
            {t('featured.badge')}
          </Box>
        )}
        <Box
          component="img"
          src={image}
          alt={name}
          loading="lazy"
          sx={{ width: '100%', height: '100%', objectFit: imageFit, display: 'block' }}
        />
        <IconButton
          aria-label={t('common.addToCartAria', { name })}
          onClick={onAddToCart}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: brand.plantGreen,
            color: brand.white,
            '&:hover': { bgcolor: brand.plantGreenDark },
          }}
        >
          <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>{name}</Typography>
        {tagline && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, lineHeight: 1.5 }}>
            {tagline}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{price}</Typography>
          {compareAt && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              {compareAt}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

export default function GardensGridSection() {
  const { t } = useTranslation()
  const gardens = useGardensCatalog()
  const addProductToCart = useAddProductToCart()

  return (
    <SectionContainer bgcolor={brand.surface} py={{ xs: 5, sm: 7, md: 9 }}>
      <SectionHeading eyebrow={t('sleek.eyebrow')} title={t('sleek.title')} subtitle={t('sleek.subtitle')} />

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Grid container spacing={3}>
          {gardens.map((garden) => (
            <Grid key={garden.id} size={{ xs: 12, md: 4 }}>
              <GardenCard
                name={garden.name}
                tagline={garden.tagline}
                image={garden.image}
                price={garden.price}
                compareAt={garden.compareAt}
                featured={garden.featured}
                imageFit={garden.imageFit}
                onAddToCart={() => addProductToCart('gardens', garden)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <HorizontalScroll gap={2}>
          {gardens.map((garden) => (
            <Box key={garden.id} sx={{ flex: '0 0 min(82vw, 300px)', scrollSnapAlign: 'start' }}>
              <GardenCard
                name={garden.name}
                tagline={garden.tagline}
                image={garden.image}
                price={garden.price}
                compareAt={garden.compareAt}
                featured={garden.featured}
                imageFit={garden.imageFit}
                onAddToCart={() => addProductToCart('gardens', garden)}
              />
            </Box>
          ))}
        </HorizontalScroll>
      </Box>

      <SectionLink href={navHrefs.gardens} label={t('sleek.discoverAll')} />
    </SectionContainer>
  )
}
