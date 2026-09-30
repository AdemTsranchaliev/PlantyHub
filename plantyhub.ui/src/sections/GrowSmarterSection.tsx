import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { growSmarterIds } from '../data/catalog'
import { lifestyleImages } from '../data/images'
import { useHomepageImages, useHt, useHi } from '../hooks/useHomepage'
import { objectPositionForKey } from '../media/imageFocus'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const icons = { zero: BoltOutlinedIcon, noSoil: SpaOutlinedIcon, fresh: RestaurantOutlinedIcon } as const

function GrowItem({ id, index }: { id: (typeof growSmarterIds)[number]; index: number }) {
  const Icon = icons[id]
  const title = useHt(`growSmarter.items.${id}.title`)
  const description = useHt(`growSmarter.items.${id}.description`)
  return (
    <Reveal delay={index * 0.08}>
      <Stack direction="row" spacing={{ xs: 1.75, sm: 2.5 }} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flexShrink: 0, width: { xs: 44, sm: 54 }, height: { xs: 44, sm: 54 }, borderRadius: '50%', bgcolor: brand.plantGreenMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon sx={{ color: brand.plantGreenDark, fontSize: { xs: 22, sm: 26 } }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.35rem' }, mb: 0.35, color: brand.graphite }}>{title}</Typography>
          <Typography sx={{ color: brand.textSecondary, lineHeight: 1.65, fontSize: { xs: '0.92rem', sm: '1rem' } }}>{description}</Typography>
        </Box>
      </Stack>
    </Reveal>
  )
}

export default function GrowSmarterSection() {
  const subtitle = useHt('growSmarter.subtitle')
  const title = useHt('growSmarter.title')
  const images = useHomepageImages()
  const image = useHi('growSmarter.main', lifestyleImages.basilCloseup)

  return (
    <SectionContainer id="story" bgcolor={brand.white} py={{ xs: 4, sm: 6, md: 8 }}>
      <Grid container spacing={{ xs: 3.5, md: 7, lg: 9 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Reveal sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: '-8%', borderRadius: '50%', background: `radial-gradient(circle, ${brand.peachGlow} 0%, transparent 70%)`, filter: 'blur(40px)', zIndex: 0 }} />
            <Box sx={{ position: 'relative', zIndex: 1, borderRadius: '28px', overflow: 'hidden', border: `1px solid ${brand.border}`, boxShadow: brand.shadowHover, '& img': { transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }, '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.05)' } } }}>
              <MediaImg src={image} preset="gallery" alt={title} loading="lazy" sx={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', objectPosition: objectPositionForKey(images, 'growSmarter.main', 'main'), display: 'block', maxHeight: 560 }} />
            </Box>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Reveal>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: brand.plantGreen, mb: 1.25 }}>{subtitle}</Typography>
            <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: { xs: 2.5, md: 4 }, maxWidth: 520, fontSize: { xs: '1.75rem', sm: undefined } }}>{title}</Typography>
          </Reveal>
          <Stack spacing={{ xs: 2.5, md: 3.5 }}>
            {growSmarterIds.map((id, index) => (
              <GrowItem key={id} id={id} index={index} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
