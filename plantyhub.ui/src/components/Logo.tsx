import Box from '@mui/material/Box'
import { logoSrc } from '../data/images'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
}

const heights = {
  sm: { xs: 28, md: 32 },
  md: { xs: 32, sm: 34, md: 38 },
  lg: { xs: 40, md: 48 },
}

export default function Logo({ size = 'md' }: LogoProps) {
  return (
    <Box
      component="img"
      src={logoSrc}
      alt="PlantyHub"
      sx={{
        height: heights[size],
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
      }}
    />
  )
}
