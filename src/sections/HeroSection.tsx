import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import { useTranslation } from 'react-i18next'
import { pagePaddingX } from '../components/SectionContainer'
import { campaignHeroImage, heroPodThumbs, homeGardenImage, homeGardenPrice, homeGardenSpecKeys, navHrefs } from '../data/catalog'
import { brand } from '../theme'

const specIcons = {
  pods: SpaOutlinedIcon,
  irrigation: OpacityOutlinedIcon,
  led: LightModeOutlinedIcon,
  qr: QrCode2OutlinedIcon,
} as const

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: brand.white,
        minHeight: { xs: 'auto', lg: 'min(88svh, 860px)' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: 1400,
          mx: 'auto',
          px: pagePaddingX,
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Grid container spacing={{ xs: 3, md: 5, lg: 6 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box className="hero-fade-up" sx={{ maxWidth: 520 }}>
              <Chip
                label={t('hero.eyebrow')}
                sx={{
                  mb: 2.5,
                  bgcolor: brand.plantGreenMuted,
                  color: brand.plantGreenDark,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  height: 32,
                }}
              />
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2.15rem', sm: '2.65rem', md: '3.1rem', lg: '3.45rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.06,
                  mb: 2,
                  color: brand.graphite,
                }}
              >
                {t('hero.titleBefore')}{' '}
                <Box component="span" sx={{ color: brand.plantGreen, display: 'inline' }}>
                  {t('hero.titleHighlight')}
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: brand.textSecondary,
                  fontSize: { xs: '1rem', sm: '1.08rem', md: '1.12rem' },
                  lineHeight: 1.75,
                  mb: 3.5,
                }}
              >
                {t('hero.description')}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
                <Button variant="contained" size="large" href={navHrefs.gardens} fullWidth sx={{ width: { sm: 'auto' }, px: { sm: 4 } }}>
                  {t('hero.ctaPrimary')}
                </Button>
                <Button variant="outlined" size="large" href={navHrefs.pods} fullWidth sx={{ width: { sm: 'auto' } }}>
                  {t('hero.ctaSecondary')}
                </Button>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: brand.plantGreenDark, lineHeight: 1 }}>
                    {homeGardenPrice}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('hero.priceLabel')}
                  </Typography>
                </Box>
                <Box sx={{ width: '1px', bgcolor: brand.border, display: { xs: 'none', sm: 'block' } }} />
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, lineHeight: 1.6, alignSelf: 'center' }}>
                  {t('hero.shippingNote')}
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Box className="hero-fade-up-delay" sx={{ position: 'relative' }}>
              <Box
                sx={{
                  borderRadius: { xs: 3, md: 4 },
                  overflow: 'hidden',
                  boxShadow: brand.shadowHover,
                  border: `1px solid ${brand.border}`,
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src={campaignHeroImage}
                  alt={t('hero.imageAlt')}
                  sx={{
                    width: '100%',
                    aspectRatio: { xs: '4/3', md: '16/10', lg: '5/4' },
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 50%, rgba(43,43,43,0.55) 100%)',
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: brand.plantGreen,
                    color: brand.white,
                    borderRadius: 999,
                    px: 1.75,
                    py: 0.75,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    boxShadow: brand.shadow,
                  }}
                >
                  {t('hero.badge')}
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: { xs: 'none', sm: 'flex' },
                    gap: 1.5,
                    alignItems: 'flex-end',
                  }}
                >
                  <Box
                    sx={{
                      width: 88,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${brand.white}`,
                      boxShadow: brand.shadow,
                    }}
                  >
                    <Box
                      component="img"
                      src={homeGardenImage}
                      alt={t('products.gardens.home-garden.name')}
                      sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{ color: brand.white, pb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
                      {t('products.gardens.home-garden.name')}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {t('products.gardens.home-garden.tagline')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  bgcolor: brand.surface,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {homeGardenSpecKeys.map((key) => {
                    const Icon = specIcons[key]
                    return (
                      <Grid key={key} size={{ xs: 6, sm: 3 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              bgcolor: brand.plantGreenMuted,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon sx={{ fontSize: 16, color: brand.plantGreenDark }} />
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.72rem', lineHeight: 1.3 }}>
                            {t(`support.specs.${key}`)}
                          </Typography>
                        </Stack>
                      </Grid>
                    )
                  })}
                </Grid>
                <Stack direction="row" spacing={1}>
                  {heroPodThumbs.map((thumb) => (
                    <Box
                      key={thumb.label}
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${brand.border}`,
                        aspectRatio: '16/10',
                      }}
                    >
                      <Box
                        component="img"
                        src={thumb.src}
                        alt={thumb.label}
                        loading="lazy"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
