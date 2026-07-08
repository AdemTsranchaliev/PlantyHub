import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined'
import EnergySavingsLeafOutlined from '@mui/icons-material/EnergySavingsLeafOutlined'
import SpaOutlined from '@mui/icons-material/SpaOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { lifestyleImages } from '../data/images'
import { brand } from '../theme'

const valueItems = [
  { key: 'quality', Icon: VerifiedOutlined },
  { key: 'sustainability', Icon: EnergySavingsLeafOutlined },
  { key: 'simplicity', Icon: SpaOutlined },
] as const

const statKeys = ['plants', 'countries', 'harvests'] as const

export default function AboutPage() {
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
            {t('aboutPage.title')}
          </Typography>
        </Stack>

        <Reveal sx={{ maxWidth: 720 }}>
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
            {t('aboutPage.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>
            {t('aboutPage.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.15rem', lineHeight: 1.7 }}>
            {t('aboutPage.lead')}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Grid container spacing={{ xs: 4, md: 7 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal
              sx={{
                borderRadius: '28px',
                overflow: 'hidden',
                border: `1px solid ${brand.border}`,
                boxShadow: brand.shadowHover,
              }}
            >
              <Box
                component="img"
                src={lifestyleImages.heroKitchen}
                alt={t('aboutPage.title')}
                loading="lazy"
                decoding="async"
                sx={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />
            </Reveal>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal>
              <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, color: brand.graphite, mb: 2.5 }}>
                {t('aboutPage.storyTitle')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem', lineHeight: 1.8, mb: 2 }}>
                {t('aboutPage.story1')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem', lineHeight: 1.8 }}>
                {t('aboutPage.story2')}
              </Typography>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 5, sm: 6, md: 8 }}>
        <Reveal sx={{ textAlign: 'center', maxWidth: 620, mx: 'auto', mb: { xs: 4, md: 6 } }}>
          <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>
            {t('aboutPage.valuesTitle')}
          </Typography>
        </Reveal>
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {valueItems.map(({ key, Icon }, index) => (
            <Grid key={key} size={{ xs: 12, md: 4 }}>
              <Reveal
                delay={index * 0.08}
                sx={{
                  height: '100%',
                  bgcolor: brand.white,
                  borderRadius: '24px',
                  border: `1px solid ${brand.creamBorder}`,
                  p: { xs: 3, sm: 4 },
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: `1.5px solid ${brand.plantGreen}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Icon sx={{ color: brand.plantGreen, fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.2rem', color: brand.graphite, mb: 1 }}>
                  {t(`aboutPage.values.${key}.title`)}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {t(`aboutPage.values.${key}.text`)}
                </Typography>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {statKeys.map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '2.4rem', md: '3rem' }, color: brand.plantGreenDark, lineHeight: 1 }}>
                  {t(`aboutPage.stats.${key}.value`)}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontWeight: 600, mt: 1 }}>
                  {t(`aboutPage.stats.${key}.label`)}
                </Typography>
              </Box>
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
