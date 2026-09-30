import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import MediaImg from '../MediaImg'
import { toMediaUrl } from '../../media/cfImage'
import { formatFocusPoint, type FocusPoint, type ImageFrame } from '../../media/imageFocus'
import { brand } from '../../theme'

type Props = {
  src: string
  frames: ImageFrame[]
  focus: Record<string, FocusPoint>
  onChange: (focus: Record<string, FocusPoint>) => void
}

function frameWidth(aspectRatio: string) {
  const [width, height] = aspectRatio.split('/').map((part) => Number(part.trim()))
  if (!width || !height) return 220
  const ratio = width / height
  if (ratio >= 2.2) return 300
  if (ratio >= 1.4) return 240
  if (ratio < 0.95) return 160
  return 210
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}

function shiftPoint(
  start: FocusPoint,
  dx: number,
  dy: number,
  frameWidthPx: number,
  frameHeightPx: number,
  natural: { w: number; h: number } | null,
): FocusPoint {
  if (!natural || frameWidthPx <= 0 || frameHeightPx <= 0) {
    return {
      x: clamp(start.x - (dx / Math.max(frameWidthPx, 1)) * 100),
      y: clamp(start.y - (dy / Math.max(frameHeightPx, 1)) * 100),
    }
  }
  const scale = Math.max(frameWidthPx / natural.w, frameHeightPx / natural.h)
  const overflowX = natural.w * scale - frameWidthPx
  const overflowY = natural.h * scale - frameHeightPx
  return {
    x: overflowX > 1 ? clamp(start.x - (dx / overflowX) * 100) : start.x,
    y: overflowY > 1 ? clamp(start.y - (dy / overflowY) * 100) : start.y,
  }
}

function PositionFrame({
  src,
  frame,
  point,
  onCommit,
}: {
  src: string
  frame: ImageFrame
  point: FocusPoint
  onCommit: (point: FocusPoint) => void
}) {
  const { t } = useTranslation()
  const frameRef = useRef<HTMLDivElement>(null)
  const natural = useRef<{ w: number; h: number } | null>(null)
  const drag = useRef<{ x: number; y: number; point: FocusPoint } | null>(null)
  const liveRef = useRef(point)
  const [live, setLive] = useState(point)
  const label = t(frame.labelKey)

  const updateLive = (next: FocusPoint) => {
    liveRef.current = next
    setLive(next)
  }

  useEffect(() => {
    if (!drag.current) updateLive(point)
    // Sync from the saved point only. `point` is a fresh object on each parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.x, point.y])

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      natural.current = { w: img.naturalWidth, h: img.naturalHeight }
    }
    img.src = toMediaUrl(src)
    return () => {
      img.onload = null
    }
  }, [src])

  const commit = (next: FocusPoint) => {
    const rounded = { x: Math.round(clamp(next.x)), y: Math.round(clamp(next.y)) }
    updateLive(rounded)
    if (rounded.x !== Math.round(point.x) || rounded.y !== Math.round(point.y)) onCommit(rounded)
  }

  return (
    <Stack spacing={0.75} sx={{ width: frameWidth(frame.aspectRatio), maxWidth: '100%' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: brand.graphite }}>{label}</Typography>
      <Box
        ref={frameRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(live.x)}
        aria-valuetext={formatFocusPoint(live)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x: event.clientX, y: event.clientY, point: liveRef.current }
        }}
        onPointerMove={(event) => {
          if (!drag.current || !frameRef.current) return
          const rect = frameRef.current.getBoundingClientRect()
          updateLive(
            shiftPoint(
              drag.current.point,
              event.clientX - drag.current.x,
              event.clientY - drag.current.y,
              rect.width,
              rect.height,
              natural.current,
            ),
          )
        }}
        onPointerUp={() => {
          if (!drag.current) return
          drag.current = null
          commit(liveRef.current)
        }}
        onPointerCancel={() => {
          drag.current = null
          updateLive(point)
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 2
          if (event.key === 'ArrowLeft') commit({ ...live, x: live.x - step })
          else if (event.key === 'ArrowRight') commit({ ...live, x: live.x + step })
          else if (event.key === 'ArrowUp') commit({ ...live, y: live.y - step })
          else if (event.key === 'ArrowDown') commit({ ...live, y: live.y + step })
          else return
          event.preventDefault()
        }}
        sx={{
          width: '100%',
          aspectRatio: frame.aspectRatio,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          border: `1px solid ${brand.border}`,
          bgcolor: brand.surface,
          '&:active': { cursor: 'grabbing' },
          '&:focus-visible': { outline: `2px solid ${brand.plantGreen}`, outlineOffset: 2 },
        }}
      >
        <MediaImg
          src={src}
          preset="card"
          alt=""
          draggable={false}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: formatFocusPoint(live),
            display: 'block',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: `${live.x}%`,
            top: `${live.y}%`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: `2px solid ${brand.white}`,
            boxShadow: '0 0 0 1px rgba(28,35,30,0.45)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      </Box>
      <Button
        size="small"
        onClick={() => onCommit(frame.fallback)}
        sx={{ alignSelf: 'flex-start', minHeight: 28, px: 1, fontSize: '0.72rem', fontWeight: 700, color: brand.textSecondary }}
      >
        {t('admin.imagePicker.resetPosition')}
      </Button>
    </Stack>
  )
}

export default function ImagePositioner({ src, frames, focus, onChange }: Props) {
  const { t } = useTranslation()
  if (!src || frames.length === 0) return null

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: brand.graphite, mb: 0.35 }}>
        {t('admin.imagePicker.position')}
      </Typography>
      <Typography sx={{ color: brand.textSecondary, fontSize: '0.75rem', lineHeight: 1.45, mb: 1.25 }}>
        {t('admin.imagePicker.positionHint')}
      </Typography>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {frames.map((frame) => (
          <PositionFrame
            key={frame.id}
            src={src}
            frame={frame}
            point={focus[frame.id] ?? frame.fallback}
            onCommit={(point) => onChange({ ...focus, [frame.id]: point })}
          />
        ))}
      </Stack>
    </Box>
  )
}
