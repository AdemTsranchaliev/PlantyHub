import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded'
import { useTranslation } from 'react-i18next'
import { mediaApi } from '../../api'
import { ApiError } from '../../api/client'
import { brand } from '../../theme'
import MediaImg from '../MediaImg'

type Props = {
  images: string[]
  onChange: (images: string[]) => void
}

function reorder(items: string[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const copy = [...items]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

export default function ProductGalleryEditor({ images, onChange }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const uploadFiles = async (files: FileList | File[] | null) => {
    if (!files?.length) return
    setUploading(true)
    setError('')
    const added: string[] = []
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        const result = await mediaApi.upload(file)
        added.push(result.url)
      }
      if (added.length) onChange([...images, ...added])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.imagePicker.uploadFailed'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
          gap: 1.25,
        }}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('Files')) event.preventDefault()
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.files?.length) return
          event.preventDefault()
          void uploadFiles(event.dataTransfer.files)
        }}
      >
        {images.map((src, index) => (
          <Box
            key={`${src}-${index}`}
            draggable
            role="button"
            aria-label={t('admin.productEdit.dragImage', { n: index + 1 })}
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => {
              event.preventDefault()
              setOverIndex(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (dragIndex !== null) onChange(reorder(images, dragIndex, index))
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            sx={{
              position: 'relative',
              aspectRatio: '1 / 1',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'grab',
              border: overIndex === index ? `2px solid ${brand.plantGreen}` : `1px solid ${brand.border}`,
              opacity: dragIndex === index ? 0.45 : 1,
              bgcolor: brand.surface,
            }}
          >
            <MediaImg src={src} preset="thumb" alt="" draggable={false} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.6,
                py: 0.2,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.92)',
                color: brand.graphite,
                fontSize: '0.68rem',
                fontWeight: 800,
              }}
            >
              <DragIndicatorRounded sx={{ fontSize: 14 }} />
              {index === 0 ? t('admin.productEdit.coverImage') : index + 1}
            </Box>
            <IconButton
              size="small"
              aria-label={t('admin.productEdit.removeImage')}
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(255,255,255,0.92)',
                width: 26,
                height: 26,
                '&:hover': { bgcolor: brand.white },
              }}
            >
              <CloseRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
        <Box
          component="button"
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          sx={{
            aspectRatio: '1 / 1',
            borderRadius: '16px',
            border: `1.5px dashed ${brand.plantGreenLight}`,
            bgcolor: brand.plantGreenMuted,
            color: brand.plantGreenDark,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            cursor: uploading ? 'wait' : 'pointer',
            fontWeight: 800,
            fontSize: '0.82rem',
          }}
        >
          <AddRounded />
          {uploading ? t('admin.imagePicker.uploading') : t('admin.productEdit.addImages')}
        </Box>
      </Box>
      <Typography sx={{ mt: 1, fontSize: '0.78rem', color: brand.textSecondary }}>{t('admin.productEdit.dragHint')}</Typography>
      {error && <Typography sx={{ color: 'error.main', fontSize: '0.8rem', mt: 0.5 }}>{error}</Typography>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => void uploadFiles(e.target.files)}
      />
    </Box>
  )
}
