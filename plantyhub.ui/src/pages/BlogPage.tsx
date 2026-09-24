import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { blogArticleIds, blogArticleImages, navHrefs } from '../data/catalog'
import { useSiteAssetsStore } from '../hooks/useSiteAssets'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

export default function BlogPage() {
  const { t } = useTranslation()
  const { images } = useSiteAssetsStore()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const articleImage = (id: (typeof blogArticleIds)[number]) =>
    images[`blog.${id}`] || blogArticleImages[id]

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 5, sm: 6, md: 8 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {t('blogPage.title')}
          </Typography>
        </Stack>

        <Reveal sx={{ maxWidth: 720 }}>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: brand.plantGreen,
              bgcolor: brand.plantGreenMuted,
              borderRadius: 999,
              px: 1.5,
              py: 0.6,
              mb: 2,
            }}
          >
            {t('blogPage.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.5 }}>
            {t('blogPage.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.15rem', lineHeight: 1.7 }}>
            {t('blogPage.lead')}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Grid container spacing={{ xs: 2.5, sm: 3, md: 3.5 }}>
          {blogArticleIds.map((id, index) => (
            <Grid key={id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Reveal delay={(index % 3) * 0.06} sx={{ height: '100%' }}>
                <Link
                  component={RouterLink}
                  to={`${navHrefs.blog}/${id}`}
                  underline="none"
                  color="inherit"
                  sx={{ display: 'block', height: '100%' }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      bgcolor: brand.surface,
                      border: `1px solid ${brand.border}`,
                      transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                      '@media (hover: hover)': {
                        '&:hover': { boxShadow: brand.shadow, transform: 'translateY(-3px)' },
                      },
                    }}
                  >
                      <MediaImg
                        src={articleImage(id)}
                        preset="card"
                        alt={t(`blogPage.articles.${id}.title`)}
                        loading="lazy"
                        decoding="async"
                      sx={{ width: '100%', height: { xs: 180, sm: 200 }, objectFit: 'cover', display: 'block' }}
                    />
                    <Box sx={{ p: { xs: 2.25, sm: 2.75 } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block', fontWeight: 600 }}>
                        {t(`blogPage.articles.${id}.date`)}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 600,
                          lineHeight: 1.35,
                          mb: 1,
                          fontSize: { xs: '1.15rem', sm: '1.25rem' },
                          color: brand.graphite,
                        }}
                      >
                        {t(`blogPage.articles.${id}.title`)}
                      </Typography>
                      <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.65, mb: 1.75 }}>
                        {t(`blogPage.articles.${id}.excerpt`)}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: brand.plantGreenDark,
                        }}
                      >
                        {t('common.readMore')}
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>
    </main>
  )
}
