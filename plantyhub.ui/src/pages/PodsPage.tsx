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
import { navHrefs } from '../data/catalog'
import { useSeedPodsCatalog, toProductCardData } from '../hooks/useProducts'
import { brand } from '../theme'

export default function PodsPage() {
  const { t } = useTranslation()
  const pods = useSeedPodsCatalog()

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
            {t('podsPage.title')}
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
            {t('podsPage.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.5 }}>
            {t('podsPage.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.08rem', lineHeight: 1.7 }}>
            {t('podsPage.subtitle')}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {pods.map((pod, index) => (
            <Grid key={pod.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Reveal delay={(index % 4) * 0.06}>
                <ProductCard layout="grid" to={`/pods/${pod.id}`} product={toProductCardData(pod, t)} />
              </Reveal>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            p: { xs: 3, sm: 5 },
            borderRadius: '28px',
            border: `2px dashed ${brand.plantGreen}`,
            bgcolor: brand.plantGreenMuted,
            textAlign: 'center',
          }}
        >
          <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, color: brand.graphite, mb: 1 }}>
            {t('podsPage.ctaTitle')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1rem', mb: 3, maxWidth: 520, mx: 'auto' }}>
            {t('podsPage.ctaSubtitle')}
          </Typography>
          <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} sx={{ px: 4 }}>
            {t('podsPage.ctaButton')}
          </Button>
        </Box>
      </SectionContainer>
    </main>
  )
}
