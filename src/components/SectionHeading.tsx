import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Reveal from './Reveal'
import { brand } from '../theme'

type SectionHeadingProps = {
  title: React.ReactNode
  subtitle?: string
  eyebrow?: string
  align?: 'left' | 'center'
  size?: 'lg' | 'md'
  compact?: boolean
  light?: boolean
}

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = 'center',
  size = 'lg',
  compact = false,
  light = false,
}: SectionHeadingProps) {
  const textColor = light ? brand.white : brand.graphite
  const subColor = light ? 'rgba(255,255,255,0.78)' : brand.textSecondary
  const accentColor = light ? brand.plantGreenLight : brand.plantGreenDark

  return (
    <Reveal
      sx={{
        mb: compact ? 0 : { xs: 3, sm: 4, md: 5 },
        textAlign: align,
        maxWidth: align === 'center' ? { xs: '100%', sm: 700 } : 'none',
        mx: align === 'center' ? 'auto' : 0,
      }}
    >
      {eyebrow && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            mb: { xs: 1.5, sm: 2 },
            px: 1.5,
            py: 0.6,
            borderRadius: 999,
            bgcolor: light ? 'rgba(255,255,255,0.1)' : brand.plantGreenMuted,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accentColor }} />
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: accentColor,
            }}
          >
            {eyebrow}
          </Typography>
        </Box>
      )}
      <Typography
        component="h2"
        sx={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: size === 'lg' ? { xs: '1.85rem', sm: '2.2rem', md: '2.7rem' } : { xs: '1.5rem', sm: '1.7rem', md: '2.05rem' },
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: textColor,
          lineHeight: 1.1,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ mt: { xs: 1.5, sm: 1.75 }, color: subColor, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.08rem' }, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>
      )}
    </Reveal>
  )
}
