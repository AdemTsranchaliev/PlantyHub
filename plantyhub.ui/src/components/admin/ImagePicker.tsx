import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded'
import { useTranslation } from 'react-i18next'
import { mediaApi } from '../../api'
import { ApiError } from '../../api/client'
import { brand } from '../../theme'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  size?: 'small' | 'medium'
  previewFit?: 'cover' | 'contain'
}

export default function ImagePicker({ label, value, onChange, size = 'small', previewFit = 'cover' }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const result = await mediaApi.upload(file)
      onChange(result.url)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : t('admin.imagePicker.uploadFailed', { defaultValue: 'Upload failed.' })
      setError(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Box>
      <TextField
        label={label}
        value={value}
        onChange={(e) => {
          setError('')
          onChange(e.target.value)
        }}
        fullWidth
        size={size}
        placeholder="https://..."
        helperText={error || undefined}
        error={Boolean(error)}
      />
      <Stack direction="row" spacing={1.5} sx={{ mt: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <CloudUploadRounded />}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          sx={{ fontWeight: 700, borderColor: brand.border, color: brand.graphite }}
        >
          {uploading
            ? t('admin.imagePicker.uploading', { defaultValue: 'Uploading…' })
            : t('admin.imagePicker.upload', { defaultValue: 'Upload to R2' })}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => void handleUpload(e.target.files?.[0])}
        />
        {value ? (
          <Box
            component="img"
            src={value}
            alt=""
            sx={{
              width: 72,
              height: 72,
              objectFit: previewFit,
              borderRadius: '12px',
              border: `1px solid ${brand.border}`,
              bgcolor: brand.surface,
            }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.visibility = 'hidden'
            }}
          />
        ) : (
          <Typography sx={{ fontSize: '0.8rem', color: brand.textSecondary }}>
            {t('admin.imagePicker.noImage', { defaultValue: 'No image yet' })}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
