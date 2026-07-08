import { useRef } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { pagePaddingX } from './SectionContainer'
import { brand } from '../theme'

type HorizontalScrollProps = {
  children: React.ReactNode
  gap?: number
}

export default function HorizontalScroll({ children, gap = 2 }: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    const card = ref.current.querySelector<HTMLElement>('[data-scroll-item]')
    const amount = card ? card.offsetWidth + gap * 8 : ref.current.clientWidth * 0.85
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          left: { md: -44, lg: -48 },
          top: '36%',
          zIndex: 2,
          bgcolor: brand.white,
          border: `1px solid ${brand.border}`,
          width: 44,
          height: 44,
          boxShadow: brand.shadow,
          '&:hover': { bgcolor: brand.surface },
        }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box
        ref={ref}
        sx={{
          display: 'flex',
          gap,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: pagePaddingX.xs,
          scrollPaddingRight: pagePaddingX.xs,
          pb: 1.5,
          px: pagePaddingX,
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {children}
      </Box>

      <IconButton
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          right: { md: -44, lg: -48 },
          top: '36%',
          zIndex: 2,
          bgcolor: brand.white,
          width: 44,
          height: 44,
          border: `1px solid ${brand.border}`,
          boxShadow: brand.shadow,
          '&:hover': { bgcolor: brand.surface },
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
