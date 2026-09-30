import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CloseRounded from '@mui/icons-material/CloseRounded'
import { useTranslation } from 'react-i18next'
import { reviewsApi, type ReviewInvite } from '../api'
import { ApiError } from '../api/client'
import MediaImg from '../components/MediaImg'
import SectionContainer from '../components/SectionContainer'
import { brand } from '../theme'

const maxPhotos = 5

export default function ReviewPage() {
  const { token = '' } = useParams<{ token: string }>()
  const { t } = useTranslation()
  const [invite, setInvite] = useState<ReviewInvite | null>(null)
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState<number | null>(null)
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    void reviewsApi
      .invite(token)
      .then((next) => {
        if (cancel) return
        setInvite(next)
        setName(next.customerName)
        setDone(next.completed)
      })
      .catch(() => {
        if (!cancel) setMissing(true)
      })
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [token])

  useEffect(() => {
    document.title = `${t('reviews.form.pageTitle')} · PlantyHub`
  }, [t])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) {
        setError(t('reviews.form.photoType'))
        continue
      }
      if (next.length >= maxPhotos) {
        setError(t('reviews.form.photoLimit'))
        break
      }
      next.push(file)
    }
    setFiles(next)
  }

  const submit = async () => {
    if (!rating) {
      setError(t('reviews.form.ratingRequired'))
      return
    }
    setError('')
    setSending(true)
    const form = new FormData()
    form.append('rating', String(rating))
    form.append('body', body)
    form.append('authorName', name)
    files.forEach((file) => form.append('photos', file))
    try {
      await reviewsApi.submit(token, form)
      setDone(true)
    } catch (err) {
      const code = err instanceof ApiError ? err.message : ''
      const known = ['already', 'rating', 'tooLong', 'photoLimit', 'photoType', 'photoSize', 'storage', 'missing']
      setError(known.includes(code) ? t(`reviews.form.errors.${code}`) : t('reviews.form.failed'))
    } finally {
      setSending(false)
    }
  }

  return (
    <SectionContainer bgcolor={brand.cream} py={{ xs: 4, sm: 6, md: 8 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: brand.plantGreen }} />
          </Box>
        ) : missing || !invite ? (
          <Card>
            <Typography variant="h3" sx={{ color: brand.graphite, mb: 1 }}>{t('reviews.form.missingTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, mb: 3 }}>{t('reviews.form.missingBody')}</Typography>
            <Button variant="contained" component={RouterLink} to="/">{t('reviews.form.home')}</Button>
          </Card>
        ) : done ? (
          <Card>
            {invite.productImage ? (
              <MediaImg src={invite.productImage} preset="card" alt={invite.productName} sx={{ width: 96, height: 96, objectFit: 'contain', borderRadius: '16px', mb: 2, bgcolor: brand.surface }} />
            ) : null}
            <Typography variant="h3" sx={{ color: brand.graphite, mb: 1 }}>{t('reviews.form.thanksTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, mb: 3 }}>
              {invite.completed ? t('reviews.form.already') : t('reviews.form.thanksBody', { product: invite.productName })}
            </Typography>
            <Button variant="contained" component={RouterLink} to="/">{t('reviews.form.home')}</Button>
          </Card>
        ) : (
          <Card>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2.5 }}>
              {invite.productImage ? (
                <MediaImg src={invite.productImage} preset="thumb" alt="" sx={{ width: 72, height: 72, objectFit: 'contain', borderRadius: '16px', bgcolor: brand.surface, flexShrink: 0 }} />
              ) : null}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: brand.plantGreenDark }}>
                  {t('reviews.form.eyebrow')}
                </Typography>
                <Typography variant="h3" sx={{ color: brand.graphite, fontSize: { xs: '1.6rem', sm: '1.9rem' } }}>
                  {invite.productName}
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ color: brand.textSecondary, mb: 2.5 }}>{t('reviews.form.subtitle', { product: invite.productName })}</Typography>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{t('reviews.form.rating')}</Typography>
            <Rating
              value={rating}
              onChange={(_, value) => setRating(value)}
              size="large"
              sx={{ color: '#CE8A4A', mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={t('reviews.form.body')}
              placeholder={t('reviews.form.bodyPlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('reviews.form.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography sx={{ fontWeight: 800, mb: 0.25 }}>{t('reviews.form.photos')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', mb: 1.25 }}>{t('reviews.form.photosHint')}</Typography>
            <Button variant="outlined" component="label" sx={{ mb: 1.5 }}>
              {t('reviews.form.addPhotos')}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </Button>
            {files.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                {files.map((file, index) => (
                  <PhotoPreview key={`${file.name}-${index}`} file={file} onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))} />
                ))}
              </Stack>
            ) : null}
            {error ? (
              <Typography sx={{ color: '#C62828', fontWeight: 700, mb: 1.5 }}>{error}</Typography>
            ) : null}
            <Button variant="contained" size="large" fullWidth disabled={sending} onClick={() => { void submit() }}>
              {sending ? t('reviews.form.sending') : t('reviews.form.submit')}
            </Button>
          </Card>
        )}
      </Box>
    </SectionContainer>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '24px', bgcolor: brand.white, border: `1px solid ${brand.creamBorder}` }}>
      {children}
    </Box>
  )
}

function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(file)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [file])
  return (
    <Box sx={{ position: 'relative', width: 84, height: 84 }}>
      <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
      <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(28,35,30,0.72)', color: '#fff', '&:hover': { bgcolor: 'rgba(28,35,30,0.9)' } }}>
        <CloseRounded sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  )
}
