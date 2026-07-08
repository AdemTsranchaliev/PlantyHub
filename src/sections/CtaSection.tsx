import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckRounded from '@mui/icons-material/CheckRounded'
import { pagePaddingX } from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { lifestyleImages } from '../data/images'
import { useProduct } from '../hooks/useProducts'
import { useHt, useHi } from '../hooks/useHomepage'
import { brand } from '../theme'

const trustKeys = ['shipping', 'guarantee', 'setup'] as const

export default function CtaSection() {
  const bundle = useProduct('gardens', 'starter-bundle')
  const title = useHt('cta.title')
  const subtitle = useHt('cta.subtitle', { price: bundle?.price ?? '€129.00' })
  const emailPlaceholder = useHt('cta.emailPlaceholder')
  const button = useHt('cta.button')
  const ctaImage = useHi('cta.main', lifestyleImages.mintKitchen)
  const trustShipping = useHt('hero.trust.shipping')
  const trustGuarantee = useHt('hero.trust.guarantee')
  const trustSetup = useHt('hero.trust.setup')
  const trustLabels = { shipping: trustShipping, guarantee: trustGuarantee, setup: trustSetup }

  return (
    <Box
      id="cta"
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: brand.gradientCta,
        color: brand.white,
        py: { xs: 7, sm: 9, md: 12 },
      }}
    >
      <Box
        sx={{
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
        <Grid container spacing={{ xs: 5, md: 7 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: { xs: '2.1rem', sm: '2.6rem', md: '3rem' },
                  letterSpacing: '-0.015em',
                  lineHeight: 1.05,
                  mb: 2,
                }}
              >
                {title}
              </Typography>
              <Typography sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.7, opacity: 0.92, mb: 4, maxWidth: 480 }}>
                {subtitle}
              </Typography>

              <Stack
                component="form"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                onSubmit={(e) => e.preventDefault()}
                sx={{ width: '100%', maxWidth: 500, mb: 3 }}
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
                      minHeight: 52,
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: brand.graphite,
                    color: brand.white,
                    px: 4,
                    minHeight: 52,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: brand.graphiteSoft },
                  }}
                >
                  {button}
                </Button>
              </Stack>

              <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 } }}>
                {trustKeys.map((key) => (
                  <Stack key={key} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <CheckRounded sx={{ fontSize: 18, color: brand.peach }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95 }}>
                      {trustLabels[key]}
                    </Typography>
                  </Stack>
                ))}
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
                <Box
                  component="img"
                  src={ctaImage}
                  alt={title}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    aspectRatio: '4/5',
                    objectFit: 'cover',
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
