import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grass from '@mui/icons-material/Grass'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'
import Height from '@mui/icons-material/Height'
import WaterDropOutlined from '@mui/icons-material/WaterDropOutlined'
import ScienceOutlined from '@mui/icons-material/ScienceOutlined'
import StraightenOutlined from '@mui/icons-material/StraightenOutlined'
import { Link as RouterLink } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs, homepageProductSpecRows } from '../data/catalog'
import { useProduct } from '../hooks/useProducts'
import { useHomepageImages, useHt, useHi } from '../hooks/useHomepage'
import { responsiveObjectPosition } from '../media/imageFocus'
import { lifestyleImages } from '../data/images'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const specIcons = { pods: Grass, light: WbSunnyOutlined, growthHeight: Height, irrigation: WaterDropOutlined, nutrients: ScienceOutlined, dimensions: StraightenOutlined } as const
function SpecRow({ rowKey, valueKey }: { rowKey: string; valueKey: string }) {
  const Icon = specIcons[rowKey as keyof typeof specIcons]
  const label = useHt(`product.specs.${rowKey}`)
  const value = useHt(`product.specs.${valueKey}`)
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Stack data-clarity-unmask="true" direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Icon sx={{ color: brand.plantGreen, fontSize: 22, mt: 0.25, flexShrink: 0 }} />
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: brand.graphite, lineHeight: 1.3 }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: brand.textSecondary, lineHeight: 1.45 }}>{value}</Typography>
        </Box>
      </Stack>
    </Grid>
  )
}

export default function ProductSection() {
  const garden = useProduct('gardens', 'homegarder-one')
  const images = useHomepageImages()
  const image = useHi('product.main', lifestyleImages.kitchenBasil)
  const eyebrow = useHt('product.eyebrow')
  const title = useHt('product.title')
  const description = useHt('product.description')
  const cta = useHt('product.cta')
  const statPodsValue = useHt('hero.stats.pods.value')
  const statPodsLabel = useHt('hero.stats.pods.label')

  return (
    <SectionContainer id="product" bgcolor={brand.beige} py={{ xs: 4, sm: 6, md: 8 }}>
      <Grid container spacing={{ xs: 3.5, md: 7, lg: 9 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Reveal sx={{ position: 'relative' }}>
            <Box sx={{ borderRadius: { xs: '20px', sm: '28px' }, overflow: 'hidden', border: `1px solid ${brand.border}`, boxShadow: brand.shadowHover, '& img': { transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }, '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.05)' } } }}>
              <MediaImg src={image} preset="gallery" alt={title} loading="lazy" sx={{ width: '100%', aspectRatio: { xs: '16/10', md: '1/1' }, objectFit: 'cover', objectPosition: responsiveObjectPosition(images, 'product.main', 'mobile', 'desktop'), display: 'block' }} />
            </Box>
            <Box data-clarity-unmask="true" sx={{ position: 'absolute', top: { xs: 12, sm: 22 }, left: { xs: 12, sm: 22 }, bgcolor: brand.white, borderRadius: 999, px: { xs: 1.35, sm: 2 }, py: { xs: 0.65, sm: 0.9 }, boxShadow: brand.shadow, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
              <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.8rem' }, color: brand.graphite }}>{statPodsValue} · {statPodsLabel}</Typography>
            </Box>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Reveal>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.7, borderRadius: 999, bgcolor: brand.plantGreenMuted, mb: { xs: 1.75, sm: 2.5 } }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: brand.plantGreen }} />
              <Typography component="span" sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: brand.plantGreenDark }}>{eyebrow}</Typography>
            </Box>
            <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: { xs: 1.25, sm: 2 }, fontSize: { xs: '1.75rem', sm: undefined } }}>{title}</Typography>
            <Typography sx={{ color: brand.textSecondary, lineHeight: 1.65, mb: { xs: 2.5, sm: 4 }, fontSize: { xs: '0.95rem', sm: '1.08rem' }, maxWidth: 520 }}>{description}</Typography>
            <Grid container spacing={{ xs: 1.75, sm: 2.5 }} sx={{ mb: { xs: 2.5, sm: 4 } }}>
              {homepageProductSpecRows.map((row) => (
                <SpecRow key={row.key} rowKey={row.key} valueKey={row.valueKey} />
              ))}
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.85rem', sm: '2.4rem' }, color: brand.plantGreenDark, lineHeight: 1 }}>{garden?.price}</Typography>
              <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} fullWidth sx={{ width: { sm: 'auto' }, px: { sm: 4.5 }, minHeight: 48 }}>{cta}</Button>
            </Stack>
          </Reveal>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
