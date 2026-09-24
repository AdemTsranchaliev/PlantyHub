import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { brand } from '../../theme'

type BarItem = {
  label: string
  value: number
}

type Props = {
  items: BarItem[]
  formatValue?: (value: number) => string
}

export default function AdminBarChart({ items, formatValue = (v) => `€${v}` }: Props) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const hasSales = items.some((item) => item.value > 0)

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.75, sm: 1.5 }, height: 200, pt: 1 }}>
      {items.map((item) => {
        const heightPct = hasSales ? (item.value / max) * 100 : 0
        return (
          <Box key={item.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0, height: '100%' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: item.value > 0 ? brand.graphite : brand.textSecondary, fontVariantNumeric: 'tabular-nums', minHeight: '1rem' }}>
              {item.value > 0 ? formatValue(item.value) : ''}
            </Typography>
            <Box sx={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 36,
                  height: item.value > 0 ? `${Math.max(heightPct, 8)}%` : 4,
                  borderRadius: '8px 8px 3px 3px',
                  background: item.value > 0
                    ? `linear-gradient(180deg, ${brand.plantGreenLight} 0%, ${brand.plantGreen} 100%)`
                    : brand.border,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: brand.textSecondary }}>
              {item.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
