import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { pagePaddingX } from '../components/SectionContainer'
import { navHrefs } from '../data/catalog'
import { useProduct } from '../hooks/useProducts'
import { useHomepageImages, useHt, useHi } from '../hooks/useHomepage'
import { responsiveObjectPosition } from '../media/imageFocus'
import { stockImages } from '../data/images'
import { resolveHref } from '../paths'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const paper = '#F3F6F0'
const line = 'rgba(31, 90, 59, 0.14)'

const statKeys = ['pods', 'light', 'height'] as const

function HeroFacts() {
  return (
    <Box
      className="hero-fade-up-late"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        mt: { xs: 3, md: 4, lg: 4.5 },
        pt: { xs: 2, md: 2.5 },
        borderTop: `1px solid ${line}`,
      }}
    >
      {statKeys.map((statKey, index) => (
        <HeroFact key={statKey} statKey={statKey} withRule={index > 0} />
      ))}
    </Box>
  )
}

function HeroFact({ statKey, withRule }: { statKey: (typeof statKeys)[number]; withRule: boolean }) {
  const value = useHt(`hero.stats.${statKey}.value`)
  const label = useHt(`hero.stats.${statKey}.label`)
  return (
    <Box
      sx={{
        minWidth: 0,
        pl: withRule ? { xs: 1.25, sm: 2 } : 0,
        pr: { xs: 1, sm: 1.5 },
        borderLeft: withRule ? `1px solid ${line}` : 'none',
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 560,
          fontSize: { xs: '1.2rem', sm: '1.45rem', lg: '1.6rem' },
          color: brand.plantGreenDark,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          mt: 0.6,
          color: brand.textSecondary,
          fontSize: { xs: '0.68rem', sm: '0.75rem' },
          fontWeight: 650,
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default function HeroSection() {
  const garden = useProduct('gardens', 'homegarder-one')
  const images = useHomepageImages()
  const heroImage = useHi('hero.main', garden?.image ?? stockImages.homeGardenProduct)
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
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(400px, 48%) minmax(0, 1fr)', lg: 'minmax(480px, 540px) minmax(0, 1fr)', xl: 'minmax(520px, 620px) minmax(0, 1fr)' },
        minHeight: { md: 'max(640px, min(780px, calc(100svh - 108px)))' },
        bgcolor: paper,
        overflow: 'hidden',
      }}
    >
      <Box
        className="hero-fade-up"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          order: { xs: 1, md: 0 },
          px: pagePaddingX,
          pt: { xs: 3.25, md: 4.5, lg: 5.5 },
          pb: { xs: 3.5, md: 4.5, lg: 5.5 },
          backgroundColor: paper,
          backgroundImage: `
            radial-gradient(ellipse 72% 48% at 0% 108%, rgba(47, 125, 83, 0.13) 0%, transparent 58%),
            radial-gradient(ellipse 46% 34% at 12% 0%, rgba(227, 159, 118, 0.20) 0%, transparent 68%)
          `,
        }}
      >
        <Box sx={{ maxWidth: 520 }}>
          {priceLabel ? (
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 750,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: brand.plantGreen,
                mb: 1.25,
              }}
            >
              {priceLabel}
            </Typography>
          ) : null}

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: { xs: 'clamp(2.25rem, 8vw, 2.85rem)', md: '2.9rem', lg: '3.55rem', xl: '3.9rem' },
              fontWeight: 560,
              letterSpacing: '-0.04em',
              lineHeight: 0.98,
              mb: { xs: 1.35, md: 1.6 },
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
              fontWeight: 500,
              fontSize: { xs: '1.2rem', md: '1.3rem', lg: '1.45rem' },
              color: brand.plantGreenDark,
              mb: 1.35,
              lineHeight: 1.25,
              maxWidth: 460,
            }}
          >
            {promise}
          </Typography>

          <Typography
            sx={{
              color: brand.textSecondary,
              fontSize: { xs: '0.98rem', lg: '1.05rem' },
              lineHeight: 1.55,
              mb: { xs: 2.5, md: 3 },
              maxWidth: 460,
            }}
          >
            {description}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            useFlexGap
            sx={{ flexWrap: 'wrap', mb: trustShipping ? 1.75 : 0 }}
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={navHrefs.buy}
              endIcon={<ArrowForwardRounded />}
              sx={{ px: { sm: 3.25 }, minHeight: 52 }}
            >
              {price ? `${ctaPrimary} · ${price}` : ctaPrimary}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href={resolveHref(navHrefs.howItWorks)}
              sx={{ minHeight: 52 }}
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

          <HeroFacts />
        </Box>
      </Box>

      <Box
        className="hero-fade-up-delay"
        sx={{
          position: 'relative',
          order: { xs: 0, md: 0 },
          minHeight: { xs: 240, sm: 300, md: '100%' },
          height: { xs: 'min(300px, 62vw)', sm: 'min(360px, 42vw)', md: 'auto' },
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
            objectPosition: responsiveObjectPosition(images, 'hero.main', 'mobile', 'desktop'),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: {
              xs: `linear-gradient(to top, ${paper} 0%, rgba(243, 246, 240, 0) 32%)`,
              md: `linear-gradient(90deg, ${paper} 0%, rgba(243, 246, 240, 0) 12%)`,
            },
          }}
        />
      </Box>
    </Box>
  )
}
