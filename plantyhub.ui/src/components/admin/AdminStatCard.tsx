import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { brand } from '../../theme'

type Props = {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  attention?: boolean
}

export default function AdminStatCard({ label, value, icon, trend, trendUp, attention }: Props) {
  return (
    <Box
      sx={{
        bgcolor: brand.white,
        borderRadius: '18px',
        border: `1px solid ${attention ? 'rgba(196, 122, 74, 0.45)' : brand.border}`,
        p: 2,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        height: '100%',
        transition: 'box-shadow 0.2s ease',
        '@media (hover: hover)': {
          '&:hover': { boxShadow: brand.shadow },
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          bgcolor: attention ? 'rgba(227, 159, 118, 0.18)' : brand.plantGreenMuted,
          color: attention ? '#C47A4A' : brand.plantGreen,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& .MuiSvgIcon-root': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', fontWeight: 600, mb: 0.25, lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography sx={{ color: brand.graphite, fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>
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
