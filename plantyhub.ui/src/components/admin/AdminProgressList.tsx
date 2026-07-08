import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import { brand } from '../../theme'

type Item = {
  label: string
  value: number
  color?: string
}

type Props = {
  items: Item[]
  total?: number
}

export default function AdminProgressList({ items, total }: Props) {
  const sum = total ?? items.reduce((acc, i) => acc + i.value, 0)

  return (
    <Stack spacing={2}>
      {items.map((item) => {
        const pct = sum > 0 ? (item.value / sum) * 100 : 0
        return (
          <Box key={item.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: brand.graphite }}>{item.label}</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: brand.graphite }}>
                {item.value}{' '}
                <Typography component="span" sx={{ color: brand.textSecondary, fontWeight: 500, fontSize: '0.82rem' }}>
                  ({pct.toFixed(0)}%)
                </Typography>
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: brand.surface,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 999,
                  bgcolor: item.color ?? brand.plantGreen,
                },
              }}
            />
          </Box>
        )
      })}
    </Stack>
  )
}
