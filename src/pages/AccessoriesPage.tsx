import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { accessoriesCatalog, consumablesCatalog, navHrefs } from '../data/catalog'
import { brand } from '../theme'

export default function AccessoriesPage() {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 5, sm: 6, md: 8 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {t('accessoriesPage.title')}
          </Typography>
        </Stack>

        <Reveal sx={{ maxWidth: 640 }}>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: brand.plantGreen,
              bgcolor: brand.plantGreenMuted,
              borderRadius: 999,
              px: 1.5,
              py: 0.6,
              mb: 2,
            }}
          >
            {t('accessoriesPage.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.5 }}>
            {t('accessoriesPage.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.08rem', lineHeight: 1.7 }}>
            {t('accessoriesPage.subtitle')}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 3 }}>
          {t('accessoriesSection.title')}
        </Typography>
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

      <SectionContainer bgcolor={brand.cream} py={{ xs: 5, sm: 6, md: 8 }}>
        <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 1 }}>
          {t('consumablesSection.title')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: '1rem', mb: 3, maxWidth: 560 }}>
          {t('consumablesSection.subtitle')}
        </Typography>
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {consumablesCatalog.map((item, index) => (
            <Grid key={item.id} size={{ xs: 12, sm: 4 }}>
              <Reveal delay={index * 0.08}>
                <ProductCard
                  layout="grid"
                  product={{
                    id: item.id,
                    name: t(`products.consumables.${item.id}.name`),
                    price: item.price,
                    pack: t(`common.${item.packKey}`),
                    image: item.image,
                    imageFit: item.imageFit,
                  }}
                />
              </Reveal>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: { xs: 5, md: 7 }, textAlign: 'center' }}>
          <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} sx={{ px: 4 }}>
            {t('podsPage.ctaButton')}
          </Button>
        </Box>
      </SectionContainer>
    </main>
  )
}
