import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { growSmarterIds } from '../data/catalog'
import { lifestyleImages } from '../data/images'
import { brand } from '../theme'

const icons = {
  zero: BoltOutlinedIcon,
  noSoil: SpaOutlinedIcon,
  fresh: RestaurantOutlinedIcon,
} as const

export default function GrowSmarterSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="story" bgcolor={brand.white} py={{ xs: 7, sm: 9, md: 12 }}>
      <Grid container spacing={{ xs: 5, md: 7, lg: 9 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Reveal sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                inset: '-8%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${brand.peachGlow} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                borderRadius: '28px',
                overflow: 'hidden',
                border: `1px solid ${brand.border}`,
                boxShadow: brand.shadowHover,
                '& img': { transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' },
                '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.05)' } },
              }}
            >
              <Box
                component="img"
                src={lifestyleImages.basilCloseup}
                alt={t('growSmarter.title')}
                loading="lazy"
                sx={{
                  width: '100%',
                  aspectRatio: { xs: '4/3', md: '4/5' },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Reveal>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Reveal>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: brand.plantGreen,
                mb: 1.5,
              }}
            >
              {t('growSmarter.subtitle')}
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              sx={{ color: brand.graphite, mb: { xs: 3, md: 4 }, maxWidth: 520 }}
            >
              {t('growSmarter.title')}
            </Typography>
          </Reveal>

          <Stack spacing={{ xs: 3, md: 3.5 }}>
            {growSmarterIds.map((id, index) => {
              const Icon = icons[id]
              return (
                <Reveal key={id} delay={index * 0.08}>
                  <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        bgcolor: brand.plantGreenMuted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: brand.plantGreenDark, fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.2rem', md: '1.35rem' }, mb: 0.5, color: brand.graphite }}
                      >
                        {t(`growSmarter.items.${id}.title`)}
                      </Typography>
                      <Typography sx={{ color: brand.textSecondary, lineHeight: 1.75, fontSize: '1rem' }}>
                        {t(`growSmarter.items.${id}.description`)}
                      </Typography>
                    </Box>
                  </Stack>
                </Reveal>
              )
            })}
          </Stack>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
