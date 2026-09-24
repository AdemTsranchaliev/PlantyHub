import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import { useTranslation } from 'react-i18next'
import { mediaApi } from '../../api'
import { ApiError } from '../../api/client'
import { brand } from '../../theme'
import MediaImg from '../MediaImg'

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
  const [broken, setBroken] = useState(false)
  const previewSize = size === 'medium' ? 120 : 88
  const showPreview = Boolean(value) && !broken

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setBroken(false)
    setUploading(true)
    try {
      const result = await mediaApi.upload(file)
      onChange(result.url)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : t('admin.imagePicker.uploadFailed')
      setError(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: brand.graphite, mb: 1 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'stretch' }}>
        <Box
          component="button"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          sx={{
            flexShrink: 0,
            width: previewSize,
            height: previewSize,
            p: 0,
            borderRadius: '14px',
            border: `1.5px dashed ${showPreview ? brand.border : brand.plantGreenLight}`,
            bgcolor: brand.surface,
            overflow: 'hidden',
            cursor: uploading ? 'wait' : 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: brand.textSecondary,
            '&:hover .picker-overlay': { opacity: 1 },
          }}
        >
          {showPreview ? (
            <MediaImg
              src={value}
              preset="thumb"
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: previewFit, display: 'block', bgcolor: brand.white }}
              onError={() => setBroken(true)}
            />
          ) : (
            <Stack spacing={0.5} sx={{ alignItems: 'center', px: 1 }}>
              {uploading ? <CircularProgress size={20} /> : <ImageOutlined sx={{ fontSize: 28, color: brand.plantGreen }} />}
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                {uploading ? t('admin.imagePicker.uploading') : t('admin.imagePicker.add')}
              </Typography>
            </Stack>
          )}
          {showPreview && (
            <Box
              className="picker-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(28, 35, 30, 0.55)',
                color: brand.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.15s ease',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              {t('admin.imagePicker.replace')}
            </Box>
          )}
        </Box>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <CloudUploadRounded />}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            sx={{ fontWeight: 700, borderColor: brand.border, color: brand.graphite, alignSelf: 'flex-start', minHeight: 36, px: 1.75 }}
          >
            {uploading ? t('admin.imagePicker.uploading') : t('admin.imagePicker.upload')}
          </Button>
          <TextField
            label={t('admin.imagePicker.url')}
            value={value}
            onChange={(e) => {
              setError('')
              setBroken(false)
              onChange(e.target.value)
            }}
            size="small"
            placeholder="https://..."
            helperText={error || t('admin.imagePicker.urlHint')}
            error={Boolean(error)}
          />
        </Stack>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => void handleUpload(e.target.files?.[0])}
        />
      </Stack>
    </Box>
  )
}
