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
import { useHt, useHi } from '../hooks/useHomepage'
import { lifestyleImages } from '../data/images'
import { brand } from '../theme'

const specIcons = { pods: Grass, light: WbSunnyOutlined, growthHeight: Height, irrigation: WaterDropOutlined, nutrients: ScienceOutlined, dimensions: StraightenOutlined } as const
function SpecRow({ rowKey, valueKey }: { rowKey: string; valueKey: string }) {
  const Icon = specIcons[rowKey as keyof typeof specIcons]
  const label = useHt(`product.specs.${rowKey}`)
  const value = useHt(`product.specs.${valueKey}`)
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
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
  const image = useHi('product.main', lifestyleImages.kitchenBasil)
  const eyebrow = useHt('product.eyebrow')
  const title = useHt('product.title')
  const description = useHt('product.description')
  const cta = useHt('product.cta')
  const statPodsValue = useHt('hero.stats.pods.value')
  const statPodsLabel = useHt('hero.stats.pods.label')

  return (
    <SectionContainer id="product" bgcolor={brand.white} py={{ xs: 7, sm: 9, md: 12 }}>
      <Grid container spacing={{ xs: 5, md: 7, lg: 9 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Reveal sx={{ position: 'relative' }}>
            <Box sx={{ borderRadius: '28px', overflow: 'hidden', border: `1px solid ${brand.border}`, boxShadow: brand.shadowHover, '& img': { transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }, '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.05)' } } }}>
              <Box component="img" src={image} alt={title} loading="lazy" sx={{ width: '100%', aspectRatio: { xs: '4/3', md: '1/1' }, objectFit: 'cover', display: 'block' }} />
            </Box>
            <Box sx={{ position: 'absolute', top: { xs: 16, sm: 22 }, left: { xs: 16, sm: 22 }, bgcolor: brand.white, borderRadius: 999, px: 2, py: 0.9, boxShadow: brand.shadow, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: brand.graphite }}>{statPodsValue} · {statPodsLabel}</Typography>
            </Box>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Reveal>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.7, borderRadius: 999, bgcolor: brand.plantGreenMuted, mb: 2.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: brand.plantGreen }} />
              <Typography component="span" sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: brand.plantGreenDark }}>{eyebrow}</Typography>
            </Box>
            <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>{title}</Typography>
            <Typography sx={{ color: brand.textSecondary, lineHeight: 1.75, mb: 4, fontSize: '1.08rem', maxWidth: 520 }}>{description}</Typography>
            <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: 4 }}>
              {homepageProductSpecRows.map((row) => (
                <SpecRow key={row.key} rowKey={row.key} valueKey={row.valueKey} />
              ))}
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '2.1rem', sm: '2.4rem' }, color: brand.plantGreenDark, lineHeight: 1 }}>{garden?.price}</Typography>
              <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} fullWidth sx={{ width: { sm: 'auto' }, px: { sm: 4.5 } }}>{cta}</Button>
            </Stack>
          </Reveal>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
