import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { brand } from '../../theme'

type Props = {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

export default function AdminStatCard({ label, value, icon, trend, trendUp }: Props) {
  return (
    <Box
      sx={{
        bgcolor: brand.white,
        borderRadius: '20px',
        border: `1px solid ${brand.border}`,
        p: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        transition: 'box-shadow 0.2s ease',
        '@media (hover: hover)': {
          '&:hover': { boxShadow: brand.shadow },
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          bgcolor: brand.plantGreenMuted,
          color: brand.plantGreen,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ color: brand.graphite, fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              mt: 0.5,
              color: trendUp ? brand.plantGreen : brand.peach,
            }}
          >
            {trend}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
