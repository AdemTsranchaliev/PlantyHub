import { useEffect, useMemo } from 'react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import ScheduleRounded from '@mui/icons-material/ScheduleRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer, { pagePaddingX } from '../components/SectionContainer'
import { blogArticleIds, blogArticleImages, navHrefs } from '../data/catalog'
import { useSiteAssetsStore } from '../hooks/useSiteAssets'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

type BlogArticleId = (typeof blogArticleIds)[number]

function isBlogArticleId(id: string | undefined): id is BlogArticleId {
  return Boolean(id && (blogArticleIds as readonly string[]).includes(id))
}

function readingMinutes(paragraphs: string[]) {
  const words = paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.ceil(words / 180))
}

export default function BlogArticlePage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { images } = useSiteAssetsStore()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  const articleId = isBlogArticleId(slug) ? slug : null
  const body = t(`blogPage.articles.${articleId ?? 'pesto'}.body`, { returnObjects: true })
  const paragraphs = useMemo(() => (Array.isArray(body) ? (body as string[]) : []), [body])
  const minutes = readingMinutes(paragraphs)

  const related = useMemo(() => {
    if (!articleId) return []
    return blogArticleIds.filter((id) => id !== articleId).slice(0, 3)
  }, [articleId])

  const heroImage = articleId
    ? images[`blog.${articleId}`] || blogArticleImages[articleId]
    : blogArticleImages.pesto

  if (!articleId) {
    return <Navigate to={navHrefs.blog} replace />
  }

  const title = t(`blogPage.articles.${articleId}.title`)
  const excerpt = t(`blogPage.articles.${articleId}.excerpt`)
  const date = t(`blogPage.articles.${articleId}.date`)

  return (
    <main>
      <Box sx={{ bgcolor: brand.surface, borderBottom: `1px solid ${brand.border}` }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: pagePaddingX, py: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
              {t('pdp.home')}
            </Link>
            <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
            <Link component={RouterLink} to={navHrefs.blog} underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
              {t('blogPage.title')}
            </Link>
          </Stack>
        </Box>
      </Box>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2.5, rowGap: 1 }}>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: brand.plantGreenDark,
              }}
            >
              {t('blogPage.eyebrow')}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: brand.border }} />
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: brand.textSecondary }}>{date}</Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: brand.border }} />
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: brand.textSecondary }}>
              <ScheduleRounded sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{t('blogPage.minRead', { minutes })}</Typography>
            </Stack>
          </Stack>

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '2rem', sm: '2.55rem', md: '3rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              color: brand.graphite,
              mb: 2.5,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 500,
              fontSize: { xs: '1.2rem', md: '1.35rem' },
              lineHeight: 1.55,
              color: brand.graphite,
              mb: { xs: 3.5, md: 4 },
            }}
          >
            {excerpt}
          </Typography>

          <MediaImg
            src={heroImage}
            preset="hero"
            alt={title}
            loading="eager"
            decoding="async"
            sx={{
              width: '100%',
              aspectRatio: '16 / 10',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              display: 'block',
              borderRadius: { xs: '18px', md: '24px' },
              mb: { xs: 4, md: 5 },
            }}
          />

          <Box
            component="article"
            sx={{
              '& > p:first-of-type::first-letter': {
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: '3.4rem',
                lineHeight: 0.85,
                float: 'left',
                mr: 1.25,
                mt: 0.4,
                color: brand.plantGreenDark,
              },
            }}
          >
            {paragraphs.map((paragraph, index) => (
              <Typography
                key={`${articleId}-${index}`}
                component="p"
                sx={{ color: brand.graphite, fontSize: { xs: '1.05rem', md: '1.12rem' }, lineHeight: 1.85, mb: 2.75, opacity: 0.92 }}
              >
                {paragraph}
              </Typography>
            ))}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 5, pt: 4, borderTop: `1px solid ${brand.border}` }}>
            <Button
              component={RouterLink}
              to={navHrefs.blog}
              startIcon={<ArrowBackRounded />}
              sx={{ fontWeight: 700, color: brand.graphite, alignSelf: { sm: 'center' } }}
            >
              {t('blogPage.backToBlog')}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" component={RouterLink} to={navHrefs.buy} endIcon={<ArrowForwardRounded />} sx={{ px: 3 }}>
              {t('blogPage.articleCta')}
            </Button>
          </Stack>
        </Box>
      </SectionContainer>

      {related.length > 0 && (
        <SectionContainer bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 9 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', mb: { xs: 3.5, md: 5 }, gap: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: brand.plantGreen,
                  mb: 1,
                }}
              >
                {t('blogPage.title')}
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.7rem', md: '2.1rem' },
                  color: brand.graphite,
                  letterSpacing: '-0.02em',
                }}
              >
                {t('blogPage.related')}
              </Typography>
            </Box>
            <Button component={RouterLink} to={navHrefs.blog} endIcon={<ArrowForwardRounded />} sx={{ fontWeight: 700, color: brand.plantGreenDark }}>
              {t('blogPage.viewAll')}
            </Button>
          </Stack>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {related.map((id) => (
              <Grid key={id} size={{ xs: 12, md: 4 }}>
                <Link
                  component={RouterLink}
                  to={`${navHrefs.blog}/${id}`}
                  underline="none"
                  color="inherit"
                  sx={{
                    display: 'block',
                    height: '100%',
                    transition: 'transform 0.25s ease',
                    '@media (hover: hover)': {
                      '&:hover': { transform: 'translateY(-3px)' },
                      '&:hover .related-title': { color: brand.plantGreenDark },
                    },
                  }}
                >
                    <MediaImg
                      src={images[`blog.${id}`] || blogArticleImages[id]}
                      preset="card"
                      alt={t(`blogPage.articles.${id}.title`)}
                      loading="lazy"
                      decoding="async"
                    sx={{
                      width: '100%',
                      aspectRatio: '4 / 3',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '20px',
                      mb: 2,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: brand.textSecondary, mb: 0.75 }}>
                    {t(`blogPage.articles.${id}.date`)}
                  </Typography>
                  <Typography
                    className="related-title"
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 600,
                      fontSize: '1.2rem',
                      lineHeight: 1.35,
                      color: brand.graphite,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {t(`blogPage.articles.${id}.title`)}
                  </Typography>
                </Link>
              </Grid>
            ))}
          </Grid>
        </SectionContainer>
      )}
    </main>
  )
}
