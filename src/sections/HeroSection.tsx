import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { pagePaddingX } from '../components/SectionContainer'
import { homeGardenImage, homeGardenPrice, navHrefs } from '../data/catalog'
import { brand } from '../theme'

const statKeys = ['pods', 'light', 'height'] as const

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: brand.gradientHero,
        minHeight: { xs: 'auto', lg: 'min(92svh, 900px)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          right: '-6%',
          width: '48%',
          height: '75%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.plantGreenGlow} 0%, transparent 70%)`,
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
        <Grid container spacing={{ xs: 4, md: 6, lg: 8 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box className="hero-fade-up" sx={{ maxWidth: 580 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: brand.white,
                  border: `1px solid ${brand.border}`,
                  boxShadow: brand.shadow,
                  borderRadius: 999,
                  pl: 1,
                  pr: 1.75,
                  py: 0.6,
                  mb: 3,
                }}
              >
                <Stack direction="row" sx={{ color: '#CE8A4A' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarRounded key={i} sx={{ fontSize: 17 }} />
                  ))}
                </Stack>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: brand.graphite }}>
                  {t('hero.badge')}
                </Typography>
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2.7rem', sm: '3.3rem', md: '3.9rem', lg: '4.3rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.045em',
                  lineHeight: 0.98,
                  mb: 2.5,
                  color: brand.graphite,
                }}
              >
                {t('hero.title')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: { xs: '1.35rem', sm: '1.6rem' },
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
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.75,
                  mb: 3.5,
                }}
              >
                {t('hero.description')}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4 }}>
                <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} fullWidth sx={{ width: { sm: 'auto' }, px: { sm: 4.5 } }}>
                  {t('hero.ctaPrimary')} · {homeGardenPrice}
                </Button>
                <Button variant="outlined" size="large" href={navHrefs.howItWorks} fullWidth sx={{ width: { sm: 'auto' } }}>
                  {t('hero.ctaSecondary')}
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${brand.border}`,
                  bgcolor: brand.white,
                  boxShadow: brand.shadow,
                }}
              >
                {statKeys.map((key, i) => (
                  <Box
                    key={key}
                    sx={{
                      flex: 1,
                      px: { xs: 1.5, sm: 2.5 },
                      py: 2,
                      textAlign: 'center',
                      borderRight: i < statKeys.length - 1 ? `1px solid ${brand.border}` : 'none',
                    }}
                  >
                    <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.25rem' }, color: brand.plantGreenDark, lineHeight: 1.2 }}>
                      {t(`hero.stats.${key}.value`)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem' }}>
                      {t(`hero.stats.${key}.label`)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ position: 'relative', maxWidth: 540, mx: { xs: 'auto', lg: 0 }, ml: { lg: 'auto' } }}>
              <Box
                className="hero-fade-up-delay"
                sx={{
                  position: 'absolute',
                  inset: { xs: '-6% 2%', sm: '-8% 0%' },
                  borderRadius: '50%',
                  background: `linear-gradient(150deg, ${brand.plantGreenLight} 0%, ${brand.plantGreen} 55%, ${brand.plantGreenDark} 100%)`,
                  zIndex: 0,
                }}
              />
              <Box
                className="hero-fade-up-delay hero-device-float"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '28px',
                  overflow: 'hidden',
                  boxShadow: brand.shadowHover,
                  border: `4px solid ${brand.white}`,
                }}
              >
                <Box
                  component="img"
                  src={homeGardenImage}
                  alt={t('hero.imageAlt')}
                  loading="eager"
                  sx={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
                />
                <Box
                  className="hero-led-pulse"
                  sx={{
                    position: 'absolute',
                    top: '12%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '72%',
                    height: 8,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    boxShadow: `0 0 24px ${brand.plantGreenGlow}, 0 0 48px rgba(255,255,200,0.4)`,
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 12, sm: 20 },
                  left: { xs: -6, sm: -20 },
                  zIndex: 2,
                  bgcolor: brand.white,
                  borderRadius: 999,
                  px: 1.75,
                  py: 0.9,
                  boxShadow: brand.shadowHover,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LocalShippingOutlined sx={{ fontSize: 18, color: brand.plantGreen }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: brand.graphite }}>
                  {t('hero.trust.shipping')}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: 14, sm: 22 },
                  right: { xs: -6, sm: -18 },
                  bgcolor: brand.graphite,
                  color: brand.white,
                  borderRadius: '18px',
                  px: 2.5,
                  py: 1.5,
                  boxShadow: brand.shadowHover,
                  zIndex: 2,
                }}
              >
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.5rem', lineHeight: 1, color: brand.white }}>
                  {homeGardenPrice}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
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
