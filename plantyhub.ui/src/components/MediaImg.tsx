import { useEffect, useState, type ReactEventHandler } from 'react'
import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import { cfImageSet, toMediaUrl, type ImagePreset } from '../media/cfImage'

type Props = {
  src: string
  preset?: ImagePreset
  alt?: string
  sx?: SxProps<Theme>
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
  draggable?: boolean
  onError?: ReactEventHandler<HTMLImageElement>
}

/** Image tag that serves Cloudflare-transformed R2 URLs and falls back to the original file. */
export default function MediaImg({ src, preset = 'card', sizes, onError, ...rest }: Props) {
  const [failed, setFailed] = useState(false)
  const resolved = toMediaUrl(src)
  const picture = cfImageSet(resolved, preset)

  useEffect(() => {
    setFailed(false)
  }, [src, preset])

  return (
    <Box
      component="img"
      src={failed ? resolved : picture.src}
      srcSet={failed ? undefined : picture.srcSet}
      sizes={failed ? undefined : (sizes ?? picture.sizes)}
      onError={(event) => {
        if (!failed && picture.src !== resolved) {
          setFailed(true)
          return
        }
        onError?.(event)
      }}
      {...rest}
    />
  )
}
