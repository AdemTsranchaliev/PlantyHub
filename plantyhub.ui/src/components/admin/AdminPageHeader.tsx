import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { brand } from '../../theme'

type Props = {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function AdminPageHeader({ title, subtitle, action }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}
    >
      <Box>
        <Typography variant="h4" sx={{ color: brand.graphite, fontSize: { xs: '1.5rem', md: '1.75rem' }, mb: subtitle ? 0.5 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem' }}>{subtitle}</Typography>
        )}
      </Box>
      {action}
    </Stack>
  )
}

export function AdminBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {i > 0 && <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem' }}>/</Typography>}
          {item.to ? (
            <Link component={RouterLink} to={item.to} underline="hover" sx={{ fontSize: '0.85rem', fontWeight: 600, color: brand.textSecondary }}>
              {item.label}
            </Link>
          ) : (
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.graphite }}>{item.label}</Typography>
          )}
        </Box>
      ))}
    </Stack>
  )
}
