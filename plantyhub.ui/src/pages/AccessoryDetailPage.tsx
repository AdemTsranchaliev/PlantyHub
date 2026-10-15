import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ProductCard'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import MediaImg from '../components/MediaImg'
import { navHrefs } from '../data/catalog'
import { useProduct, useAccessoriesCatalog, toProductCardData } from '../hooks/useProducts'
import { useAddProductToCart } from '../hooks/useCart'
import { useTrackViewItem } from '../measure/commerce'
import { brand } from '../theme'
import { defaultLanguage, isLanguageCode } from '../i18n/languages'

/** Colour variants are separate products named "<Base> · <Colour>". */
function splitVariantName(name: string) {
  const [base, colour] = name.split(' · ')
  return { base: base.trim(), colour: colour?.trim() }
}

export default function AccessoryDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const item = useProduct('accessories', id)
  useTrackViewItem('accessories', item)
  const allAccessories = useAccessoriesCatalog()
  const addProductToCart = useAddProductToCart()
  const [qty, setQty] = useState(1)
  const [active, setActive] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setActive(0)
    setQty(1)
  }, [id])

  useEffect(() => {
    if (item) {
      document.title = `${item.name} · PlantyHub`
      return () => {
        document.title = 'PlantyHub'
      }
    }
  }, [item])

  if (!item) {
    return (
      <SectionContainer py={{ xs: 8, md: 12 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>404</Typography>
        <Button variant="contained" component={RouterLink} to={navHrefs.accessories}>
          {t('accessoriesPage.title')}
        </Button>
      </SectionContainer>
    )
  }

  const gallery = item.gallery?.length ? item.gallery : [item.image]
  const { base, colour } = splitVariantName(item.name)
  const variants = allAccessories.filter((p) => splitVariantName(p.name).base === base)
  const related = allAccessories.filter((p) => splitVariantName(p.name).base !== base).slice(0, 4)
  const fit = item.imageFit ?? 'contain'
  const code = i18n.language?.split('-')[0]
  const locale = item.locales[isLanguageCode(code) ? code : defaultLanguage] ?? item.locales.en
  const features = locale?.features ?? []
  const specs = locale?.specs ?? []

  return (
    <main>
      <SectionContainer py={{ xs: 3, sm: 4, md: 5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Link component={RouterLink} to={navHrefs.accessories} underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('accessoriesPage.title')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {item.name}
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
                bgcolor: brand.white,
              }}
            >
              <MediaImg
                src={gallery[active]}
                preset="gallery"
                alt={item.name}
                decoding="async"
                fetchPriority="high"
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  objectFit: fit,
                  p: fit === 'contain' ? { xs: 2, sm: 4 } : 0,
                  boxSizing: 'border-box',
                  display: 'block',
                }}
              />
            </Reveal>
            {gallery.length > 1 && (
              <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: 'auto', pb: 0.5 }}>
                {gallery.map((src, i) => (
                  <Box
                    key={src}
                    component="button"
                    onClick={() => setActive(i)}
                    aria-label={`${item.name} ${i + 1}`}
                    sx={{
                      flexShrink: 0,
                      width: { xs: 64, sm: 80 },
                      height: { xs: 64, sm: 80 },
                      p: 0,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      bgcolor: brand.white,
                      border: active === i ? `2px solid ${brand.plantGreen}` : `1px solid ${brand.border}`,
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <MediaImg src={src} preset="thumb" alt="" loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal>
              <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1 }}>
                {base}
              </Typography>
              {item.tagline && (
                <Typography sx={{ color: brand.textSecondary, fontWeight: 600, mb: 2 }}>
                  {item.tagline}
                </Typography>
              )}

              <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '2.4rem', color: brand.plantGreenDark, lineHeight: 1, mb: 2 }}>
                {item.price}
              </Typography>

              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: brand.plantGreenDark }}>
                  {t('pdp.inStock')}
                </Typography>
              </Stack>

              {item.description && (
                <Typography sx={{ color: brand.textSecondary, lineHeight: 1.75, fontSize: '1.05rem', mb: 3, whiteSpace: 'pre-line' }}>
                  {item.description}
                </Typography>
              )}

              {features.length > 0 && (
                <Stack spacing={1.5} sx={{ mb: 3.5 }}>
                  {features.map((feature) => (
                    <Stack key={feature.title} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <CheckCircleRounded sx={{ fontSize: 20, color: brand.plantGreen, mt: '2px' }} />
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.35 }}>{feature.title}</Typography>
                        <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', lineHeight: 1.5 }}>{feature.text}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}

              {variants.length > 1 && (
                <Box sx={{ mb: 3.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.textSecondary, mb: 1.25 }}>
                    {t('pdp.color')}{colour ? `: ${colour}` : ''}
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                    {variants.map((variant) => {
                      const selected = variant.id === item.id
                      const label = splitVariantName(variant.name).colour ?? variant.name
                      return (
                        <Box
                          key={variant.id}
                          component={RouterLink}
                          to={`/accessories/${variant.id}`}
                          replace
                          aria-label={label}
                          aria-current={selected ? 'true' : undefined}
                          title={label}
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            bgcolor: brand.white,
                            border: selected ? `2px solid ${brand.plantGreen}` : `1px solid ${brand.border}`,
                            position: 'relative',
                            display: 'block',
                          }}
                        >
                          <MediaImg src={variant.image} preset="thumb" alt="" loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                          {variant.colors?.[0] && (
                            <Box
                              sx={{
                                position: 'absolute',
                                right: 4,
                                bottom: 4,
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: variant.colors[0].hex,
                                border: `1px solid ${brand.border}`,
                              }}
                            />
                          )}
                        </Box>
                      )
                    })}
                  </Stack>
                </Box>
              )}

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
                <Button variant="contained" size="large" fullWidth sx={{ px: 4 }} onClick={() => addProductToCart('accessories', item, qty)}>
                  {t('common.addToCart')}
                </Button>
              </Stack>

              <Stack spacing={1.25} sx={{ pt: 3, borderTop: `1px solid ${brand.border}` }}>
                {(['compatible', 'shipping'] as const).map((key) => (
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

      {specs.length > 0 && (
        <SectionContainer bgcolor={brand.surface} py={{ xs: 6, sm: 7, md: 8 }}>
          <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 3 }}>
            {locale?.specsTitle || t('pdp.specsTitle')}
          </Typography>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, overflow: 'hidden', maxWidth: 760 }}>
            {specs.map((row, index) => (
              <Stack
                key={row.label}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.25, sm: 2 }}
                sx={{ px: { xs: 2.5, sm: 3 }, py: 1.75, borderTop: index ? `1px solid ${brand.border}` : 'none' }}
              >
                <Typography sx={{ fontWeight: 700, color: brand.textSecondary, fontSize: '0.9rem', minWidth: { sm: 220 } }}>{row.label}</Typography>
                <Typography sx={{ fontWeight: 600, color: brand.graphite, fontSize: '0.95rem' }}>{row.value}</Typography>
              </Stack>
            ))}
          </Box>
        </SectionContainer>
      )}

      {related.length > 0 && (
        <SectionContainer bgcolor={brand.white} py={{ xs: 6, sm: 7, md: 8 }}>
          <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 3 }}>
            {t('accessoriesPage.relatedTitle')}
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {related.map((rel, index) => (
              <Grid key={rel.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Reveal delay={(index % 4) * 0.06}>
                  <ProductCard layout="grid" to={`/accessories/${rel.id}`} product={toProductCardData(rel, t)} />
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </SectionContainer>
      )}
    </main>
  )
}
