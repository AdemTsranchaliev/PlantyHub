import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { brand } from '../theme'

export default function PromoBar() {
  const { t } = useTranslation()

  return (
    <Typography
      component="div"
      sx={{
        bgcolor: brand.plantGreenDark,
        color: brand.white,
        py: { xs: 0.65, sm: 1.15 },
        px: 2,
        textAlign: 'center',
        fontWeight: 700,
        fontSize: { xs: '0.68rem', sm: '0.7rem', md: '0.72rem' },
        letterSpacing: { xs: '0.03em', sm: '0.08em', md: '0.1em' },
        textTransform: 'uppercase',
        lineHeight: 1.35,
      }}
    >
      {t('promo')}
    </Typography>
  )
}
