import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink } from 'react-router-dom'
import { pagePaddingX } from '../components/SectionContainer'
import { navHrefs } from '../data/catalog'
import { useProduct } from '../hooks/useProducts'
import { useHt, useHi } from '../hooks/useHomepage'
import { stockImages } from '../data/images'
import { resolveHref } from '../paths'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const statKeys = ['pods', 'light', 'height'] as const

function HeroStat({ statKey }: { statKey: (typeof statKeys)[number] }) {
  const value = useHt(`hero.stats.${statKey}.value`)
  const label = useHt(`hero.stats.${statKey}.label`)
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          fontSize: { sm: '1.35rem', md: '1.5rem' },
          color: brand.plantGreenDark,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: brand.textSecondary, fontSize: '0.7rem', lineHeight: 1.3, display: 'block', letterSpacing: '0.02em' }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default function HeroSection() {
  const garden = useProduct('gardens', 'homegarder-one')
  const heroImage = useHi('hero.main', garden?.image ?? stockImages.homeGardenProduct)
  const badge = useHt('hero.badge')
  const title = useHt('hero.title')
  const promise = useHt('hero.promise')
  const description = useHt('hero.description')
  const ctaPrimary = useHt('hero.ctaPrimary')
  const ctaSecondary = useHt('hero.ctaSecondary')
  const imageAlt = useHt('hero.imageAlt')

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
      {/* Soft atmosphere */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 55% at 70% 20%, ${brand.plantGreenGlow} 0%, transparent 65%),
            radial-gradient(ellipse 45% 40% at 10% 90%, rgba(227, 159, 118, 0.10) 0%, transparent 55%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* ── Mobile: compact light hero ── */}
      <Box sx={{ display: { xs: 'block', lg: 'none' }, position: 'relative', px: pagePaddingX, pt: 1.5, pb: 3.5 }}>
        <Box
          className="hero-fade-up-delay"
          sx={{
            position: 'relative',
            borderRadius: '22px',
            overflow: 'hidden',
            mb: 2.25,
            boxShadow: brand.shadowHover,
            border: `3px solid ${brand.white}`,
            maxHeight: 220,
          }}
        >
          <MediaImg
            className="hero-image-reveal"
            src={heroImage}
            preset="hero"
            alt={imageAlt}
            loading="eager"
            sx={{
              width: '100%',
              height: 220,
              objectFit: 'cover',
              objectPosition: 'center 30%',
              display: 'block',
            }}
          />
        </Box>

        <Box className="hero-fade-up">
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.25 }}>
            <Stack direction="row" sx={{ color: '#CE8A4A' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <StarRounded key={i} sx={{ fontSize: 15 }} />
              ))}
            </Stack>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: brand.graphite }}>{badge}</Typography>
          </Stack>

          <Typography
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '-0.03em',
              color: brand.plantGreenDark,
              mb: 0.75,
            }}
          >
            PlantyHub
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 'clamp(1.85rem, 7.5vw, 2.35rem)',
              fontWeight: 650,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              mb: 1,
              color: brand.graphite,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
              color: brand.plantGreenDark,
              mb: 1,
              lineHeight: 1.4,
            }}
          >
            {promise}
          </Typography>

          <Typography
            sx={{
              color: brand.textSecondary,
              fontSize: '0.95rem',
              lineHeight: 1.55,
              mb: 2.5,
              maxWidth: 420,
            }}
          >
            {description}
          </Typography>

          <Stack spacing={1.15}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={navHrefs.buy}
              fullWidth
              endIcon={<ArrowForwardRounded />}
              sx={{
                minHeight: 50,
                '&.MuiButton-sizeLarge': { minHeight: 50 },
                fontSize: '1rem',
              }}
            >
              {ctaPrimary} · {garden?.price}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href={resolveHref(navHrefs.howItWorks)}
              fullWidth
              sx={{ minHeight: 46, '&.MuiButton-sizeLarge': { minHeight: 46 } }}
            >
              {ctaSecondary}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ── Desktop / tablet: editorial two-column ── */}
      <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', maxWidth: 1400, mx: 'auto', px: pagePaddingX, py: { lg: 6, xl: 7 } }}>
        <Grid container spacing={{ lg: 8, xl: 10 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ lg: 6 }}>
            <Box className="hero-fade-up" sx={{ maxWidth: 560 }}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: brand.white,
                  border: `1px solid ${brand.border}`,
                  boxShadow: brand.shadow,
                  borderRadius: 999,
                  pl: 1,
                  pr: 1.75,
                  py: 0.65,
                  mb: 3,
                }}
              >
                <Stack direction="row" sx={{ color: '#CE8A4A' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarRounded key={i} sx={{ fontSize: 17 }} />
                  ))}
                </Stack>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: brand.graphite }}>{badge}</Typography>
              </Stack>

              <Typography
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: '1.15rem',
                  letterSpacing: '-0.03em',
                  color: brand.plantGreenDark,
                  mb: 1.5,
                }}
              >
                PlantyHub
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: { lg: '3.75rem', xl: '4.35rem' },
                  fontWeight: 650,
                  letterSpacing: '-0.045em',
                  lineHeight: 0.98,
                  mb: 2.25,
                  color: brand.graphite,
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  fontSize: '1.35rem',
                  fontWeight: 500,
                  color: brand.plantGreenDark,
                  mb: 1.75,
                  lineHeight: 1.35,
                  maxWidth: 480,
                }}
              >
                {promise}
              </Typography>

              <Typography
                sx={{
                  color: brand.textSecondary,
                  fontSize: '1.08rem',
                  lineHeight: 1.6,
                  mb: 3.5,
                  maxWidth: 480,
                }}
              >
                {description}
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mb: 4.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to={navHrefs.buy}
                  endIcon={<ArrowForwardRounded />}
                  sx={{ px: 4.5, minHeight: 52, '&.MuiButton-sizeLarge': { minHeight: 52 }, fontSize: '1.02rem' }}
                >
                  {ctaPrimary} · {garden?.price}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href={resolveHref(navHrefs.howItWorks)}
                  sx={{ minHeight: 52, '&.MuiButton-sizeLarge': { minHeight: 52 } }}
                >
                  {ctaSecondary}
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={0}
                divider={
                  <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: brand.border, mx: 2.5 }} />
                }
              >
                {statKeys.map((key) => (
                  <HeroStat key={key} statKey={key} />
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ lg: 6 }}>
            <Box sx={{ position: 'relative', maxWidth: 560, ml: 'auto' }}>
              <Box
                className="hero-fade-up-delay"
                sx={{
                  position: 'absolute',
                  inset: '-10% -4%',
                  borderRadius: '50%',
                  background: `linear-gradient(150deg, ${brand.plantGreenLight} 0%, ${brand.plantGreen} 50%, ${brand.plantGreenDark} 100%)`,
                  opacity: 0.9,
                  zIndex: 0,
                }}
              />
              <Box
                className="hero-fade-up-delay hero-device-float"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '32px',
                  overflow: 'hidden',
                  boxShadow: '0 28px 64px rgba(28, 35, 30, 0.18)',
                  border: `5px solid ${brand.white}`,
                }}
              >
                <MediaImg
                  src={heroImage}
                  preset="hero"
                  alt={imageAlt}
                  loading="eager"
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
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
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
