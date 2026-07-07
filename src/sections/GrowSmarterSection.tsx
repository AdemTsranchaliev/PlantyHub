import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import { growSmarterIds } from '../data/catalog'
import { brand } from '../theme'

const icons = {
  zero: BoltOutlinedIcon,
  noSoil: SpaOutlinedIcon,
  fresh: RestaurantOutlinedIcon,
} as const

export default function GrowSmarterSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="story" py={{ xs: 5, sm: 7, md: 10 }}>
      <SectionHeading title={t('growSmarter.title')} subtitle={t('growSmarter.subtitle')} />

      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: 36,
            left: '12%',
            right: '12%',
            height: 2,
            bgcolor: brand.border,
            zIndex: 0,
          }}
        />
        <Grid container spacing={{ xs: 2.5, sm: 3, md: 4 }} sx={{ position: 'relative', zIndex: 1 }}>
          {growSmarterIds.map((id, index) => {
            const Icon = icons[id]
            return (
              <Grid key={id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    textAlign: { sm: 'center' },
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 4,
                    bgcolor: brand.white,
                    border: `1px solid ${brand.border}`,
                    boxShadow: brand.shadow,
                  }}
                >
                  <Stack direction={{ xs: 'row', sm: 'column' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: brand.plantGreen,
                        color: brand.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        boxShadow: brand.shadowGreen,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { sm: 'center' }, mb: 1 }}>
                        <Icon sx={{ color: brand.plantGreenDark, fontSize: 20, display: { sm: 'none' } }} />
                        <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>
                          {t(`growSmarter.items.${id}.title`)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, textAlign: { xs: 'left', sm: 'center' } }}>
                        {t(`growSmarter.items.${id}.description`)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </SectionContainer>
  )
}
