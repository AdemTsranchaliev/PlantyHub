import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StarRounded from '@mui/icons-material/StarRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'
import EnergySavingsLeafOutlined from '@mui/icons-material/EnergySavingsLeafOutlined'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { lifestyleImages } from '../data/images'
import { useProduct, useSeedPodsCatalog, toProductCardData } from '../hooks/useProducts'
import { useAddProductToCart } from '../hooks/useCart'
import { brand } from '../theme'

const trustItems = ['compatible', 'nonGmo', 'shipping'] as const

export default function PodDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const pod = useProduct('pods', id)
  const allPods = useSeedPodsCatalog()
  const addProductToCart = useAddProductToCart()
  const [qty, setQty] = useState(1)
  const [active, setActive] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setActive(0)
    setQty(1)
  }, [id])

  useEffect(() => {
    if (pod) {
      document.title = `${pod.name} · PlantyHub`
      return () => {
        document.title = 'PlantyHub'
      }
    }
  }, [pod])

  if (!pod) {
    return (
      <SectionContainer py={{ xs: 8, md: 12 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>404</Typography>
        <Button variant="contained" component={RouterLink} to={navHrefs.pods}>
          {t('podsPage.title')}
        </Button>
      </SectionContainer>
    )
  }

  const gallery = [pod.image, lifestyleImages.basilCloseup, lifestyleImages.kitchenBasil]
  const specs = [
    { key: 'harvest', Icon: ScheduleOutlined, value: t('podDetail.specs.harvest.value') },
    { key: 'pack', Icon: Inventory2Outlined, value: t(`common.${pod.packKey}`) },
    { key: 'light', Icon: WbSunnyOutlined, value: t('podDetail.specs.light.value') },
    { key: 'nature', Icon: EnergySavingsLeafOutlined, value: t('podDetail.specs.nature.value') },
  ]
  const related = allPods.filter((p) => p.id !== pod.id).slice(0, 4)

  return (
    <main>
      <SectionContainer py={{ xs: 3, sm: 4, md: 5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Link component={RouterLink} to={navHrefs.pods} underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('podsPage.title')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {pod.name}
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 4, md: 6, lg: 8 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal
              sx={{
                borderRadius: '28px',
                overflow: 'hidden',
                border: `1px solid ${brand.border}`,
                boxShadow: brand.shadowHover,
                bgcolor: brand.surface,
              }}
            >
              <Box
                component="img"
                src={gallery[active]}
                alt={pod.name}
                decoding="async"
                fetchPriority="high"
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  objectFit: active === 0 ? (pod.imageFit ?? 'contain') : 'cover',
                  p: active === 0 && (pod.imageFit ?? 'contain') === 'contain' ? { xs: 3, sm: 5 } : 0,
                  boxSizing: 'border-box',
                  display: 'block',
                }}
              />
            </Reveal>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              {gallery.map((src, i) => (
                <Box
                  key={i}
                  component="button"
                  onClick={() => setActive(i)}
                  aria-label={`${pod.name} ${i + 1}`}
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 64, sm: 80 },
                    p: 0,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: brand.surface,
                    border: active === i ? `2px solid ${brand.plantGreen}` : `1px solid ${brand.border}`,
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <Box component="img" src={src} alt="" loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <Stack direction="row" sx={{ color: '#CE8A4A' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarRounded key={i} sx={{ fontSize: 18 }} />
                  ))}
                </Stack>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.textSecondary }}>
                  {t('hero.badge')}
                </Typography>
              </Stack>

              <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1 }}>
                {pod.name}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontWeight: 600, mb: 2 }}>
                {t(`common.${pod.packKey}`)}
              </Typography>

              <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '2.4rem', color: brand.plantGreenDark, lineHeight: 1, mb: 2 }}>
                {pod.price}
              </Typography>

              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: brand.plantGreenDark }}>
                  {t('pdp.inStock')}
                </Typography>
              </Stack>

              <Typography sx={{ color: brand.textSecondary, lineHeight: 1.75, fontSize: '1.05rem', mb: 3.5 }}>
                {pod.description}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, mb: 3.5 }}>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', border: `1px solid ${brand.border}`, borderRadius: 999, px: 0.5, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
                >
                  <IconButton aria-label="−" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
                    <RemoveRounded fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{qty}</Typography>
                  <IconButton aria-label="+" onClick={() => setQty((q) => Math.min(9, q + 1))}>
                    <AddRounded fontSize="small" />
                  </IconButton>
                </Stack>
                <Button variant="contained" size="large" fullWidth sx={{ px: 4 }} onClick={() => addProductToCart('pods', pod, qty)}>
                  {t('common.addToCart')}
                </Button>
              </Stack>

              <Stack spacing={1.25} sx={{ pt: 3, borderTop: `1px solid ${brand.border}` }}>
                {trustItems.map((key) => (
                  <Stack key={key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CheckCircleRounded sx={{ fontSize: 18, color: brand.plantGreen }} />
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: brand.graphite }}>
                      {t(`podDetail.trust.${key}`)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.surface} py={{ xs: 6, sm: 7, md: 8 }}>
        <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 3 }}>
          {t('podDetail.detailsTitle')}
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {specs.map(({ key, Icon, value }, index) => (
            <Grid key={key} size={{ xs: 6, md: 3 }}>
              <Reveal
                delay={index * 0.06}
                sx={{ height: '100%', bgcolor: brand.white, borderRadius: '20px', p: { xs: 2.5, sm: 3 }, border: `1px solid ${brand.border}`, textAlign: 'center' }}
              >
                <Box
                  sx={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${brand.plantGreen}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}
                >
                  <Icon sx={{ color: brand.plantGreen, fontSize: 26 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: brand.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                  {t(`podDetail.specs.${key}.label`)}
                </Typography>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.05rem', color: brand.graphite }}>
                  {value}
                </Typography>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 6, sm: 7, md: 8 }}>
        <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 3 }}>
          {t('podDetail.relatedTitle')}
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {related.map((rel, index) => (
            <Grid key={rel.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Reveal delay={(index % 4) * 0.06}>
                <ProductCard layout="grid" to={`/pods/${rel.id}`} product={toProductCardData(rel, t)} />
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>
    </main>
  )
}
