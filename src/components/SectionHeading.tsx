import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
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
    <Box
      sx={{
        mb: compact ? 0 : { xs: 3, sm: 4, md: 5 },
        textAlign: align,
        maxWidth: align === 'center' ? { xs: '100%', sm: 680 } : 'none',
        mx: align === 'center' ? 'auto' : 0,
      }}
    >
      {eyebrow && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: 1, mb: { xs: 1, sm: 1.25 } }}>
          <Box sx={{ width: 24, height: 2, borderRadius: 1, bgcolor: accentColor }} />
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
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
          fontSize: size === 'lg' ? { xs: '1.6rem', sm: '1.9rem', md: '2.4rem' } : { xs: '1.35rem', sm: '1.55rem', md: '1.9rem' },
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: textColor,
          lineHeight: 1.12,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ mt: { xs: 1.25, sm: 1.5 }, color: subColor, fontSize: { xs: '0.92rem', sm: '0.98rem', md: '1.05rem' }, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}
