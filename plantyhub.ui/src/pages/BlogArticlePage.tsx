import { useEffect, useMemo } from 'react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { blogArticleIds, blogArticleImages, navHrefs } from '../data/catalog'
import { useSiteAssetsStore } from '../hooks/useSiteAssets'
import { brand } from '../theme'

type BlogArticleId = (typeof blogArticleIds)[number]

function isBlogArticleId(id: string | undefined): id is BlogArticleId {
  return Boolean(id && (blogArticleIds as readonly string[]).includes(id))
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

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 4, sm: 5, md: 6 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Link component={RouterLink} to={navHrefs.blog} underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('blogPage.title')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {t(`blogPage.articles.${articleId}.title`)}
          </Typography>
        </Stack>

        <Reveal sx={{ maxWidth: 760 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1.5 }}>
            {t(`blogPage.articles.${articleId}.date`)}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>
            {t(`blogPage.articles.${articleId}.title`)}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.12rem', lineHeight: 1.7 }}>
            {t(`blogPage.articles.${articleId}.excerpt`)}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 4, sm: 5, md: 7 }}>
        <Reveal
          sx={{
            borderRadius: '28px',
            overflow: 'hidden',
            border: `1px solid ${brand.border}`,
            mb: { xs: 4, md: 5 },
            maxWidth: 920,
          }}
        >
          <Box
            component="img"
            src={heroImage}
            alt={t(`blogPage.articles.${articleId}.title`)}
            loading="eager"
            decoding="async"
            sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
          />
        </Reveal>

        <Reveal sx={{ maxWidth: 720 }}>
          {paragraphs.map((paragraph) => (
            <Typography
              key={paragraph.slice(0, 40)}
              sx={{ color: brand.textSecondary, fontSize: '1.08rem', lineHeight: 1.85, mb: 2.5 }}
            >
              {paragraph}
            </Typography>
          ))}

          <Button
            component={RouterLink}
            to={navHrefs.blog}
            startIcon={<ArrowBackRounded />}
            sx={{ mt: 2, fontWeight: 700, color: brand.plantGreenDark }}
          >
            {t('blogPage.backToBlog')}
          </Button>
        </Reveal>
      </SectionContainer>

      {related.length > 0 && (
        <SectionContainer bgcolor={brand.cream} py={{ xs: 5, sm: 6, md: 8 }}>
          <Reveal sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.85rem' }, color: brand.graphite }}>
              {t('blogPage.related')}
            </Typography>
          </Reveal>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {related.map((id, index) => (
              <Grid key={id} size={{ xs: 12, sm: 4 }}>
                <Reveal delay={index * 0.06}>
                  <Link component={RouterLink} to={`${navHrefs.blog}/${id}`} underline="none" color="inherit">
                    <Box
                      sx={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        bgcolor: brand.white,
                        border: `1px solid ${brand.creamBorder}`,
                        transition: 'box-shadow 0.25s ease',
                        '@media (hover: hover)': {
                          '&:hover': { boxShadow: brand.shadow },
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={images[`blog.${id}`] || blogArticleImages[id]}
                        alt={t(`blogPage.articles.${id}.title`)}
                        loading="lazy"
                        sx={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                      />
                      <Box sx={{ p: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: brand.graphite, lineHeight: 1.4 }}>
                          {t(`blogPage.articles.${id}.title`)}
                        </Typography>
                      </Box>
                    </Box>
                  </Link>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </SectionContainer>
      )}
    </main>
  )
}
