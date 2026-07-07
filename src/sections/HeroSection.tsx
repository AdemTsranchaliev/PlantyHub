import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined'
import BoltOutlined from '@mui/icons-material/BoltOutlined'
import { useTranslation } from 'react-i18next'
import { pagePaddingX } from '../components/SectionContainer'
import { campaignHeroImage, homeGardenPrice, navHrefs } from '../data/catalog'
import { brand } from '../theme'

const trustItems = [
  { key: 'shipping', Icon: LocalShippingOutlined },
  { key: 'guarantee', Icon: VerifiedOutlined },
  { key: 'setup', Icon: BoltOutlined },
] as const

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: brand.gradientHero,
        minHeight: { xs: 'auto', lg: 'min(92svh, 920px)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-6%',
          width: '46%',
          height: '70%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.plantGreenGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-12%',
          left: '-8%',
          width: '40%',
          height: '58%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.peachGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          maxWidth: 1400,
          mx: 'auto',
          px: pagePaddingX,
          py: { xs: 5, sm: 7, md: 9 },
        }}
      >
        <Grid container spacing={{ xs: 4, md: 6, lg: 9 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box className="hero-fade-up" sx={{ maxWidth: 600 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
                <Stack direction="row" sx={{ color: '#CE8A4A' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarRounded key={i} sx={{ fontSize: 18 }} />
                  ))}
                </Stack>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.textSecondary }}>
                  {t('hero.badge')}
                </Typography>
              </Stack>

              <Typography
                component="h1"
                variant="h1"
                sx={{ color: brand.graphite, mb: 1.5 }}
              >
                {t('hero.title')}
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: { xs: '1.3rem', sm: '1.55rem' },
                  color: brand.plantGreenDark,
                  mb: 2.5,
                  lineHeight: 1.3,
                }}
              >
                {t('hero.promise')}
              </Typography>

              <Typography
                sx={{
                  color: brand.textSecondary,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  lineHeight: 1.75,
                  mb: 4,
                  maxWidth: 480,
                }}
              >
                {t('hero.description')}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4 }}>
                <Button variant="contained" size="large" href={navHrefs.product} fullWidth sx={{ width: { sm: 'auto' }, px: { sm: 4.5 } }}>
                  {t('hero.ctaPrimary')}
                </Button>
                <Button variant="outlined" size="large" href={navHrefs.howItWorks} fullWidth sx={{ width: { sm: 'auto' } }}>
                  {t('hero.ctaSecondary')}
                </Button>
              </Stack>

              <Stack
                direction="row"
                useFlexGap
                sx={{ flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 }, pt: 3, borderTop: `1px solid ${brand.border}` }}
              >
                {trustItems.map(({ key, Icon }) => (
                  <Stack key={key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Icon sx={{ fontSize: 20, color: brand.plantGreen }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: brand.graphite }}>
                      {t(`hero.trust.${key}`)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box className="hero-fade-up-delay" sx={{ position: 'relative', maxWidth: 580, mx: { xs: 'auto', lg: 0 }, ml: { lg: 'auto' } }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: '-6%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${brand.plantGreenGlow} 0%, ${brand.peachGlow} 55%, transparent 72%)`,
                  filter: 'blur(48px)',
                  zIndex: 0,
                }}
              />
              <Box
                className="hero-device-float"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '28px',
                  overflow: 'hidden',
                  boxShadow: brand.shadowHover,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <Box
                  component="img"
                  src={campaignHeroImage}
                  alt={t('hero.imageAlt')}
                  sx={{ width: '100%', aspectRatio: { xs: '4/3', lg: '1/1' }, objectFit: 'cover', display: 'block' }}
                />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: 12, sm: 22 },
                  left: { xs: 10, sm: -22 },
                  zIndex: 2,
                  bgcolor: brand.white,
                  borderRadius: '18px',
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1.4, sm: 1.75 },
                  boxShadow: brand.shadowHover,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.5rem', lineHeight: 1, color: brand.plantGreenDark }}>
                  {homeGardenPrice}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: brand.textSecondary }}>
                  {t('hero.priceLabel')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
