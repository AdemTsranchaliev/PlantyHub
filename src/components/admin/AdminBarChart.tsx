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

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 1.5 }, height: 180, pt: 1 }}>
      {items.map((item) => {
        const heightPct = (item.value / max) * 100
        return (
          <Box key={item.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: brand.textSecondary }}>
              {formatValue(item.value)}
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: 48,
                height: `${heightPct}%`,
                minHeight: 8,
                borderRadius: '8px 8px 4px 4px',
                background: `linear-gradient(180deg, ${brand.plantGreenLight} 0%, ${brand.plantGreen} 100%)`,
                transition: 'height 0.4s ease',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: brand.textSecondary }}>
              {item.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
