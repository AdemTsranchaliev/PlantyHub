import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import {
  homeGardenImage,
  navHrefs,
  starterBundleDetailKeys,
  starterBundleItemKeys,
  starterBundlePrice,
} from '../data/catalog'
import { stockImages } from '../data/images'
import { resolveHref } from '../paths'
import { brand } from '../theme'

export default function StarterBundleSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer py={{ xs: 5, sm: 7, md: 9 }} bgcolor={brand.beige}>
      <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeading
            align="left"
            eyebrow={t('starterBundle.eyebrow')}
            title={t('starterBundle.title')}
            subtitle={t('starterBundle.description')}
          />

          <Stack spacing={2} sx={{ mt: 3, mb: 3 }}>
            {starterBundleItemKeys.map((key) => (
              <Stack key={key} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <CheckCircleOutlinedIcon sx={{ color: brand.plantGreen, fontSize: 22, mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {t(`starterBundle.items.${key}.title`)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {t(`starterBundle.items.${key}.description`)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          <Box
            sx={{
              bgcolor: brand.white,
              borderRadius: 3,
              p: 2.5,
              border: `1px solid ${brand.beigeDark}`,
              mb: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
              {t('starterBundle.diyKitTitle')}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {starterBundleDetailKeys.map((key) => (
                <Chip
                  key={key}
                  label={t(`starterBundle.details.${key}`)}
                  size="small"
                  sx={{
                    bgcolor: brand.surface,
                    fontWeight: 600,
                    fontSize: '0.78rem',
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem' }}>{starterBundlePrice}</Typography>
            <Button variant="contained" size="large" href={resolveHref(navHrefs.gardens)}>
              {t('starterBundle.cta')}
            </Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={stockImages.outdoorDeck}
              alt={t('starterBundle.imageAlt')}
              loading="lazy"
              sx={{
                width: '100%',
                borderRadius: 4,
                aspectRatio: '4/5',
                objectFit: 'cover',
                display: 'block',
                boxShadow: brand.shadowHover,
              }}
            />
            <Box
              component="img"
              src={homeGardenImage}
              alt={t('products.gardens.homegarder-one.name')}
              loading="lazy"
              sx={{
                position: 'absolute',
                bottom: { xs: 16, md: 24 },
                left: { xs: 16, md: 24 },
                width: { xs: '42%', sm: '38%' },
                borderRadius: 3,
                border: `3px solid ${brand.white}`,
                boxShadow: brand.shadowHover,
                display: 'block',
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
