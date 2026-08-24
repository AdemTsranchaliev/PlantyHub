import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { brand } from '../../theme'

type Props = {
  title: string
  hint?: string
  children: ReactNode
}

export default function AdminFieldGroup({ title, hint, children }: Props) {
  return (
    <Box
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: '16px',
        bgcolor: brand.white,
        border: `1px solid ${brand.border}`,
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: brand.textSecondary,
          mb: hint ? 0.5 : 1.5,
        }}
      >
        {title}
      </Typography>
      {hint && (
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', mb: 1.5, lineHeight: 1.45 }}>
          {hint}
        </Typography>
      )}
      <Stack spacing={1.75}>{children}</Stack>
    </Box>
  )
}
