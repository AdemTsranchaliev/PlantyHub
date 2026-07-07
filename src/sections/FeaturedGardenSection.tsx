import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import { homeGardenImage, homeGardenPrice, homeGardenSpecKeys, navHrefs } from '../data/catalog'
import { brand } from '../theme'

const specIcons = {
  pods: SpaOutlinedIcon,
  irrigation: OpacityOutlinedIcon,
  lightCycle: LightModeOutlinedIcon,
  qr: QrCode2OutlinedIcon,
} as const

export default function FeaturedGardenSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="gardens" py={{ xs: 5, sm: 7, md: 10 }}>
      <Box
        sx={{
          borderRadius: { xs: 4, md: 5 },
          overflow: 'hidden',
          bgcolor: brand.graphite,
          color: brand.white,
          boxShadow: brand.shadowHover,
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: brand.white,
              }}
            >
              <Box
                component="img"
                src={homeGardenImage}
                alt={t('products.gardens.homegarder-one.name')}
                sx={{ width: '100%', maxHeight: { md: 520 }, minHeight: { xs: 280, md: 400 }, objectFit: 'cover', display: 'block' }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <SectionHeading
                align="left"
                compact
                light
                eyebrow={t('featured.badge')}
                title={t('featured.title')}
                subtitle={t('featured.description')}
              />

              <Grid container spacing={2} sx={{ my: 3 }}>
                {homeGardenSpecKeys.map((key) => {
                  const Icon = specIcons[key]
                  return (
                    <Grid key={key} size={{ xs: 6 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ color: brand.plantGreenLight, fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>
                          {t(`support.specs.${key}`)}
                        </Typography>
                      </Stack>
                    </Grid>
                  )
                })}
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, mt: 'auto' }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2rem' }, color: brand.plantGreenLight }}>
                  {homeGardenPrice}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  href={navHrefs.gardens}
                  fullWidth
                  sx={{
                    width: { sm: 'auto' },
                    bgcolor: brand.plantGreen,
                    '&:hover': { bgcolor: brand.plantGreenLight },
                  }}
                >
                  {t('featured.cta')}
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </SectionContainer>
  )
}
