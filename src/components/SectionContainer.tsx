import Box from '@mui/material/Box'
import { brand } from '../theme'

/** Horizontal page padding — matches safe areas on notched phones */
export const pagePaddingX = {
  xs: 'max(16px, env(safe-area-inset-left))',
  sm: 3,
  md: 4,
} as const

type SectionContainerProps = {
  children: React.ReactNode
  id?: string
  bgcolor?: string
  py?: { xs: number; sm?: number; md: number }
  /** Allow horizontal scroll children to bleed to screen edge on mobile */
  bleedX?: boolean
}

export default function SectionContainer({
  children,
  id,
  bgcolor = brand.white,
  py = { xs: 6, sm: 7, md: 9 },
  bleedX = false,
}: SectionContainerProps) {
  return (
    <Box id={id} component="section" sx={{ bgcolor, py }}>
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: bleedX ? { xs: 0, sm: pagePaddingX.sm, md: pagePaddingX.md } : pagePaddingX,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
