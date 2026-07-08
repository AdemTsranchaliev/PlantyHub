import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import Logo from '../components/Logo'
import SectionContainer from '../components/SectionContainer'
import { homeGardenImage, homeGardenPrice, homeGardenSpecKeys } from '../data/catalog'
import { brand } from '../theme'

export default function SupportSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="support" bgcolor={brand.graphite}>
      <Grid container spacing={6} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Logo size="lg" />
          <Typography variant="h3" sx={{ color: brand.white, mb: 2, mt: 3 }}>
            {t('support.name')}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 3, lineHeight: 1.7 }}>
            {t('support.description')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {homeGardenSpecKeys.map((spec) => (
              <Box
                key={spec}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {t(`support.specs.${spec}`)}
              </Box>
            ))}
          </Stack>
          <Typography variant="h4" sx={{ color: brand.white, mb: 2 }}>
            {homeGardenPrice}
          </Typography>
          <Button variant="contained" size="large">
            {t('common.addToCart')}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <Box
              component="img"
              src={homeGardenImage}
              alt={t('support.name')}
              sx={{
                width: '100%',
                borderRadius: 2,
                aspectRatio: '4/3',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.06)',
                borderRadius: 2,
                p: 3,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ color: brand.white, mb: 1 }}>
                {t('support.helpTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mb: 2 }}>
                {t('support.helpDescription')}
              </Typography>
              <Stack spacing={2} component="form" onSubmit={(e) => e.preventDefault()}>
                <TextField
                  fullWidth
                  placeholder={t('support.emailPlaceholder')}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: brand.white,
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{ bgcolor: brand.plantGreen, '&:hover': { bgcolor: brand.plantGreenDark } }}
                >
                  {t('support.cta')}
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2, display: 'block' }}>
                {t('support.emailOr')}{' '}
                <Link href="mailto:support@plantyhub.com" sx={{ color: brand.plantGreen }}>
                  support@plantyhub.com
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
