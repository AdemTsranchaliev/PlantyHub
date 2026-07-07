import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import { guaranteeIds } from '../data/catalog'
import { brand } from '../theme'

const icons = {
  sprouting: SpaOutlinedIcon,
  yearRound: WbSunnyOutlinedIcon,
  support: HeadsetMicOutlinedIcon,
  sustainable: AutorenewOutlinedIcon,
} as const

export default function GuaranteesSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer bgcolor={brand.beige} py={{ xs: 5, sm: 6, md: 7 }}>
      <Typography
        component="h2"
        sx={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.85rem' },
          letterSpacing: '-0.03em',
          mb: { xs: 3, md: 4 },
        }}
      >
        {t('guarantees.title')}
      </Typography>

      <Grid container spacing={{ xs: 2, md: 0 }} sx={{ alignItems: 'stretch' }}>
        {guaranteeIds.map((id, index) => {
          const Icon = icons[id]
          return (
            <Grid
              key={id}
              size={{ xs: 12, sm: 6, lg: 3 }}
              sx={{
                borderRight: {
                  lg: index < guaranteeIds.length - 1 ? `1px solid ${brand.beigeDark}` : 'none',
                },
              }}
            >
              <Stack
                spacing={1.25}
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                  px: { lg: 2 },
                  py: { xs: 2, lg: 0 },
                  bgcolor: { xs: brand.white, lg: 'transparent' },
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: brand.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: brand.shadow,
                  }}
                >
                  <Icon sx={{ color: brand.plantGreen, fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {t(`guarantees.items.${id}.title`)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: 220 }}>
                  {t(`guarantees.items.${id}.description`)}
                </Typography>
              </Stack>
            </Grid>
          )
        })}
      </Grid>
    </SectionContainer>
  )
}
