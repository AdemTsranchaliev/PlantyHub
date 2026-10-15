import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { pagePaddingX } from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { lifestyleImages } from '../data/images'
import { useProduct } from '../hooks/useProducts'
import { useHomepageImages, useHt, useHi } from '../hooks/useHomepage'
import { objectPositionForKey } from '../media/imageFocus'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

export default function CtaSection() {
  const garden = useProduct('gardens', 'homegarder-one')
  const title = useHt('cta.title')
  const subtitle = useHt('cta.subtitle', { price: garden?.price ?? '€99.99' })
  const emailPlaceholder = useHt('cta.emailPlaceholder')
  const button = useHt('cta.button')
  const images = useHomepageImages()
  const ctaImage = useHi('cta.main', lifestyleImages.mintKitchen)

  return (
    <Box
      id="cta"
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: brand.gradientCta,
        color: brand.white,
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: '-25%',
          right: '-8%',
          width: '45%',
          height: '120%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.peachGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', maxWidth: 1400, mx: 'auto', px: pagePaddingX }}>
        <Grid container spacing={{ xs: 3.5, md: 7 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.75rem', sm: '2.6rem', md: '3rem' },
                  letterSpacing: '-0.015em',
                  lineHeight: 1.08,
                  mb: { xs: 1.25, sm: 2 },
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1.15rem' }, lineHeight: 1.6, opacity: 0.92, mb: { xs: 2.5, sm: 4 }, maxWidth: 480 }}>
                  {subtitle}
                </Typography>
              )}

              <Stack
                component="form"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                onSubmit={(e) => e.preventDefault()}
                sx={{ width: '100%', maxWidth: 500 }}
              >
                <TextField
                  fullWidth
                  placeholder={emailPlaceholder}
                  size="medium"
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: brand.white,
                      borderRadius: 999,
                      minHeight: { xs: 48, sm: 52 },
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    bgcolor: brand.graphite,
                    color: brand.white,
                    px: 4,
                    minHeight: { xs: 48, sm: 52 },
                    width: { sm: 'auto' },
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: brand.graphiteSoft },
                  }}
                >
                  {button}
                </Button>
              </Stack>
            </Reveal>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Reveal delay={0.1} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: brand.shadowHover,
                  '& img': { transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' },
                  '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.05)' } },
                }}
              >
                <MediaImg
                  src={ctaImage}
                  preset="gallery"
                  alt={title}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    objectPosition: objectPositionForKey(images, 'cta.main', 'main'),
                    display: 'block',
                  }}
                />
              </Box>
            </Reveal>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
