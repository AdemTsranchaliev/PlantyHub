import { useEffect, useState, type ReactEventHandler } from 'react'
import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import { cfImage, toMediaUrl, type ImagePreset } from '../media/cfImage'

type Props = {
  src: string
  preset?: ImagePreset
  alt?: string
  sx?: SxProps<Theme>
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  fetchPriority?: 'high' | 'low' | 'auto'
  draggable?: boolean
  onError?: ReactEventHandler<HTMLImageElement>
}

/** Image tag that serves Cloudflare-transformed R2 URLs and falls back to the original file. */
export default function MediaImg({ src, preset = 'card', onError, ...rest }: Props) {
  const [failed, setFailed] = useState(false)
  const resolved = toMediaUrl(src)
  const transformed = cfImage(resolved, preset)

  useEffect(() => {
    setFailed(false)
  }, [src, preset])

  return (
    <Box
      component="img"
      src={failed ? resolved : transformed}
      onError={(event) => {
        if (!failed && transformed !== resolved) {
          setFailed(true)
          return
        }
        onError?.(event)
      }}
      {...rest}
    />
  )
}
