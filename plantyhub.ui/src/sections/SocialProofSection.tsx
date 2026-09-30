import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { socialProofReviewIds, socialProofImages } from '../data/catalog'
import { useHomepageImages, useHt, useHi } from '../hooks/useHomepage'
import { objectPositionForKey } from '../media/imageFocus'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

function ReviewCard({ id, index }: { id: (typeof socialProofReviewIds)[number]; index: number }) {
  const review = useHt(`socialProof.reviews.${id}`)
  const handle = useHt(`community.handles.${id}`)
  const images = useHomepageImages()
  const image = useHi(`socialProof.${id}`, socialProofImages[id])
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Reveal
        delay={index * 0.1}
        sx={{
          bgcolor: brand.surface,
          borderRadius: '24px',
          overflow: 'hidden',
          border: `1px solid ${brand.border}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.28s ease, box-shadow 0.28s ease',
          '& img': { transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)' },
          '@media (hover: hover)': {
            '&:hover': { transform: 'translateY(-4px)', boxShadow: brand.shadowHover },
            '&:hover img': { transform: 'scale(1.06)' },
          },
        }}
      >
        <MediaImg src={image} preset="card" alt="" loading="lazy" sx={{ width: '100%', height: { xs: 150, sm: 180 }, objectFit: 'cover', objectPosition: objectPositionForKey(images, `socialProof.${id}`, 'card'), display: 'block' }} />
        <Box sx={{ p: { xs: 2.25, sm: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <FormatQuoteRounded sx={{ color: brand.plantGreen, fontSize: { xs: 26, sm: 32 }, mb: 0.75 }} />
          <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.5, flex: 1, color: brand.graphite }}>{review}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mt: { xs: 1.75, sm: 2.5 }, color: brand.plantGreenDark }}>@{handle}</Typography>
        </Box>
      </Reveal>
    </Grid>
  )
}

export default function SocialProofSection() {
  const subtitle = useHt('socialProof.subtitle')
  const stat = useHt('socialProof.stat')
  const statLabel = useHt('socialProof.statLabel')

  return (
    <SectionContainer bgcolor={brand.white} py={{ xs: 4, sm: 6, md: 8 }}>
      <Reveal sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 2.75, md: 7 } }}>
        <Stack direction="row" sx={{ color: '#CE8A4A', justifyContent: 'center', mb: { xs: 1.25, sm: 2 } }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarRounded key={i} sx={{ fontSize: { xs: 20, sm: 24 } }} />
          ))}
        </Stack>
        <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: { xs: 1.25, sm: 2 }, fontSize: { xs: '1.65rem', sm: undefined } }}>{subtitle}</Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
          <Box component="span" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: brand.plantGreenDark }}>{stat}</Box> {statLabel}
        </Typography>
      </Reveal>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {socialProofReviewIds.slice(0, 2).map((id, index) => (
          <ReviewCard key={id} id={id} index={index} />
        ))}
      </Grid>
    </SectionContainer>
  )
}
