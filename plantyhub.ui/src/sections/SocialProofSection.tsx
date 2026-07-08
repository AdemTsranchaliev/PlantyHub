import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { socialProofReviewIds, socialProofImages } from '../data/catalog'
import { useHt, useHi } from '../hooks/useHomepage'
import { brand } from '../theme'

function ReviewCard({ id, index }: { id: (typeof socialProofReviewIds)[number]; index: number }) {
  const review = useHt(`socialProof.reviews.${id}`)
  const handle = useHt(`community.handles.${id}`)
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
        <Box component="img" src={image} alt="" loading="lazy" sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
        <Box sx={{ p: { xs: 3, sm: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <FormatQuoteRounded sx={{ color: brand.plantGreen, fontSize: 32, mb: 1 }} />
          <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.1rem', lineHeight: 1.55, flex: 1, color: brand.graphite }}>{review}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mt: 2.5, color: brand.plantGreenDark }}>@{handle}</Typography>
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
    <SectionContainer bgcolor={brand.white} py={{ xs: 7, sm: 9, md: 12 }}>
      <Reveal sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 5, md: 7 } }}>
        <Stack direction="row" sx={{ color: '#CE8A4A', justifyContent: 'center', mb: 2 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarRounded key={i} sx={{ fontSize: 24 }} />
          ))}
        </Stack>
        <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>{subtitle}</Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem' }}>
          <Box component="span" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: brand.plantGreenDark }}>{stat}</Box> {statLabel}
        </Typography>
      </Reveal>
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {socialProofReviewIds.slice(0, 2).map((id, index) => (
          <ReviewCard key={id} id={id} index={index} />
        ))}
      </Grid>
    </SectionContainer>
  )
}
