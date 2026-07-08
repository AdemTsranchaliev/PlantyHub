import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import HorizontalScroll from '../components/HorizontalScroll'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import { pressArticleIds, pressArticleImages } from '../data/catalog'
import { brand } from '../theme'

export default function PressSection() {
  const { t } = useTranslation()

  return (
    <SectionContainer id="press" bgcolor={brand.surface} py={{ xs: 5, sm: 7, md: 9 }} bleedX>
      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionHeading eyebrow={t('press.eyebrow')} title={t('press.title')} size="md" align="left" />
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' }, px: { md: 0 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {pressArticleIds.map((id) => (
            <Grid key={id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <ArticleCard id={id} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <HorizontalScroll gap={2}>
          {pressArticleIds.map((id) => (
            <Box
              key={id}
              data-scroll-item
              sx={{ flex: { xs: '0 0 min(84vw, 300px)', sm: '0 0 min(55vw, 320px)' }, scrollSnapAlign: 'start' }}
            >
              <ArticleCard id={id} />
            </Box>
          ))}
        </HorizontalScroll>
      </Box>
    </SectionContainer>
  )
}

function ArticleCard({ id }: { id: (typeof pressArticleIds)[number] }) {
  const { t } = useTranslation()

  return (
    <Link href="#" underline="none" color="inherit" sx={{ display: 'block', height: '100%' }}>
      <Box
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: brand.white,
          border: `1px solid ${brand.border}`,
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
          '@media (hover: hover)': {
            '&:hover': { boxShadow: brand.shadow, transform: 'translateY(-3px)' },
          },
        }}
      >
        <Box
          component="img"
          src={pressArticleImages[id]}
          alt={t(`press.articles.${id}.title`)}
          loading="lazy"
          sx={{ width: '100%', height: { xs: 160, sm: 180 }, objectFit: 'cover', display: 'block' }}
        />
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block', fontWeight: 600 }}>
            {t(`press.articles.${id}.date`)}
          </Typography>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.35, mb: 1.25, fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
            {t(`press.articles.${id}.title`)}
          </Typography>
          <Typography
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 700,
              fontSize: '0.85rem',
              color: brand.plantGreenDark,
            }}
          >
            {t('common.readMore')}
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Typography>
        </Box>
      </Box>
    </Link>
  )
}
