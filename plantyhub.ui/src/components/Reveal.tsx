import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import type { BoxProps } from '@mui/material/Box'

type RevealProps = BoxProps & {
  /** Stagger delay in seconds */
  delay?: number
}

/**
 * Fades & lifts children into view when scrolled into the viewport.
 * Honors prefers-reduced-motion and reveals immediately if the observer is unavailable.
 */
export default function Reveal({ delay = 0, sx, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      sx={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(22px)',
        transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}s`,
        '@media (prefers-reduced-motion: reduce)': {
          opacity: 1,
          transform: 'none',
          transition: 'none',
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}
