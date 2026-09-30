import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
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
const statFloatClass = ['hero-float', 'hero-float hero-float-late', 'hero-float hero-float-later'] as const

function HeroStat({ statKey, floatClassName }: { statKey: (typeof statKeys)[number]; floatClassName: string }) {
  const value = useHt(`hero.stats.${statKey}.value`)
  const label = useHt(`hero.stats.${statKey}.label`)
  return (
    <Box
      className={floatClassName}
      sx={{
        flex: '1 1 0',
        minWidth: 0,
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: '16px',
        boxShadow: '0 14px 34px rgba(28, 35, 30, 0.12)',
        px: { xs: 1, sm: 1.4 },
        py: { xs: 0.9, sm: 1.15 },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          fontSize: { xs: '1.05rem', sm: '1.25rem', lg: '1.35rem' },
          color: brand.plantGreenDark,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontWeight: 650,
          color: brand.textSecondary,
          fontSize: { xs: '0.62rem', sm: '0.7rem' },
          lineHeight: 1.25,
          display: 'block',
          mt: 0.35,
        }}
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
  const priceLabel = useHt('hero.priceLabel')
  const trustShipping = useHt('hero.trust.shipping')
  const price = garden?.price

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: brand.gradientHero,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 48% 55% at 82% 38%, rgba(76, 163, 116, 0.22) 0%, transparent 68%),
            radial-gradient(ellipse 36% 32% at 6% 92%, rgba(227, 159, 118, 0.16) 0%, transparent 62%)
          `,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(31, 90, 59, 0.14) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 42% 55% at 78% 42%, #000 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 42% 55% at 78% 42%, #000 0%, transparent 72%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
          gap: { xs: 2.25, md: 4, lg: 6, xl: 8 },
          alignItems: 'center',
          maxWidth: 1320,
          mx: 'auto',
          px: pagePaddingX,
          pt: { xs: 1.25, md: 4, lg: 4.5, xl: 5.5 },
          pb: { xs: 3.5, md: 4, lg: 4.5, xl: 5.5 },
        }}
      >
        <Box className="hero-fade-up" sx={{ maxWidth: { md: 560 }, order: { xs: 1, md: 0 } }}>
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: brand.white,
              border: `1px solid ${brand.border}`,
              boxShadow: brand.shadow,
              borderRadius: 999,
              pl: 0.85,
              pr: 1.5,
              py: 0.45,
              mb: { xs: 1.5, md: 2, lg: 2.25 },
            }}
          >
            <Box
              className="hero-dot"
              sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: brand.plantGreen, flexShrink: 0 }}
            />
            <Stack direction="row" sx={{ color: '#CE8A4A' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <StarRounded key={i} sx={{ fontSize: { xs: 14, lg: 16 } }} />
              ))}
            </Stack>
            <Typography sx={{ fontSize: { xs: '0.75rem', lg: '0.8rem' }, fontWeight: 700, color: brand.graphite }}>
              {badge}
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: 'clamp(2.05rem, 7.4vw, 2.6rem)', md: '2.65rem', lg: '3.2rem', xl: '3.6rem' },
              fontWeight: 650,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              mb: { xs: 1.15, md: 1.5, lg: 1.75 },
              color: brand.graphite,
              textWrap: 'balance',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 560,
              fontSize: { xs: '1.15rem', md: '1.25rem', lg: '1.4rem' },
              color: brand.plantGreenDark,
              mb: 1.15,
              lineHeight: 1.3,
              maxWidth: 480,
            }}
          >
            {promise}
          </Typography>

          <Typography
            sx={{
              color: brand.textSecondary,
              fontSize: { xs: '0.95rem', lg: '1.05rem' },
              lineHeight: 1.55,
              mb: { xs: 2.25, md: 2.5, lg: 3 },
              maxWidth: 460,
            }}
          >
            {description}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            useFlexGap
            sx={{ flexWrap: 'wrap', mb: trustShipping ? 1.75 : { xs: 2.5, lg: 3 } }}
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={navHrefs.buy}
              endIcon={<ArrowForwardRounded />}
              sx={{
                px: { sm: 3.5 },
                minHeight: 52,
                '&.MuiButton-sizeLarge': { minHeight: 52 },
                fontSize: '1rem',
              }}
            >
              {price ? `${ctaPrimary} · ${price}` : ctaPrimary}
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

          {trustShipping ? (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: brand.textSecondary }}>
              <LocalShippingOutlined sx={{ fontSize: 18, color: brand.plantGreen }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 650, lineHeight: 1.3 }}>{trustShipping}</Typography>
            </Stack>
          ) : null}
        </Box>

        <Box
          className="hero-fade-up-delay"
          sx={{
            position: 'relative',
            pt: { md: 1 },
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              width: '86%',
              aspectRatio: '1',
              borderRadius: '50%',
              border: '1.5px solid rgba(47, 125, 83, 0.28)',
              top: '-8%',
              right: '-10%',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              borderRadius: { xs: '22px', lg: '32px' },
              overflow: 'hidden',
              boxShadow: '0 28px 60px rgba(28, 35, 30, 0.16)',
              bgcolor: brand.beigeDark,
              aspectRatio: { xs: '5 / 3.5', md: '4 / 4.15' },
              maxHeight: { md: 520, lg: 580 },
            }}
          >
            <MediaImg
              className="hero-image-reveal"
              src={heroImage}
              preset="hero"
              alt={imageAlt}
              loading="eager"
              fetchPriority="high"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 12%',
              }}
            />
            {priceLabel ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 12, lg: 16 },
                  bottom: { xs: 58, md: 72 },
                  bgcolor: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '14px',
                  px: 1.5,
                  py: 1,
                  boxShadow: brand.shadow,
                  maxWidth: '68%',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: brand.plantGreen,
                    lineHeight: 1.2,
                  }}
                >
                  {priceLabel}
                </Typography>
                {price ? (
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 600,
                      fontSize: '1.15rem',
                      letterSpacing: '-0.02em',
                      color: brand.graphite,
                      lineHeight: 1.2,
                      mt: 0.25,
                    }}
                  >
                    {price}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </Box>

          <Stack
            direction="row"
            spacing={{ xs: 0.75, sm: 1.25 }}
            sx={{
              position: 'relative',
              zIndex: 2,
              mt: { xs: -2.75, md: -3.5 },
              mx: { xs: 1, md: 1.5 },
            }}
          >
            {statKeys.map((key, index) => (
              <HeroStat key={key} statKey={key} floatClassName={statFloatClass[index]} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
