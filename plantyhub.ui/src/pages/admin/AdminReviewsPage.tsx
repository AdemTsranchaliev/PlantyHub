import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import RateReviewRounded from '@mui/icons-material/RateReviewRounded'
import HourglassTopRounded from '@mui/icons-material/HourglassTopRounded'
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded'
import { useTranslation } from 'react-i18next'
import AdminFieldGroup from '../../components/admin/AdminFieldGroup'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import MediaImg from '../../components/MediaImg'
import { productsApi, reviewsApi, type AdminReview, type AdminReviewRequest, type ReviewStatus } from '../../api'
import { ApiError } from '../../api/client'
import { supportedLanguages } from '../../i18n/languages'
import type { ApiProductDto } from '../../api/types'
import { brand } from '../../theme'

const statuses: Array<ReviewStatus | 'all'> = ['all', 'pending', 'published', 'hidden']

function productLabel(product: ApiProductDto) {
  return product.locales.bg?.name || product.locales.en?.name || Object.values(product.locales)[0]?.name || product.id
}

function reviewError(code: string, t: (key: string) => string) {
  const known = ['product', 'invalidEmail', 'already', 'emailFailed', 'missing']
  return known.includes(code) ? t(`admin.reviews.errors.${code}`) : t('admin.reviews.errors.failed')
}

export default function AdminReviewsPage() {
  const { t, i18n } = useTranslation()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [requests, setRequests] = useState<AdminReviewRequest[]>([])
  const [products, setProducts] = useState<ApiProductDto[]>([])
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('all')
  const [productSlug, setProductSlug] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [orderId, setOrderId] = useState('')
  const [language, setLanguage] = useState('bg')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)

  const load = () => {
    void reviewsApi.adminList().then((data) => {
      setReviews(data.reviews)
      setRequests(data.requests)
    }).catch(() => {
      setReviews([])
      setRequests([])
    })
  }

  useEffect(() => {
    load()
    void productsApi.getAdmin().then((data) => {
      const rows = [...data.gardens, ...data.pods, ...data.consumables, ...data.accessories]
      setProducts(rows)
      setProductSlug((current) => current || rows[0]?.id || '')
    }).catch(() => setProducts([]))
  }, [])

  const visible = useMemo(
    () => (filter === 'all' ? reviews : reviews.filter((review) => review.status === filter)),
    [reviews, filter],
  )
  const hidden = reviews.filter((review) => review.status === 'hidden').length

  const send = async () => {
    setError('')
    setNotice('')
    setSending(true)
    try {
      await reviewsApi.send({
        productSlug,
        email,
        customerName: name,
        orderId: orderId.trim() || undefined,
        language,
      })
      setEmail('')
      setName('')
      setOrderId('')
      setNotice(t('admin.reviews.sent'))
      load()
    } catch (err) {
      const code = err instanceof ApiError ? err.message : ''
      setError(reviewError(code, t))
      if (code === 'emailFailed') load()
    } finally {
      setSending(false)
    }
  }

  const setStatus = async (review: AdminReview, status: ReviewStatus) => {
    await reviewsApi.setStatus(review.id, status)
    load()
  }

  const remove = async (review: AdminReview) => {
    if (!window.confirm(t('admin.reviews.deleteConfirm'))) return
    await reviewsApi.remove(review.id)
    load()
  }

  const resend = async (request: AdminReviewRequest) => {
    setError('')
    try {
      await reviewsApi.resend(request.id)
      setNotice(t('admin.reviews.sent'))
      load()
    } catch (err) {
      setError(reviewError(err instanceof ApiError ? err.message : '', t))
    }
  }

  const when = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <AdminPageHeader title={t('admin.reviews.title')} subtitle={t('admin.reviews.subtitle')} />
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard label={t('admin.reviews.statsReviews')} value={reviews.length} icon={<RateReviewRounded />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard label={t('admin.reviews.statsHidden')} value={hidden} icon={<HourglassTopRounded />} attention={hidden > 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard label={t('admin.reviews.statsSent')} value={requests.length} icon={<MarkEmailReadRounded />} />
        </Grid>
      </Grid>

      <AdminFieldGroup title={t('admin.reviews.sendTitle')} hint={t('admin.reviews.sendHint')}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label={t('admin.reviews.product')} value={productSlug} onChange={(e) => setProductSlug(e.target.value)}>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>{productLabel(product)}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label={t('admin.reviews.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label={t('admin.reviews.name')} value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label={t('admin.reviews.order')} value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label={t('admin.reviews.language')} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {supportedLanguages.map((item) => (
                <MenuItem key={item.code} value={item.code}>{item.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" disabled={sending || !productSlug} onClick={() => { void send() }}>
              {sending ? t('admin.reviews.sending') : t('admin.reviews.send')}
            </Button>
          </Grid>
        </Grid>
        {notice ? <Typography sx={{ color: brand.plantGreenDark, fontWeight: 700, mt: 1.5 }}>{notice}</Typography> : null}
        {error ? <Typography sx={{ color: '#C62828', fontWeight: 700, mt: 1.5 }}>{error}</Typography> : null}
      </AdminFieldGroup>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5, mt: 3, flexWrap: 'wrap' }}>
        {statuses.map((status) => (
          <Chip
            key={status}
            label={t(`admin.reviews.filter.${status}`)}
            onClick={() => setFilter(status)}
            sx={{
              fontWeight: 700,
              bgcolor: filter === status ? brand.plantGreen : brand.white,
              color: filter === status ? brand.white : brand.graphite,
              border: `1px solid ${filter === status ? brand.plantGreen : brand.border}`,
            }}
          />
        ))}
      </Stack>

      <Stack spacing={1.25} sx={{ mb: 3 }}>
        {visible.length === 0 ? (
          <Typography sx={{ color: brand.textSecondary }}>{t('admin.reviews.empty')}</Typography>
        ) : visible.map((review) => (
          <Box key={review.id} sx={{ p: 2, borderRadius: '18px', bgcolor: brand.white, border: `1px solid ${brand.border}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 800 }}>{review.authorName}</Typography>
                  <Chip size="small" label={t(`admin.reviews.status.${review.status}`)} sx={{ fontWeight: 700 }} />
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>{review.productName}</Typography>
                </Stack>
                <Rating value={review.rating} readOnly size="small" sx={{ color: '#CE8A4A' }} />
                {review.body ? <Typography sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}>{review.body}</Typography> : null}
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', mt: 0.75 }}>
                  {review.email} · {when(review.createdAt)}{review.orderId ? ` · ${review.orderId}` : ''}
                </Typography>
                {review.photos.length > 0 ? (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {review.photos.map((src) => (
                      <Box key={src} component="button" type="button" onClick={() => setPhoto(src)} sx={{ p: 0, width: 64, height: 64, borderRadius: '10px', overflow: 'hidden', border: `1px solid ${brand.border}`, cursor: 'pointer' }}>
                        <MediaImg src={src} preset="thumb" alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignSelf: { sm: 'flex-start' }, flexWrap: 'wrap' }}>
                {review.status !== 'published' ? (
                  <Button size="small" variant="contained" onClick={() => { void setStatus(review, 'published') }}>{t('admin.reviews.publish')}</Button>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => { void setStatus(review, 'hidden') }}>{t('admin.reviews.hide')}</Button>
                )}
                <Button size="small" color="inherit" onClick={() => { void remove(review) }}>{t('admin.reviews.delete')}</Button>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>

      <AdminFieldGroup title={t('admin.reviews.requestsTitle')}>
        {requests.length === 0 ? (
          <Typography sx={{ color: brand.textSecondary }}>{t('admin.reviews.requestsEmpty')}</Typography>
        ) : (
          <Stack spacing={1}>
            {requests.map((request) => (
              <Stack key={request.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{request.customerName} · {request.productName}</Typography>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem' }}>
                    {request.email} · {request.language.toUpperCase()} · {when(request.sentAt)}
                    {request.orderId ? ` · ${request.orderId}` : ''}
                  </Typography>
                </Box>
                {request.completed ? (
                  <Chip size="small" label={t('admin.reviews.received')} sx={{ fontWeight: 700, alignSelf: 'flex-start' }} />
                ) : (
                  <Button size="small" variant="outlined" onClick={() => { void resend(request) }}>{t('admin.reviews.resend')}</Button>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </AdminFieldGroup>

      <Dialog open={Boolean(photo)} onClose={() => setPhoto(null)} maxWidth="md">
        {photo ? <MediaImg src={photo} preset="gallery" alt="" sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} /> : null}
      </Dialog>
    </>
  )
}
