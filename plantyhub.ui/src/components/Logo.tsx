import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { logoSrc } from '../data/images'
import { cfImageWidth, toMediaUrl } from '../media/cfImage'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
}

const heights = {
  sm: { xs: 28, md: 32 },
  md: { xs: 28, sm: 34, md: 38 },
  lg: { xs: 40, md: 48 },
}

/** CSS width of the wordmark at each height. File is 862×218. */
const sizes = {
  sm: '(min-width: 900px) 127px, 111px',
  md: '(min-width: 900px) 150px, (min-width: 600px) 134px, 111px',
  lg: '(min-width: 900px) 190px, 158px',
}

const SRC_WIDTHS = [160, 240, 320, 480] as const
const LOGO_RATIO = '862 / 218'

export default function Logo({ size = 'md' }: LogoProps) {
  const [failed, setFailed] = useState(false)
  const resolved = toMediaUrl(logoSrc)
  const srcSet = SRC_WIDTHS.map((width) => `${cfImageWidth(resolved, width, 75)} ${width}w`).join(', ')

  useEffect(() => {
    setFailed(false)
  }, [resolved])

  return (
    <Box
      component="img"
      src={failed ? resolved : cfImageWidth(resolved, 240, 75)}
      srcSet={failed ? undefined : srcSet}
      sizes={sizes[size]}
      alt="PlantyHub"
      decoding="async"
      onError={() => {
        if (!failed) setFailed(true)
      }}
      sx={{
        height: heights[size],
        width: 'auto',
        maxWidth: '100%',
        display: 'block',
        objectFit: 'contain',
        aspectRatio: LOGO_RATIO,
      }}
    />
  )
}
