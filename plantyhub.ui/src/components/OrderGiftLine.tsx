import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { brand } from '../theme'

type Gift = {
  name: string
  image: string
  compareAt?: string
}

type Props = {
  gift: Gift
  compact?: boolean
}

export default function OrderGiftLine({ gift, compact = false }: Props) {
  const { t } = useTranslation()
  const size = compact ? 32 : 40

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        mt: 0.75,
        p: compact ? 0.75 : 1,
        pr: 1.25,
        borderRadius: '12px',
        border: `1.5px dashed ${brand.plantGreen}`,
        bgcolor: brand.plantGreenMuted,
        maxWidth: 360,
      }}
    >
      {gift.image ? (
        <Box
          component="img"
          src={gift.image}
          alt=""
          sx={{
            width: size,
            height: size,
            borderRadius: '8px',
            objectFit: 'contain',
            bgcolor: brand.white,
            flexShrink: 0,
          }}
        />
      ) : null}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: brand.plantGreenDark, lineHeight: 1.2 }}>
          {t('cart.freeGift')}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: compact ? '0.8rem' : '0.85rem', color: brand.graphite, lineHeight: 1.3 }}>
          {gift.name}
        </Typography>
      </Box>
      <Stack spacing={0} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: brand.plantGreen, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {t('pdp.bonus.free')}
        </Typography>
        {gift.compareAt ? (
          <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, textDecoration: 'line-through' }}>
            {gift.compareAt}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  )
}
