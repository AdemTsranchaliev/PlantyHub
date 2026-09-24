import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined'
import AutorenewOutlined from '@mui/icons-material/AutorenewOutlined'
import SpaOutlined from '@mui/icons-material/SpaOutlined'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import EnergySavingsLeafOutlined from '@mui/icons-material/EnergySavingsLeafOutlined'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import CardGiftcardRounded from '@mui/icons-material/CardGiftcardRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { productSpecRows } from '../data/catalog'
import { lifestyleImages, productVideo, productVideoPoster, stockImages } from '../data/images'
import { useProduct } from '../hooks/useProducts'
import { useSiteAssetsStore } from '../hooks/useSiteAssets'
import { useAddProductToCart } from '../hooks/useCart'
import { brand } from '../theme'
import { toMediaUrl } from '../media/cfImage'
import MediaImg from '../components/MediaImg'

const trustItems = [
  { key: 'shipping', Icon: LocalShippingOutlined },
  { key: 'guarantee', Icon: VerifiedOutlined },
  { key: 'returns', Icon: AutorenewOutlined },
] as const
const inTheBoxKeys = ['garden', 'led', 'pods', 'nutrients', 'manual'] as const
const featureItems = [
  { key: 'easy', Icon: SpaOutlined },
  { key: 'fast', Icon: TrendingUpRounded },
  { key: 'smart', Icon: AutoAwesomeOutlined },
  { key: 'natural', Icon: EnergySavingsLeafOutlined },
] as const

const bonusKitIds = ['basil', 'mint', 'parsley', 'arugula'] as const
const BONUS_KIT_PRICE = '€19.99'

export default function ProductPage() {
  const { t, i18n } = useTranslation()
  const garden = useProduct('gardens', 'homegarder-one')
  const addProductToCart = useAddProductToCart()
  const { images } = useSiteAssetsStore()
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [bonusPod, setBonusPod] = useState<string | null>(null)
  const faqCategories = t('faqPage.categories', { returnObjects: true }) as { items?: { q: string; a: string }[] }[]
  const fallbackFaq = Array.isArray(faqCategories) ? faqCategories.flatMap((category) => category.items ?? []) : []

  const gallery = garden?.gallery?.length
    ? garden.gallery
    : [
        images['pdp.gallery.homeGarden'] || lifestyleImages.homeGardenProduct,
        images['pdp.gallery.kitchenBasil'] || lifestyleImages.kitchenBasil,
        images['pdp.gallery.basilCloseup'] || lifestyleImages.basilCloseup,
        images['pdp.gallery.mintKitchen'] || lifestyleImages.mintKitchen,
        images['pdp.gallery.heroKitchen'] || lifestyleImages.heroKitchen,
      ]
  const videoSrc = garden?.videoUrl || productVideo
  const videoPoster = garden?.videoPoster || productVideoPoster
  const lang = (i18n.language?.split('-')[0] ?? 'en') as 'en' | 'bg' | 'de' | 'fr'
  const locale = garden?.locales[lang] ?? garden?.locales.en
  const specRows = locale?.specs?.length
    ? locale.specs
    : productSpecRows.map((row) => ({ label: t(`product.specs.${row.key}`), value: t(`product.specs.${row.valueKey}`) }))
  const productTitle = locale?.name?.trim() || t('product.title')
  const productDescription = locale?.description?.trim() || t('product.description')
  const highlightsTitle = locale?.highlightsTitle || t('pdp.highlightsTitle')
  const highlightsSubtitle = locale?.highlightsSubtitle || t('pdp.highlightsSubtitle')
  const howTitle = locale?.howTitle || t('pdp.howItWorksTitle')
  const boxTitle = locale?.boxTitle || t('pdp.inTheBox')
  const specsTitle = locale?.specsTitle || t('pdp.specsTitle')
  const faqTitle = locale?.faqTitle || t('faqPage.title')
  const features = locale?.features?.length
    ? locale.features
    : featureItems.map(({ key }) => ({ title: t(`pdp.features.${key}.title`), text: t(`pdp.features.${key}.text`) }))
  const steps = locale?.steps?.length ? locale.steps : (t('pdp.steps', { returnObjects: true }) as string[])
  const boxItems = locale?.inTheBox?.length
    ? locale.inTheBox
    : inTheBoxKeys.map((key) => t(`pdp.inTheBoxItems.${key}`))
  const faqItems = locale?.faq?.length ? locale.faq : fallbackFaq

  const bonusKits = bonusKitIds.map((id) => ({
    id,
    image: images[`pdp.bonus.${id}`] || stockImages[id],
  }))

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <SectionContainer py={{ xs: 3, sm: 4, md: 5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {productTitle}
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 4, md: 6, lg: 8 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal
              sx={{
                p: { xs: 1, sm: 1.25 },
                borderRadius: '28px',
                border: `1.5px solid ${brand.plantGreen}`,
                boxShadow: brand.shadowHover,
                bgcolor: brand.white,
              }}
            >
              <MediaImg
                src={gallery[active]}
                preset="gallery"
                alt={productTitle}
                decoding="async"
                fetchPriority="high"
                sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', borderRadius: '20px' }}
              />
            </Reveal>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              {gallery.map((src, i) => (
                <Box
                  key={`${src}-${i}`}
                  component="button"
                  onClick={() => setActive(i)}
                  aria-label={`${productTitle} ${i + 1}`}
                  sx={{
                    flex: '0 0 auto',
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
                  <MediaImg src={src} preset="thumb" alt="" loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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

              <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.5 }}>
                {productTitle}
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 2 }}>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '2.4rem', color: brand.plantGreenDark, lineHeight: 1 }}>
                  {garden?.price}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: brand.plantGreenDark }}>
                  {t('pdp.inStock')}
                </Typography>
              </Stack>

              <Typography sx={{ color: brand.textSecondary, lineHeight: 1.75, fontSize: '1.05rem', mb: 3.5 }}>
                {productDescription}
              </Typography>

              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.graphite, mb: 1 }}>
                {t('pdp.color')}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: brand.white,
                    border: `2px solid ${brand.plantGreen}`,
                    boxShadow: brand.shadow,
                  }}
                />
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: brand.textSecondary }}>
                  {t('common.colorWhite')}
                </Typography>
              </Stack>

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
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ px: 4 }}
                  onClick={() => {
                    if (!garden) return
                    const gift = bonusPod
                      ? {
                          id: bonusPod,
                          name: t(`pdp.bonus.kits.${bonusPod}`),
                          image: bonusKits.find((kit) => kit.id === bonusPod)?.image ?? stockImages[bonusPod],
                          compareAt: BONUS_KIT_PRICE,
                        }
                      : undefined
                    addProductToCart('gardens', garden, qty, gift)
                  }}
                >
                  {t('product.cta')}
                </Button>
              </Stack>

              <Box
                sx={{
                  mb: 3.5,
                  p: 1.5,
                  borderRadius: '14px',
                  border: `1.5px dashed ${brand.plantGreen}`,
                  bgcolor: brand.plantGreenMuted,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.25 }}>
                  <CardGiftcardRounded sx={{ fontSize: 20, color: brand.plantGreenDark, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: brand.plantGreenDark, lineHeight: 1.35 }}>
                    {t('pdp.bonus.hint')}
                  </Typography>
                </Stack>
                <Grid container spacing={0.75}>
                  {bonusKits.map((kit) => {
                    const selected = bonusPod === kit.id
                    return (
                      <Grid key={kit.id} size={{ xs: 12, sm: 6 }}>
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setBonusPod((prev) => (prev === kit.id ? null : kit.id))}
                          aria-pressed={selected}
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.85,
                            textAlign: 'left',
                            p: { xs: 1, sm: 0.65 },
                            pr: 0.85,
                            minHeight: { xs: 48, sm: 'auto' },
                            borderRadius: '12px',
                            bgcolor: brand.white,
                            cursor: 'pointer',
                            border: selected ? `2px solid ${brand.plantGreen}` : `1px solid ${brand.border}`,
                            boxShadow: selected ? brand.shadowGreen : 'none',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          <MediaImg
                            src={kit.image}
                            preset="thumb"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            sx={{ flexShrink: 0, width: { xs: 44, sm: 40 }, height: { xs: 44, sm: 40 }, borderRadius: '9px', objectFit: 'contain', bgcolor: brand.surface, display: 'block' }}
                          />
                          <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.72rem' }, color: brand.graphite, lineHeight: 1.25 }}>
                            {t(`pdp.bonus.kits.${kit.id}`)}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
                {bonusPod && (
                  <Typography sx={{ mt: 1, fontSize: '0.75rem', fontWeight: 700, color: brand.plantGreenDark }}>
                    {t('pdp.bonus.chosen', { pod: t(`pdp.bonus.kits.${bonusPod}`) })}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: { xs: 1.5, sm: 2.5 }, pt: 3, borderTop: `1px solid ${brand.border}` }}>
                {trustItems.map(({ key, Icon }) => (
                  <Stack key={key} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Icon sx={{ fontSize: 20, color: brand.plantGreen }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: brand.graphite }}>
                      {t(`product.trust.${key}`)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 8 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Reveal sx={{ maxWidth: 340, mx: 'auto' }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: `4px solid ${brand.white}`,
                  boxShadow: brand.shadowHover,
                  bgcolor: brand.graphite,
                }}
              >
                <Box
                  component="video"
                  src={toMediaUrl(videoSrc)}
                  poster={toMediaUrl(videoPoster)}
                  controls
                  playsInline
                  preload="none"
                  sx={{ width: '100%', aspectRatio: '9 / 16', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </Reveal>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: brand.plantGreenMuted,
                  color: brand.plantGreenDark,
                  borderRadius: 999,
                  pl: 0.75,
                  pr: 1.5,
                  py: 0.5,
                  mb: 2,
                }}
              >
                <PlayArrowRounded sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{locale?.videoBadge || t('pdp.videoBadge')}</Typography>
              </Stack>
              <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>
                {locale?.videoTitle || t('pdp.videoTitle')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem', lineHeight: 1.75, mb: 3, maxWidth: 480 }}>
                {locale?.videoText || t('pdp.videoText')}
              </Typography>
              <Stack spacing={1.5}>
                {specRows.slice(0, 3).map((row) => (
                  <Stack key={row.label} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <CheckCircleRounded sx={{ color: brand.plantGreen, fontSize: 20 }} />
                    <Typography sx={{ color: brand.graphite, fontWeight: 600, fontSize: '0.95rem' }}>
                      {row.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 6, sm: 7, md: 8 }}>
        <Reveal sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 4, md: 6 } }}>
          <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>
            {highlightsTitle}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem' }}>
            {highlightsSubtitle}
          </Typography>
        </Reveal>

        <Reveal>
          <Grid container sx={{ mb: { xs: 5, md: 7 } }}>
            {features.map((feature, i) => {
              const Icon = featureItems[i % featureItems.length].Icon
              return (
              <Grid
                key={`${feature.title}-${i}`}
                size={{ xs: 12, sm: 6, md: 3 }}
                sx={{
                  textAlign: 'center',
                  px: { xs: 1.5, md: 3 },
                  py: { xs: 2.25, sm: 2, md: 0 },
                  borderRight: { md: i < features.length - 1 && (i + 1) % 4 !== 0 ? `1px solid ${brand.border}` : 'none' },
                  borderBottom: {
                    xs: i < features.length - 1 ? `1px solid ${brand.border}` : 'none',
                    sm: i < features.length - (features.length % 2 || 2) ? `1px solid ${brand.border}` : 'none',
                    md: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: `1.5px solid ${brand.plantGreen}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.75,
                  }}
                >
                  <Icon sx={{ color: brand.plantGreen, fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: brand.plantGreenDark, mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {feature.text}
                </Typography>
              </Grid>
              )
            })}
          </Grid>
        </Reveal>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal
              sx={{
                height: '100%',
                borderRadius: '24px',
                border: `1.5px solid ${brand.plantGreen}`,
                p: { xs: 3, sm: 4 },
              }}
            >
              <Typography component="h3" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.4rem', color: brand.graphite, mb: 2.5 }}>
                {howTitle}
              </Typography>
              <Stack spacing={2.25}>
                {steps.map((step, i) => (
                  <Stack key={i} direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        bgcolor: brand.plantGreenDark,
                        color: brand.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography sx={{ color: brand.graphite, fontSize: '1rem' }}>{step}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Reveal
              sx={{
                height: '100%',
                borderRadius: '24px',
                border: `1.5px solid ${brand.plantGreen}`,
                p: { xs: 3, sm: 4 },
              }}
            >
              <Typography component="h3" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.4rem', color: brand.graphite, mb: 2.5 }}>
                {boxTitle}
              </Typography>
              <Stack spacing={1.75}>
                {boxItems.map((item, i) => (
                  <Stack key={`${item}-${i}`} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
                    <Typography sx={{ color: brand.graphite, fontSize: '1rem' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 8 }}>
        <Grid container spacing={{ xs: 5, md: 7 }} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography component="h2" variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, color: brand.graphite, mb: 3 }}>
              {specsTitle}
            </Typography>
            <Box sx={{ borderRadius: '20px', border: `1px solid ${brand.creamBorder}`, overflow: 'hidden', bgcolor: brand.white }}>
              {specRows.map((row, i) => (
                <Stack
                  key={`${row.label}-${i}`}
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 1.75 },
                    gap: { xs: 0.35, sm: 2 },
                    bgcolor: i % 2 === 0 ? brand.white : brand.surface,
                    borderBottom: i < specRows.length - 1 ? `1px solid ${brand.border}` : 'none',
                  }}
                >
                  <Typography sx={{ flex: { sm: '0 0 42%' }, fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: brand.graphite }}>
                    {row.label}
                  </Typography>
                  <Typography sx={{ flex: 1, fontSize: { xs: '0.88rem', sm: '0.9rem' }, color: brand.textSecondary, lineHeight: 1.45 }}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', border: `1.5px solid ${brand.plantGreen}`, bgcolor: brand.white }}>
              <Typography component="h2" variant="h3" sx={{ fontSize: '1.4rem', color: brand.graphite, mb: 1 }}>
                {productTitle}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.plantGreen }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: brand.plantGreenDark }}>
                  {t('pdp.inStock')}
                </Typography>
              </Stack>
              <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '2.2rem', color: brand.plantGreenDark, lineHeight: 1, mb: 2.5 }}>
                {garden?.price}
              </Typography>
              <Button variant="contained" size="large" fullWidth sx={{ mb: 2.5 }}>
                {t('product.cta')}
              </Button>
              <Stack spacing={1.25}>
                {trustItems.map(({ key, Icon }) => (
                  <Stack key={key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Icon sx={{ fontSize: 18, color: brand.plantGreen }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: brand.graphite }}>
                      {t(`product.trust.${key}`)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 6, sm: 7, md: 8 }}>
        <Reveal sx={{ maxWidth: 820, mx: 'auto' }}>
          <Typography component="h2" variant="h2" sx={{ textAlign: 'center', color: brand.graphite, mb: { xs: 4, md: 5 } }}>
            {faqTitle}
          </Typography>
          <Box>
            {faqItems.map((item, i) => (
              <Accordion
                key={i}
                disableGutters
                elevation={0}
                sx={{
                  mb: 1.5,
                  bgcolor: brand.surface,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '16px !important',
                  overflow: 'hidden',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{ color: brand.plantGreen }} />}
                  sx={{ px: { xs: 2, sm: 3 }, py: 0.5 }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: brand.graphite }}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 0 }}>
                  <Typography sx={{ color: brand.textSecondary, lineHeight: 1.7 }}>{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Reveal>
      </SectionContainer>
    </main>
  )
}
