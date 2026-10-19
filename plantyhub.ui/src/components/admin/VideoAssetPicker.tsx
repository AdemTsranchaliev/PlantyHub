import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { mediaApi } from '../../api'
import { ApiError } from '../../api/client'
import { toMediaUrl } from '../../media/cfImage'
import { brand } from '../../theme'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
}

export default function VideoAssetPicker({ label, value, onChange }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const src = value ? toMediaUrl(value) : ''

  const handleUpload = (file: File | undefined) => {
    if (!file) return
    setError('')
    setUploading(true)
    void mediaApi.upload(file)
      .then((result) => onChange(result.url))
      .catch((err) => setError(err instanceof ApiError ? err.message : t('admin.imagePicker.uploadFailed')))
      .finally(() => {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      })
  }

  return (
    <Stack spacing={1.25}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: brand.graphite }}>{label}</Typography>
      {src ? (
        <Box
          key={src}
          component="video"
          src={src}
          controls
          playsInline
          preload="metadata"
          sx={{ width: '100%', maxWidth: 220, aspectRatio: '9 / 16', objectFit: 'cover', borderRadius: '16px', bgcolor: brand.graphite, display: 'block' }}
        />
      ) : null}
      <Button variant="outlined" disabled={uploading} onClick={() => inputRef.current?.click()} sx={{ alignSelf: 'flex-start' }}>
        {uploading ? t('admin.imagePicker.uploading') : t('admin.productEdit.replaceVideo')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        hidden
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />
      {error ? (
        <Typography sx={{ color: 'error.main', fontSize: '0.8rem' }}>{error}</Typography>
      ) : null}
    </Stack>
  )
}
