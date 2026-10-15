import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import MediaImg from '../components/MediaImg'
import { navHrefs } from '../data/catalog'
import { lifestyleImages, productImages, productVideo, productVideoPoster } from '../data/images'
import { useProduct } from '../hooks/useProducts'
import { toMediaUrl } from '../media/cfImage'
import { brand } from '../theme'
import stepWater from '../assets/start/water.jpg'
import stepNutrients from '../assets/start/nutrients.jpg'
import stepPods from '../assets/start/pods.jpg'
import stepLamp from '../assets/start/lamp.jpg'
import stepDome from '../assets/start/dome.jpg'
import stepHarvest from '../assets/start/harvest.jpg'

const serif = '"Fraunces", Georgia, serif'
const stepImages = [stepWater, stepNutrients, stepPods, stepLamp, stepDome, stepHarvest]
const plantImages = [
  productImages.arugula,
  productImages.basil,
  productImages.mint,
  productImages.cilantro,
  productImages.dill,
  productImages.parsley,
]

type Fact = { value: string; label: string }
type Copy = { title: string; text: string }
type Stage = { when: string; title: string; text: string }
type Plant = { name: string; sprout: string; harvest: string }
type WaterGroup = { title: string; hint: string; text: string }

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

const kickerSx = {
  fontSize: '0.72rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: brand.plantGreenDark,
} as const

export default function HowPage() {
  const { t } = useTranslation()
  const garden = useProduct('gardens', 'homegarder-one')
  const videoSrc = toMediaUrl(garden?.videoUrl || productVideo)
  const videoPoster = toMediaUrl(garden?.videoPoster || productVideoPoster)
  const facts = asList<Fact>(t('howPage.facts', { returnObjects: true }))
  const systems = asList<Copy>(t('howPage.systems', { returnObjects: true }))
  const steps = asList<Copy>(t('howPage.steps', { returnObjects: true }))
  const stages = asList<Stage>(t('howPage.stages', { returnObjects: true }))
  const plants = asList<Plant>(t('howPage.plants', { returnObjects: true }))
  const waterGroups = asList<WaterGroup>(t('howPage.waterGroups', { returnObjects: true }))
  const rhythm = asList<Copy>(t('howPage.rhythm', { returnObjects: true }))
  const gardenJobs = asList<string>(t('howPage.garden', { returnObjects: true }))
  const yourJobs = asList<string>(t('howPage.you', { returnObjects: true }))
  const [active, setActive] = useState(0)
  const step = steps[active]
  const figureRef = useRef<HTMLDivElement>(null)

  const selectStep = (index: number) => {
    setActive(index)
    const figure = figureRef.current
    if (!figure || window.innerWidth >= 900) return
    if (figure.getBoundingClientRect().bottom < 72) {
      figure.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 2.5, sm: 4, md: 6 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 2, md: 3 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{t('nav.howItWorks')}</Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)' },
            gap: { xs: 2.5, md: 6 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...kickerSx, mb: 1.25 }}>{t('howPage.eyebrow')}</Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: { xs: '2.15rem', sm: '2.8rem', md: '3.35rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: brand.graphite,
                mb: 1.5,
                maxWidth: 640,
              }}
            >
              {t('howPage.title')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '1.02rem', md: '1.12rem' }, lineHeight: 1.6, maxWidth: 560, mb: 2.5 }}>
              {t('howPage.lead')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mb: 2.75 }}>
              <Button component={RouterLink} to={navHrefs.buy} variant="contained" size="large" endIcon={<ArrowForwardRounded />} sx={{ minHeight: 48 }}>
                {t('howPage.buy')}
              </Button>
              <Button component={RouterLink} to={navHrefs.start} variant="outlined" size="large" sx={{ minHeight: 48 }}>
                {t('howPage.guide')}
              </Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
              {facts.map((fact) => (
                <Box key={fact.label} sx={{ bgcolor: brand.white, borderRadius: '16px', px: 1.25, py: 1.1, border: `1px solid ${brand.border}` }}>
                  <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.15rem', color: brand.graphite, lineHeight: 1.1 }}>{fact.value}</Typography>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.75rem', lineHeight: 1.3, mt: 0.4 }}>{fact.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <MediaImg
            src={lifestyleImages.homeGardenProduct}
            preset="gallery"
            alt={t('howPage.imageAlt')}
            sx={{
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              aspectRatio: { xs: '4 / 3', md: '1 / 1' },
              objectFit: 'contain',
              bgcolor: brand.white,
              borderRadius: { xs: '22px', md: '28px' },
              border: `1px solid ${brand.border}`,
              boxShadow: brand.shadow,
            }}
          />
        </Box>
      </SectionContainer>

      <SectionContainer py={{ xs: 4, sm: 5, md: 7 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
            gap: { xs: 2.5, md: 6 },
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              order: { xs: 2, md: 1 },
              width: '100%',
              maxWidth: 300,
              mx: { xs: 'auto', md: 0 },
              borderRadius: '28px',
              overflow: 'hidden',
              bgcolor: brand.graphite,
              boxShadow: brand.shadowHover,
            }}
          >
            <Box
              component="video"
              src={videoSrc}
              poster={videoPoster}
              controls
              playsInline
              preload="metadata"
              aria-label={t('howPage.videoTitle')}
              sx={{ width: '100%', aspectRatio: '9 / 16', objectFit: 'cover', display: 'block', bgcolor: brand.graphite }}
            />
          </Box>
          <Box sx={{ order: { xs: 1, md: 2 }, minWidth: 0 }}>
            <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.videoLabel')}</Typography>
            <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, lineHeight: 1.15, mb: 1.25, maxWidth: 520 }}>
              {t('howPage.videoTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.6, maxWidth: 480 }}>
              {t('howPage.videoText')}
            </Typography>
          </Box>
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.surface} py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.systemEyebrow')}</Typography>
        <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, maxWidth: 560, mb: 1 }}>
          {t('howPage.systemTitle')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, maxWidth: 520, lineHeight: 1.55, mb: { xs: 2.5, md: 3.5 } }}>{t('howPage.systemLead')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 1.25, md: 2 } }}>
          {systems.map((item, index) => (
            <Box key={item.title} sx={{ bgcolor: brand.surface, borderRadius: '22px', p: { xs: 2, md: 2.5 }, borderTop: `3px solid ${brand.plantGreen}` }}>
              <Typography sx={{ fontFamily: serif, fontWeight: 600, color: brand.plantGreen, fontSize: '1.35rem', lineHeight: 1, mb: 1.25 }}>
                0{index + 1}
              </Typography>
              <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.25rem', color: brand.graphite, mb: 0.75 }}>{item.title}</Typography>
              <Typography sx={{ color: brand.textSecondary, lineHeight: 1.55, fontSize: '0.95rem' }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.stepsEyebrow')}</Typography>
        <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, maxWidth: 640, mb: 1 }}>
          {t('howPage.stepsTitle')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, maxWidth: 540, lineHeight: 1.55, mb: { xs: 2.5, md: 3.5 } }}>{t('howPage.stepsLead')}</Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(280px, 0.95fr)' },
            gap: { xs: 1.5, md: 3 },
            alignItems: 'center',
          }}
        >
          <Box
            ref={figureRef}
            sx={{
              minWidth: 0,
              position: { md: 'sticky' },
              top: { md: 96 },
              alignSelf: 'start',
              bgcolor: '#F7F4EE',
              borderRadius: { xs: '22px', md: '28px' },
              overflow: 'hidden',
              border: `1px solid ${brand.creamBorder}`,
            }}
          >
            <MediaImg
              src={stepImages[active] ?? stepWater}
              alt={step?.title ?? ''}
              preset="gallery"
              sx={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'contain', display: 'block' }}
            />
          </Box>
          <Stack component="ol" spacing={0.75} sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {steps.map((item, index) => {
              const selected = index === active
              return (
                <Box component="li" key={item.title}>
                  <Box
                    component="button"
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectStep(index)}
                    sx={{
                      width: '100%',
                      textAlign: 'left',
                      font: 'inherit',
                      color: 'inherit',
                      cursor: 'pointer',
                      border: 0,
                      borderRadius: '16px',
                      px: 1.5,
                      py: selected ? 1.35 : 1,
                      minHeight: 48,
                      bgcolor: selected ? brand.white : 'transparent',
                      boxShadow: selected ? brand.shadow : 'none',
                      WebkitTapHighlightColor: 'transparent',
                      '&:focus-visible': { outline: `2px solid ${brand.plantGreen}`, outlineOffset: 2 },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 800, color: selected ? brand.plantGreenDark : brand.textSecondary, fontSize: '0.85rem', mt: 0.2, width: 22, flexShrink: 0 }}>
                        {index + 1}
                      </Typography>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '1rem', lineHeight: 1.3 }}>{item.title}</Typography>
                        <Typography sx={{ color: brand.textSecondary, fontSize: selected ? '0.92rem' : '0.84rem', lineHeight: 1.45, mt: 0.35 }}>{item.text}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </SectionContainer>

      <SectionContainer py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.waterEyebrow')}</Typography>
        <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, maxWidth: 640, mb: 1 }}>
          {t('howPage.waterTitle')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, maxWidth: 560, lineHeight: 1.55, mb: { xs: 2.5, md: 3.5 } }}>{t('howPage.waterLead')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {waterGroups.map((group, index) => {
            const tone = index === 2 ? '#9C3D32' : index === 1 ? '#A86B45' : brand.plantGreenDark
            return (
              <Box key={group.title} sx={{ borderRadius: '22px', border: `1px solid ${brand.border}`, p: { xs: 2, md: 2.25 }, borderTop: `3px solid ${tone}` }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: tone, mb: 0.6 }}>{group.hint}</Typography>
                <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.25rem', color: brand.graphite, mb: 0.75 }}>{group.title}</Typography>
                <Typography sx={{ color: brand.textSecondary, lineHeight: 1.55, fontSize: '0.95rem' }}>{group.text}</Typography>
              </Box>
            )
          })}
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.growEyebrow')}</Typography>
        <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, maxWidth: 640, mb: 1 }}>
          {t('howPage.growTitle')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, maxWidth: 560, lineHeight: 1.55, mb: { xs: 2.5, md: 3.5 } }}>{t('howPage.growLead')}</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5, mb: { xs: 3, md: 4 } }}>
          {stages.map((stage, index) => (
            <Box key={stage.title} sx={{ borderTop: `2px solid ${brand.plantGreen}`, pt: 1.5 }}>
              <Typography sx={{ ...kickerSx, mb: 0.6 }}>
                0{index + 1} · {stage.when}
              </Typography>
              <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.25rem', color: brand.graphite, mb: 0.5 }}>{stage.title}</Typography>
              <Typography sx={{ color: brand.textSecondary, lineHeight: 1.5, fontSize: '0.95rem' }}>{stage.text}</Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 1.25 }}>{t('howPage.plantsTitle')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 1 }}>
          {plants.map((plant, index) => (
            <Stack key={plant.name} direction="row" spacing={1.25} sx={{ alignItems: 'center', bgcolor: brand.white, borderRadius: '16px', px: 1.25, py: 1 }}>
              <MediaImg
                src={plantImages[index] ?? productImages.basil}
                preset="thumb"
                alt=""
                sx={{ width: 52, height: 52, objectFit: 'contain', bgcolor: brand.white, borderRadius: '12px', flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, color: brand.graphite, lineHeight: 1.2 }}>{plant.name}</Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', lineHeight: 1.35, mt: 0.25 }}>
                  {t('howPage.sprout')}: {plant.sprout}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', lineHeight: 1.35 }}>
                  {t('howPage.harvest')}: {plant.harvest}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
        <Box sx={{ mt: 1.5, borderRadius: '16px', bgcolor: brand.white, px: { xs: 1.5, sm: 2 }, py: 1.5, borderLeft: `3px solid ${brand.plantGreen}` }}>
          <Typography sx={{ color: brand.graphite, lineHeight: 1.55, fontSize: '0.95rem' }}>{t('howPage.harvestNote')}</Typography>
        </Box>
      </SectionContainer>

      <SectionContainer py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.rhythmEyebrow')}</Typography>
        <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, maxWidth: 640, mb: { xs: 2.5, md: 3.5 } }}>
          {t('howPage.rhythmTitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {rhythm.map((item) => (
            <Box key={item.title} sx={{ borderRadius: '20px', border: `1px solid ${brand.border}`, p: { xs: 1.75, md: 2.25 } }}>
              <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 0.5 }}>{item.title}</Typography>
              <Typography sx={{ color: brand.textSecondary, lineHeight: 1.55, fontSize: '0.95rem' }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.surface} py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('howPage.rolesEyebrow')}</Typography>
        <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, mb: { xs: 2.5, md: 3.5 }, maxWidth: 560 }}>
          {t('howPage.rolesTitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
          <RoleCard title={t('howPage.gardenTitle')} items={gardenJobs} tone="green" />
          <RoleCard title={t('howPage.youTitle')} items={yourJobs} tone="peach" />
        </Box>
      </SectionContainer>

      <Box component="section" sx={{ background: brand.gradientCta, color: brand.white, py: { xs: 4, sm: 5, md: 6 } }}>
        <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.15rem' }, mb: 1 }}>
            {t('howPage.ctaTitle')}
          </Typography>
          <Typography sx={{ opacity: 0.92, lineHeight: 1.6, mb: 2.5 }}>{t('howPage.ctaText')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to={navHrefs.buy}
              variant="contained"
              size="large"
              sx={{ minHeight: 48, bgcolor: brand.white, color: brand.graphite, '&:hover': { bgcolor: brand.beige } }}
            >
              {t('howPage.ctaBuy')}
            </Button>
            <Button
              component={RouterLink}
              to={navHrefs.start}
              variant="outlined"
              size="large"
              sx={{
                minHeight: 48,
                borderColor: 'rgba(255,255,255,0.55)',
                color: brand.white,
                '&:hover': { borderColor: brand.white, bgcolor: brand.white, color: brand.graphite },
              }}
            >
              {t('howPage.ctaGuide')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </main>
  )
}

function RoleCard({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'peach' }) {
  const accent = tone === 'green' ? brand.plantGreenDark : '#A86B45'
  return (
    <Box sx={{ bgcolor: brand.white, borderRadius: '22px', p: { xs: 2, md: 2.5 }, border: `1px solid ${brand.border}` }}>
      <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.35rem', color: accent, mb: 1.5 }}>{title}</Typography>
      <Stack component="ul" spacing={1.1} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
        {items.map((item) => (
          <Box component="li" key={item} sx={{ display: 'flex', gap: 1.1, alignItems: 'flex-start' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent, mt: 0.7, flexShrink: 0 }} />
            <Typography sx={{ color: brand.graphite, lineHeight: 1.45 }}>{item}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
