import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import { useTranslation } from 'react-i18next'
import { reviewsApi, type PublicReviews, type ReviewSort } from '../api'
import { brand } from '../theme'
import MediaImg from './MediaImg'
import SectionContainer from './SectionContainer'

const sorts: ReviewSort[] = ['newest', 'highest', 'lowest', 'photos']
const starGold = '#CE8A4A'

export function useProductReviews(slug?: string) {
  const [data, setData] = useState<PublicReviews | null>(null)

  useEffect(() => {
    if (!slug) {
      setData(null)
      return
    }
    let cancel = false
    void reviewsApi
      .forProduct(slug, { summary: true })
      .then((next) => {
        if (!cancel) setData(next)
      })
      .catch(() => {
        if (!cancel) setData(null)
      })
    return () => {
      cancel = true
    }
  }, [slug])

  return data
}

export function ProductRatingRow({ reviews }: { reviews: PublicReviews }) {
  const { t } = useTranslation()
  return (
    <Stack
      component="a"
      href="#reviews"
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', mb: 2, width: 'fit-content', color: 'inherit', textDecoration: 'none' }}
    >
      <Rating value={reviews.average} precision={0.1} readOnly size="small" sx={{ color: starGold }} />
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.textSecondary }}>
        {t('reviews.summary', { rating: reviews.average.toFixed(1), count: reviews.count })}
      </Typography>
    </Stack>
  )
}

export default function ProductReviews({ slug }: { slug?: string }) {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<PublicReviews | null>(null)
  const [sort, setSort] = useState<ReviewSort>('newest')
  const [page, setPage] = useState(1)
  const [star, setStar] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewer, setViewer] = useState<{ photos: string[]; index: number } | null>(null)

  useEffect(() => {
    if (!slug) {
      setData(null)
      return
    }
    let cancel = false
    setLoading(true)
    void reviewsApi
      .forProduct(slug, { sort, page, rating: star ?? undefined })
      .then((next) => {
        if (!cancel) setData(next)
      })
      .catch(() => {
        if (!cancel) setData(null)
      })
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [slug, sort, page, star])

  if (!data || data.count === 0) return null

  const pages = Math.max(1, Math.ceil(data.filtered / data.pageSize))
  const from = data.filtered === 0 ? 0 : (data.page - 1) * data.pageSize + 1
  const to = Math.min(data.page * data.pageSize, data.filtered)

  const chooseSort = (next: ReviewSort) => {
    setSort(next)
    setPage(1)
  }

  const chooseStar = (value: number) => {
    setStar((current) => (current === value ? null : value))
    setPage(1)
  }

  return (
    <SectionContainer id="reviews" bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 8 }}>
      <Box sx={{ maxWidth: 980, mx: 'auto' }}>
      <Stack spacing={1.25} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.6,
            borderRadius: 999,
            bgcolor: brand.plantGreenMuted,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: brand.plantGreenDark }} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: brand.plantGreenDark }}>
            {t('reviews.eyebrow')}
          </Typography>
        </Box>
        <Typography component="h2" variant="h2" sx={{ textAlign: 'center', color: brand.graphite }}>
          {t('reviews.title')}
        </Typography>
      </Stack>
      <Stack spacing={3} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(160px, 200px) 1fr' },
            gap: { xs: 2.5, sm: 4 },
            alignItems: 'center',
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: '24px',
            bgcolor: brand.white,
            border: `1px solid ${brand.creamBorder}`,
            boxShadow: brand.shadow,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '3rem', sm: '3.4rem' }, lineHeight: 0.9, color: brand.graphite }}>
              {data.average.toFixed(1)}
            </Typography>
            <Rating value={data.average} precision={0.1} readOnly sx={{ color: starGold, mt: 1 }} />
            <Typography sx={{ mt: 0.5, fontSize: '0.9rem', fontWeight: 700, color: brand.textSecondary }}>
              {t('reviews.count', { count: data.count })}
            </Typography>
          </Box>
          <Stack spacing={0.35}>
            {[5, 4, 3, 2, 1].map((value) => {
              const n = data.ratings[value - 1] ?? 0
              const width = data.count === 0 ? 0 : (n / data.count) * 100
              const active = star === value
              return (
                <Box
                  key={value}
                  component="button"
                  type="button"
                  onClick={() => chooseStar(value)}
                  aria-pressed={active}
                  aria-label={t('reviews.stars', { count: value })}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 32px',
                    gap: 1.25,
                    alignItems: 'center',
                    px: 1,
                    py: 0.55,
                    border: 0,
                    borderRadius: '10px',
                    bgcolor: active ? brand.plantGreenMuted : 'transparent',
                    cursor: 'pointer',
                    color: active ? brand.plantGreenDark : brand.graphite,
                    '&:hover': { bgcolor: active ? brand.plantGreenMuted : brand.surface },
                  }}
                >
                  <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
                    <StarRounded sx={{ fontSize: 15, color: active ? brand.plantGreenDark : starGold }} />
                  </Stack>
                  <Box sx={{ height: 8, borderRadius: 99, bgcolor: brand.beigeDark, overflow: 'hidden' }}>
                    <Box sx={{ width: `${width}%`, height: '100%', borderRadius: 99, bgcolor: active ? brand.plantGreenDark : starGold }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: brand.textSecondary, textAlign: 'right' }}>{n}</Typography>
                </Box>
              )
            })}
          </Stack>
        </Box>

        {data.photos.length > 0 ? (
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 1.25, color: brand.graphite }}>{t('reviews.photosTitle', { count: data.withPhotos })}</Typography>
            <Stack direction="row" spacing={1.25} sx={{ overflowX: 'auto', pb: 0.75, pr: { xs: 8, sm: 2 } }}>
              {data.photos.map((src, index) => (
                <Box
                  key={`${index}-${src}`}
                  component="button"
                  type="button"
                  onClick={() => setViewer({ photos: data.photos, index })}
                  sx={{
                    p: 0,
                    border: `1px solid ${brand.creamBorder}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    width: { xs: 96, sm: 112 },
                    height: { xs: 96, sm: 112 },
                    flex: '0 0 auto',
                    cursor: 'pointer',
                    bgcolor: brand.white,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '@media (hover: hover)': {
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: brand.shadowHover },
                    },
                  }}
                >
                  <MediaImg src={src} preset="thumb" alt={t('reviews.photo')} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {sorts.map((key) => {
            const active = sort === key
            return (
              <Box
                key={key}
                component="button"
                type="button"
                onClick={() => chooseSort(key)}
                sx={{
                  borderRadius: 999,
                  px: 1.75,
                  py: 0.85,
                  border: `1px solid ${active ? brand.plantGreen : brand.creamBorder}`,
                  bgcolor: active ? brand.plantGreen : brand.white,
                  color: active ? brand.white : brand.graphite,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
              >
                {t(`reviews.sort.${key}`)}
              </Box>
            )
          })}
          {star ? (
            <Box
              component="button"
              type="button"
              onClick={() => chooseStar(star)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                borderRadius: 999,
                px: 1.5,
                py: 0.85,
                border: `1px solid ${brand.plantGreenDark}`,
                bgcolor: brand.plantGreenMuted,
                color: brand.plantGreenDark,
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {t('reviews.stars', { count: star })}
              <CloseRounded sx={{ fontSize: 16 }} />
            </Box>
          ) : null}
        </Stack>

        {data.items.length === 0 ? (
          <Box sx={{ px: 2.5, py: 3, borderRadius: '20px', bgcolor: brand.white, border: `1px solid ${brand.creamBorder}`, textAlign: 'center' }}>
            <Typography sx={{ color: brand.textSecondary, fontWeight: 700 }}>{t('reviews.filterEmpty')}</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {data.items.map((review) => (
              <ReviewCard
                key={review.id}
                author={review.authorName}
                rating={review.rating}
                body={review.body}
                photos={review.photos}
                date={new Date(review.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                onPhoto={(index) => setViewer({ photos: review.photos, index })}
              />
            ))}
          </Stack>
        )}

        {pages > 1 ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
            <Typography sx={{ color: brand.textSecondary, fontWeight: 700, fontSize: '0.85rem' }}>
              {t('reviews.range', { from, to, count: data.filtered })}
            </Typography>
            <Pagination
              count={pages}
              page={data.page}
              onChange={(_, next) => {
                setPage(next)
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 700 },
                '& .Mui-selected': { bgcolor: `${brand.plantGreen} !important`, color: brand.white },
              }}
            />
          </Stack>
        ) : null}
      </Stack>
      </Box>

      <Dialog
        open={Boolean(viewer)}
        onClose={() => setViewer(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', overflow: 'hidden', bgcolor: brand.graphite, position: 'relative' } } }}
      >
        {viewer ? (
          <Box sx={{ position: 'relative', bgcolor: brand.graphite }}>
            <IconButton
              aria-label={t('reviews.closePhoto')}
              onClick={() => setViewer(null)}
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,0.92)', '&:hover': { bgcolor: brand.white } }}
            >
              <CloseRounded />
            </IconButton>
            <MediaImg
              src={viewer.photos[viewer.index]}
              preset="gallery"
              alt={t('reviews.photo')}
              sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
            {viewer.photos.length > 1 ? (
              <>
                <IconButton
                  aria-label={t('reviews.prevPhoto')}
                  onClick={() => setViewer({ photos: viewer.photos, index: (viewer.index - 1 + viewer.photos.length) % viewer.photos.length })}
                  sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.92)', '&:hover': { bgcolor: brand.white } }}
                >
                  <ChevronLeftRounded />
                </IconButton>
                <IconButton
                  aria-label={t('reviews.nextPhoto')}
                  onClick={() => setViewer({ photos: viewer.photos, index: (viewer.index + 1) % viewer.photos.length })}
                  sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.92)', '&:hover': { bgcolor: brand.white } }}
                >
                  <ChevronRightRounded />
                </IconButton>
                <Typography sx={{ py: 1.25, textAlign: 'center', color: brand.white, fontWeight: 700, fontSize: '0.85rem' }}>
                  {t('reviews.photoIndex', { current: viewer.index + 1, total: viewer.photos.length })}
                </Typography>
              </>
            ) : null}
          </Box>
        ) : null}
      </Dialog>
    </SectionContainer>
  )
}

function ReviewCard({
  author,
  rating,
  body,
  photos,
  date,
  onPhoto,
}: {
  author: string
  rating: number
  body: string
  photos: string[]
  date: string
  onPhoto: (index: number) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el || open) return
    setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [body, open])

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        p: 2,
        borderRadius: '20px',
        bgcolor: brand.white,
        border: `1px solid ${brand.creamBorder}`,
        boxShadow: brand.shadow,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '40px minmax(0, 1fr) auto',
          columnGap: 1.5,
          alignItems: 'center',
          minHeight: 40,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: brand.plantGreenMuted,
            color: brand.plantGreenDark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.95rem',
          }}
        >
          {(author || '?').slice(0, 1).toUpperCase()}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 800, color: brand.graphite, lineHeight: 1.25 }}>{author}</Typography>
          <Typography noWrap sx={{ fontSize: '0.78rem', color: brand.textSecondary, lineHeight: 1.3 }}>{date}</Typography>
        </Box>
        <Rating
          value={rating}
          readOnly
          sx={{
            color: starGold,
            fontSize: '1.15rem',
            '& .MuiRating-icon': { fontSize: '1.15rem' },
          }}
        />
      </Box>
      {body || photos.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: photos.length > 0 ? { xs: '1fr', sm: 'minmax(0, 1fr) auto' } : '1fr',
            gap: 1.5,
            alignItems: 'start',
          }}
        >
          {body ? (
            <Box sx={{ minWidth: 0, minHeight: open ? undefined : 52 }}>
              <Typography
                ref={textRef}
                sx={{
                  color: brand.graphite,
                  fontSize: '0.95rem',
                  lineHeight: 1.55,
                  minHeight: open ? undefined : '3.1em',
                  whiteSpace: 'pre-wrap',
                  ...(open
                    ? {}
                    : {
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }),
                }}
              >
                {body}
              </Typography>
              <Box sx={{ height: 22, mt: 0.25, display: 'flex', alignItems: 'center' }}>
                {overflows || open ? (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    sx={{ p: 0, border: 0, bgcolor: 'transparent', color: brand.plantGreenDark, fontWeight: 800, fontSize: '0.85rem', lineHeight: 1, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {open ? t('reviews.showLess') : t('reviews.showMore')}
                  </Box>
                ) : null}
              </Box>
            </Box>
          ) : (
            <Box />
          )}
          {photos.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
              {photos.map((src, index) => (
                <Box
                  key={`${index}-${src}`}
                  component="button"
                  type="button"
                  onClick={() => onPhoto(index)}
                  sx={{ p: 0, border: `1px solid ${brand.border}`, borderRadius: '12px', overflow: 'hidden', width: 64, height: 64, flex: '0 0 auto', cursor: 'pointer', bgcolor: brand.surface }}
                >
                  <MediaImg src={src} preset="thumb" alt={t('reviews.photo')} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Stack>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}
