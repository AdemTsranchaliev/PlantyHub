import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { pagePaddingX } from '../components/SectionContainer'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

export default function CtaSection() {
  const { t } = useTranslation()

  return (
    <Box
      component="section"
      sx={{
        background: brand.gradientCta,
        color: brand.white,
        py: { xs: 6, sm: 8, md: 10 },
        px: pagePaddingX,
      }}
    >
      <Stack
        spacing={3}
        sx={{
          maxWidth: 720,
          mx: 'auto',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.65rem' },
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {t('cta.title')}
        </Typography>
        <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.7, opacity: 0.92, maxWidth: 520 }}>
          {t('cta.subtitle')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          href={navHrefs.gardens}
          sx={{
            bgcolor: brand.white,
            color: brand.plantGreenDark,
            px: 5,
            fontWeight: 800,
            '&:hover': { bgcolor: brand.surface, color: brand.plantGreenDark },
          }}
        >
          {t('cta.button')}
        </Button>
      </Stack>
    </Box>
  )
}
