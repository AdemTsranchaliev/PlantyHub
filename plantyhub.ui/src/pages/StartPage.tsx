import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AirOutlined from '@mui/icons-material/AirOutlined'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import AutorenewRounded from '@mui/icons-material/AutorenewRounded'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import CheckRounded from '@mui/icons-material/CheckRounded'
import CleaningServicesOutlined from '@mui/icons-material/CleaningServicesOutlined'
import CloseRounded from '@mui/icons-material/CloseRounded'
import ContentCutOutlined from '@mui/icons-material/ContentCutOutlined'
import DeviceThermostatOutlined from '@mui/icons-material/DeviceThermostatOutlined'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import FormatListNumberedRounded from '@mui/icons-material/FormatListNumberedRounded'
import GrassOutlined from '@mui/icons-material/GrassOutlined'
import HealthAndSafetyOutlined from '@mui/icons-material/HealthAndSafetyOutlined'
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded'
import HeightOutlined from '@mui/icons-material/HeightOutlined'
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import OpacityOutlined from '@mui/icons-material/OpacityOutlined'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import PlayCircleOutlineRounded from '@mui/icons-material/PlayCircleOutlineRounded'
import SchoolOutlined from '@mui/icons-material/SchoolOutlined'
import ScienceOutlined from '@mui/icons-material/ScienceOutlined'
import SpaOutlined from '@mui/icons-material/SpaOutlined'
import ThermostatOutlined from '@mui/icons-material/ThermostatOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import WaterDropOutlined from '@mui/icons-material/WaterDropOutlined'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'
import YardOutlined from '@mui/icons-material/YardOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import SectionContainer, { pagePaddingX } from '../components/SectionContainer'
import MediaImg from '../components/MediaImg'
import { useTrackQrSource } from '../measure/commerce'
import { navHrefs } from '../data/catalog'
import { lifestyleImages, productImages, productVideo, productVideoPoster } from '../data/images'
import stepWater from '../assets/start/water.jpg'
import stepNutrients from '../assets/start/nutrients.jpg'
import stepPods from '../assets/start/pods.jpg'
import stepLamp from '../assets/start/lamp.jpg'
import stepDome from '../assets/start/dome.jpg'
import stepHarvest from '../assets/start/harvest.jpg'
import { useProduct } from '../hooks/useProducts'
import { toMediaUrl } from '../media/cfImage'
import { brand } from '../theme'

const plantIds = ['basil', 'mint', 'parsley', 'cilantro', 'dill', 'arugula'] as const

const stepImages = [stepWater, stepNutrients, stepPods, stepLamp, stepDome, stepHarvest]
const prepIcons: SvgIconComponent[] = [ThermostatOutlined, ScienceOutlined, WaterDropOutlined]
const waterCareIcons: SvgIconComponent[] = [
  OpacityOutlined,
  AirOutlined,
  SpaOutlined,
  CleaningServicesOutlined,
  YardOutlined,
  DeviceThermostatOutlined,
]
const stageIcons: SvgIconComponent[] = [GrassOutlined, ContentCutOutlined, YardOutlined]
const harvestImages = [productImages.basil, productImages.parsley, productImages.lettuce, productImages.arugula]
const faqIcons: SvgIconComponent[] = [
  GrassOutlined,
  HeightOutlined,
  SpaOutlined,
  DeviceThermostatOutlined,
  AirOutlined,
  WbSunnyOutlined,
  VolumeUpOutlined,
]
const waterChoiceIcons: SvgIconComponent[] = [CheckCircleOutlined, WaterDropOutlined, BlockOutlined]
const factIcons: SvgIconComponent[] = [ThermostatOutlined, AutorenewRounded, LightModeOutlined, HeightOutlined]
const careIcons: SvgIconComponent[] = [OpacityOutlined, CleaningServicesOutlined, LightbulbOutlined, HealthAndSafetyOutlined]
const navIcons: SvgIconComponent[] = [
  FormatListNumberedRounded,
  PlayCircleOutlineRounded,
  ScienceOutlined,
  WaterDropOutlined,
  HealthAndSafetyOutlined,
  YardOutlined,
  ContentCutOutlined,
  HelpOutlineRounded,
]

type GuideStep = { title: string; text: string; tip?: string }
type DoseRow = { label: string; mix: string; cap: string; water: string }
type Fact = { value: string; label: string }
type CareItem = { title: string; text: string }
type FaqItem = { q: string; a: string }
type Stage = { when: string; title: string; text: string }
type HarvestRow = { name: string; how: string; why: string }
type ExtraId = 'doses' | 'care' | 'plants'

const extraIds: ExtraId[] = ['doses', 'care', 'plants']
const extraIcons: Record<ExtraId, SvgIconComponent> = {
  doses: ScienceOutlined,
  care: HealthAndSafetyOutlined,
  plants: YardOutlined,
}

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

const SUPPORT_EMAIL = 'support@plantyhub.com'

const underHeader = { xs: 64, sm: 80, md: 96 } as const
const underNav = { xs: 188, sm: 136, md: 156 } as const

const sectionTitleSx = {
  fontFamily: '"Fraunces", Georgia, serif',
  fontWeight: 600,
  fontSize: { xs: '1.35rem', sm: '1.55rem' },
  color: brand.graphite,
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
} as const

const quietBtn = {
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
} as const

const sheetSx = {
  bgcolor: brand.white,
  border: `1px solid ${brand.border}`,
  borderRadius: '24px',
  overflow: 'hidden',
} as const

const chapters = {
  steps: { bg: '#E5F2EA', accent: brand.plantGreenDark },
  water: { bg: '#E4F3F4', accent: '#1C6B74' },
  after: { bg: brand.peachSoft, accent: '#A86B45' },
  more: { bg: '#F1F2EC', accent: brand.plantGreen },
  faq: { bg: '#F8F1EF', accent: '#9C3D32' },
} as const

function chapterSx(kind: keyof typeof chapters) {
  const tone = chapters[kind]
  return {
    scrollMarginTop: underNav,
    bgcolor: tone.bg,
    borderRadius: '28px',
    borderTop: `4px solid ${tone.accent}`,
    px: { xs: 1.5, sm: 2.5 },
    py: { xs: 2.25, sm: 2.75 },
    mb: 1.75,
  }
}

function ChapterKicker({ kind, children }: { kind: keyof typeof chapters; children: string }) {
  const color = chapters[kind].accent
  return (
    <Typography
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color,
        mb: 0.8,
      }}
    >
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      {children}
    </Typography>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: brand.plantGreenDark,
        color: brand.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '0.85rem',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
      }}
    >
      {n}
    </Box>
  )
}

const iconTones = {
  green: { bg: '#E5F2EA', fg: brand.plantGreenDark },
  peach: { bg: '#F8EFE6', fg: '#A86B45' },
  red: { bg: '#F8EBE8', fg: '#9C3D32' },
} as const

function IconMark({
  icon: Icon,
  tone = 'green',
  n,
  size = 44,
}: {
  icon: SvgIconComponent
  tone?: keyof typeof iconTones
  n?: number
  size?: number
}) {
  const palette = iconTones[tone]
  return (
    <Box aria-hidden sx={{ position: 'relative', width: size, height: size, flexShrink: 0, zIndex: 1 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: size >= 40 ? '14px' : '12px',
          bgcolor: palette.bg,
          color: palette.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: Math.round(size * 0.5) }} />
      </Box>
      {n != null ? (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            left: -6,
            minWidth: 20,
            height: 20,
            px: 0.4,
            borderRadius: 999,
            bgcolor: brand.plantGreenDark,
            color: brand.white,
            fontSize: '0.68rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 0 2px ${brand.white}`,
          }}
        >
          {n}
        </Box>
      ) : null}
    </Box>
  )
}

const stepCellSx = {
  display: 'grid',
  gridTemplateColumns: '44px minmax(0, 1fr)',
  gap: 1.5,
  alignItems: 'start',
  px: { xs: 1.75, sm: 2.25 },
  py: { xs: 1.6, sm: 2 },
  borderTop: `1px solid ${brand.border}`,
  '&:nth-of-type(1)': { borderTop: 'none' },
} as const

function StartVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  useEffect(() => {
    if (failed) return
    const el = videoRef.current
    if (!el) return
    if (el.error) {
      setFailed(true)
      return
    }
    const onError = () => setFailed(true)
    el.addEventListener('error', onError)
    return () => el.removeEventListener('error', onError)
  }, [src, failed])

  if (failed) {
    return (
      <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
        <Box sx={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '18px', overflow: 'hidden', bgcolor: brand.graphite }}>
          <MediaImg src={poster} preset="card" alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 42%, rgba(28,35,30,0.82) 100%)' }} />
          <Typography sx={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: brand.white, fontSize: '0.9rem', lineHeight: 1.45 }}>
            {t('startPage.videoMissing')}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      component="video"
      ref={videoRef}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      aria-label={label}
      sx={{
        width: '100%',
        maxWidth: 280,
        mx: 'auto',
        aspectRatio: '9 / 16',
        objectFit: 'cover',
        display: 'block',
        bgcolor: brand.graphite,
        borderRadius: '22px',
        boxShadow: brand.shadowHover,
      }}
    />
  )
}

export default function StartPage() {
  const { t } = useTranslation()
  useTrackQrSource()
  const garden = useProduct('gardens', 'homegarder-one')
  const steps = asList<GuideStep>(t('startPage.steps', { returnObjects: true }))
  const doses = asList<DoseRow>(t('startPage.doses', { returnObjects: true }))
  const facts = asList<Fact>(t('startPage.facts', { returnObjects: true }))
  const careItems = asList<CareItem>(t('startPage.careItems', { returnObjects: true }))
  const faqs = asList<FaqItem>(t('startPage.faqs', { returnObjects: true }))
  const waterBest = asList<string>(t('startPage.waterBest', { returnObjects: true }))
  const waterNo = asList<string>(t('startPage.waterNo', { returnObjects: true }))
  const waterPrep = asList<string>(t('startPage.waterPrep', { returnObjects: true }))
  const waterCare = asList<CareItem>(t('startPage.waterCare', { returnObjects: true }))
  const stages = asList<Stage>(t('startPage.stages', { returnObjects: true }))
  const harvestRows = asList<HarvestRow>(t('startPage.harvestRows', { returnObjects: true }))
  const claimSteps = asList<string>(t('startPage.claimSteps', { returnObjects: true }))
  const videoSrc = toMediaUrl(garden?.videoUrl || productVideo)
  const videoPoster = toMediaUrl(garden?.videoPoster || productVideoPoster)
  const [videoOpen, setVideoOpen] = useState(false)
  const [extra, setExtra] = useState<ExtraId | null>(null)
  const [activeId, setActiveId] = useState('start-steps')
  const pendingScroll = useRef<string | null>(null)

  const nav = [
    { id: 'start-steps', label: t('startPage.nav.steps') },
    { id: 'start-video', label: t('startPage.nav.video') },
    { id: 'start-doses', label: t('startPage.nav.doses') },
    { id: 'start-water', label: t('startPage.nav.water') },
    { id: 'start-care', label: t('startPage.nav.care') },
    { id: 'start-plants', label: t('startPage.nav.plants') },
    { id: 'start-after', label: t('startPage.nav.after') },
    { id: 'start-faq', label: t('startPage.nav.faq') },
  ]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const ids = ['start-steps', 'start-water', 'start-after', 'start-more', 'start-faq']
    const onScroll = () => {
      const line = window.innerWidth < 600 ? 200 : 150
      let current = 'start-steps'
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
        if (top <= line) current = id
      }
      setActiveId((prev) => (prev === current ? prev : current))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = pendingScroll.current
    if (!id) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      pendingScroll.current = null
    })
    return () => cancelAnimationFrame(frame)
  }, [videoOpen, extra])

  const scrollToId = (id: string) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const openSection = (id: string) => {
    if (id === 'start-video') {
      if (videoOpen) scrollToId(id)
      else {
        pendingScroll.current = id
        setVideoOpen(true)
      }
      return
    }
    const extraId = extraIds.find((key) => id === `start-${key}`)
    if (extraId) {
      if (extra === extraId) scrollToId(id)
      else {
        pendingScroll.current = id
        setExtra(extraId)
      }
      return
    }
    scrollToId(id)
  }

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 2, sm: 3, md: 4 }}>
          <Box
            sx={{
              background: brand.gradientHero,
              border: `1px solid ${brand.creamBorder}`,
              borderRadius: '28px',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5, md: 3 },
              mb: 1.5,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 220px' },
              gap: { xs: 0, md: 4 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: brand.plantGreen,
                  bgcolor: brand.white,
                  borderRadius: 999,
                  px: 1.25,
                  py: 0.4,
                  mb: 1,
                }}
              >
                {t('startPage.eyebrow')}
              </Typography>
              <Typography component="h1" variant="h2" sx={{ color: brand.graphite, fontSize: { xs: '1.7rem', sm: '2.35rem', md: '2.75rem' }, lineHeight: 1.08, mb: 1 }}>
                {t('startPage.title')}
              </Typography>
              <Typography sx={{ color: brand.graphite, fontSize: { xs: '1rem', sm: '1.05rem' }, lineHeight: 1.5, mb: 1.75 }}>
                {t('startPage.lead')}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
                {facts.map((fact, index) => {
                  const FactIcon = factIcons[index] ?? SpaOutlined
                  return (
                    <Stack key={fact.label} direction="row" spacing={1} sx={{ alignItems: 'center', bgcolor: 'rgba(255,255,255,0.82)', borderRadius: '14px', px: 1.1, py: 0.9 }}>
                      <IconMark icon={FactIcon} size={32} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '0.9rem', lineHeight: 1.15 }}>{fact.value}</Typography>
                        <Typography sx={{ color: brand.textSecondary, fontSize: '0.72rem', lineHeight: 1.25, mt: 0.2 }}>{fact.label}</Typography>
                      </Box>
                    </Stack>
                  )
                })}
              </Box>
            </Box>
            <MediaImg
              src={lifestyleImages.homeGardenProduct}
              preset="card"
              alt=""
              sx={{
                display: { xs: 'none', md: 'block' },
                width: '100%',
                height: 200,
                borderRadius: '24px',
                objectFit: 'contain',
                bgcolor: brand.white,
                boxShadow: brand.shadow,
              }}
            />
          </Box>

          <Box id="start-video" sx={{ scrollMarginTop: underHeader, mb: 2 }}>
            <Collapse in={!videoOpen} unmountOnExit>
              <Box
                component="button"
                type="button"
                onClick={() => setVideoOpen(true)}
                aria-expanded={false}
                sx={{
                  ...quietBtn,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'left',
                  bgcolor: brand.white,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '22px',
                  p: 1,
                  boxShadow: brand.shadow,
                  '&:hover': { borderColor: brand.plantGreen },
                  '&:focus-visible': { outline: `2px solid ${brand.plantGreen}`, outlineOffset: 2 },
                }}
              >
                <Box sx={{ position: 'relative', width: 72, height: 96, borderRadius: '16px', overflow: 'hidden', flexShrink: 0, bgcolor: brand.graphite }}>
                  <MediaImg src={videoPoster} preset="thumb" alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(28, 35, 30, 0.22)' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: brand.white, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: brand.shadowHover }}>
                      <PlayArrowRounded sx={{ color: brand.plantGreenDark, fontSize: 22, ml: '2px' }} />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
                  <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '1.02rem', lineHeight: 1.25 }}>{t('startPage.videoLabel')}</Typography>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', lineHeight: 1.4, mt: 0.35 }}>{t('startPage.videoCaption')}</Typography>
                  <Typography sx={{ color: brand.plantGreenDark, fontWeight: 800, fontSize: '0.88rem', mt: 0.7 }}>{t('startPage.watchVideo')}</Typography>
                </Box>
              </Box>
            </Collapse>
            <Collapse in={videoOpen} unmountOnExit>
              <Box sx={{ bgcolor: brand.white, border: `1px solid ${brand.border}`, borderRadius: '24px', px: { xs: 1.5, sm: 2.5 }, py: 2, boxShadow: brand.shadow }}>
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                  <Box>
                    <Typography component="h2" sx={{ ...sectionTitleSx, fontSize: '1.25rem', mb: 0.35 }}>{t('startPage.videoLabel')}</Typography>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', lineHeight: 1.4 }}>{t('startPage.videoCaption')}</Typography>
                  </Box>
                  <Button
                    onClick={() => setVideoOpen(false)}
                    sx={{ flexShrink: 0, fontWeight: 800, color: brand.textSecondary, minWidth: 0 }}
                  >
                    {t('startPage.hideVideo')}
                  </Button>
                </Stack>
                <StartVideo src={videoSrc} poster={videoPoster} label={t('startPage.videoLabel')} />
              </Box>
            </Collapse>
          </Box>

          <Box
            component="nav"
            aria-label={t('startPage.nav.label')}
            sx={{
              position: 'sticky',
              top: { xs: 52, sm: 61, md: 84 },
              zIndex: 4,
              display: { xs: 'grid', sm: 'flex' },
              gridTemplateColumns: { xs: 'repeat(4, minmax(0, 1fr))' },
              flexWrap: 'nowrap',
              gap: { xs: 0.75, sm: 1 },
              overflowX: { xs: 'visible', sm: 'auto' },
              mx: { xs: 'calc(-1 * max(16px, env(safe-area-inset-left)))', sm: -3, md: -4 },
              px: pagePaddingX,
              py: 1,
              mb: 1.5,
              bgcolor: brand.surface,
              borderBottom: `1px solid ${brand.border}`,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {nav.map((item, index) => {
              const NavIcon = navIcons[index] ?? SpaOutlined
              const extraOn = extraIds.some((key) => item.id === `start-${key}` && extra === key)
              const selected = extraOn || (item.id === 'start-video' && videoOpen) || item.id === activeId
              return (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => openSection(item.id)}
                  aria-current={selected ? 'true' : undefined}
                  sx={{
                    ...quietBtn,
                    flexShrink: 0,
                    display: 'inline-flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 0.2, sm: 0.75 },
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: 0,
                    bgcolor: selected ? brand.plantGreenDark : brand.white,
                    border: `1px solid ${selected ? brand.plantGreenDark : brand.border}`,
                    color: selected ? brand.white : brand.graphite,
                    fontWeight: 800,
                    fontSize: { xs: '0.68rem', sm: '0.88rem' },
                    lineHeight: 1.1,
                    textAlign: 'center',
                    borderRadius: { xs: '14px', sm: 999 },
                    px: { xs: 0.25, sm: 1.35 },
                    py: { xs: 0.55, sm: 0.7 },
                    minHeight: { xs: 52, sm: 40 },
                    '&:hover': selected ? {} : { borderColor: brand.plantGreen, color: brand.plantGreenDark },
                    '&:focus-visible': { outline: `2px solid ${brand.plantGreen}`, outlineOffset: 2 },
                  }}
                >
                  <NavIcon sx={{ fontSize: 18 }} />
                  {item.label}
                </Box>
              )
            })}
          </Box>

          <Box id="start-steps" sx={chapterSx('steps')}>
            <ChapterKicker kind="steps">{t('startPage.nav.steps')}</ChapterKicker>
            <Typography component="h2" sx={sectionTitleSx}>{t('startPage.stepsTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.75 }}>
              {t('startPage.stepsLead')}
            </Typography>
            <Box
              component="ol"
              sx={{
                ...sheetSx,
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              }}
            >
              {steps.map((step, index) => {
                return (
                  <Box
                    key={step.title}
                    component="li"
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'stretch',
                      minWidth: 0,
                      borderTop: `1px solid ${brand.border}`,
                      borderLeft: { lg: '1px solid' },
                      borderLeftColor: { lg: brand.border },
                      '&:nth-of-type(1)': { borderTop: 'none' },
                      '&:nth-of-type(odd)': { borderLeft: 'none' },
                      '&:nth-of-type(2)': { borderTop: { lg: 'none' } },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        flexShrink: 0,
                        width: { xs: '100%', sm: 168 },
                        height: 126,
                        alignSelf: 'center',
                        bgcolor: '#F7F4EE',
                        lineHeight: 0,
                      }}
                    >
                      <MediaImg
                        src={stepImages[index] ?? stepWater}
                        alt=""
                        preset="card"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />
                      <Box
                        aria-hidden
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: brand.plantGreenDark,
                          color: brand.white,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          boxShadow: `0 0 0 3px ${brand.white}`,
                        }}
                      >
                        {index + 1}
                      </Box>
                    </Box>
                    <Box sx={{ minWidth: 0, px: { xs: 1.75, sm: 2.25 }, py: { xs: 1.6, sm: 2 } }}>
                      <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1.05rem', color: brand.graphite, lineHeight: 1.25, mb: 0.55 }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{ color: brand.graphite, fontSize: '0.98rem', lineHeight: 1.55 }}>{step.text}</Typography>
                      {step.tip ? (
                        <Box
                          component="details"
                          sx={{
                            mt: 0.5,
                            '& summary': {
                              cursor: 'pointer',
                              listStyle: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.3,
                              color: brand.plantGreenDark,
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              minHeight: 32,
                            },
                            '& summary::-webkit-details-marker': { display: 'none' },
                          }}
                        >
                          <Box component="summary">
                            <LightbulbOutlined sx={{ fontSize: 16 }} />
                            {t('startPage.tipLabel')}
                            <ExpandMoreRounded sx={{ fontSize: 18 }} />
                          </Box>
                          <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', lineHeight: 1.5, mt: 0.25 }}>{step.tip}</Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>

          <Box id="start-water" sx={chapterSx('water')}>
            <ChapterKicker kind="water">{t('startPage.nav.water')}</ChapterKicker>
            <Typography component="h2" sx={sectionTitleSx}>{t('startPage.waterTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.75 }}>
              {t('startPage.waterLead')}
            </Typography>
            <Box sx={{ ...sheetSx, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.95fr 1fr' }, mb: 1.5 }}>
              {([
                { label: t('startPage.waterBestLabel'), hint: t('startPage.waterBestHint'), tone: 'green' as const, color: brand.plantGreenDark, items: waterBest, mark: CheckRounded },
                { label: t('startPage.waterOkLabel'), hint: t('startPage.waterOkHint'), tone: 'peach' as const, color: '#A86B45', items: null, mark: null },
                { label: t('startPage.waterNoLabel'), hint: t('startPage.waterNoHint'), tone: 'red' as const, color: '#9C3D32', items: waterNo, mark: CloseRounded },
              ]).map((choice, index) => {
                const ChoiceIcon = waterChoiceIcons[index] ?? WaterDropOutlined
                const MarkIcon = choice.mark
                return (
                <Box
                  key={choice.label}
                  sx={{
                    px: { xs: 1.75, sm: 2.25 },
                    py: 2,
                    borderTop: { xs: index ? `1px solid ${brand.border}` : 'none', md: 'none' },
                    borderLeft: { md: index ? `1px solid ${brand.border}` : 'none' },
                  }}
                >
                  <IconMark icon={ChoiceIcon} tone={choice.tone} />
                  <Typography sx={{ color: choice.color, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', mt: 1.25, mb: 0.35 }}>
                    {choice.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 1.25 }}>{choice.hint}</Typography>
                  {choice.items && MarkIcon ? (
                    <Stack spacing={1}>
                      {choice.items.map((item) => (
                        <Stack key={item} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                          <MarkIcon sx={{ fontSize: 18, color: choice.color, mt: '3px', flexShrink: 0 }} />
                          <Typography sx={{ color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.5 }}>{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.55 }}>{t('startPage.waterOk')}</Typography>
                  )}
                </Box>
                )
              })}
            </Box>
            <Box sx={{ ...sheetSx, mb: 2.5 }}>
              <Typography sx={{ fontWeight: 800, color: brand.graphite, px: { xs: 1.75, sm: 2.25 }, pt: 2 }}>{t('startPage.waterPrepTitle')}</Typography>
              <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, mt: 1.5, borderTop: `1px solid ${brand.border}` }}>
                {waterPrep.map((item, index) => {
                  const PrepIcon = prepIcons[index] ?? WaterDropOutlined
                  return (
                  <Box key={item} component="li" sx={stepCellSx}>
                    <IconMark icon={PrepIcon} n={index + 1} />
                    <Typography sx={{ color: brand.graphite, fontSize: '0.98rem', lineHeight: 1.55, pt: 0.55 }}>{item}</Typography>
                  </Box>
                  )
                })}
              </Box>
            </Box>
            <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1.15rem', color: brand.graphite, mb: 0.4 }}>{t('startPage.waterCareTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.5 }}>
              {t('startPage.waterCareLead')}
            </Typography>
            <Box component="ol" sx={{ ...sheetSx, listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
              {waterCare.map((item, index) => {
                const CareIcon = waterCareIcons[index] ?? OpacityOutlined
                return (
                <Box
                  key={item.title}
                  component="li"
                  sx={{
                    ...stepCellSx,
                    borderLeft: { lg: '1px solid' },
                    borderLeftColor: { lg: brand.border },
                    '&:nth-of-type(odd)': { borderLeft: 'none' },
                    '&:nth-of-type(2)': { borderTop: { lg: 'none' } },
                  }}
                >
                  <IconMark icon={CareIcon} n={index + 1} />
                  <Box sx={{ minWidth: 0, pt: 0.35 }}>
                    <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 0.35 }}>{item.title}</Typography>
                    <Typography sx={{ color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.5 }}>{item.text}</Typography>
                  </Box>
                </Box>
                )
              })}
            </Box>
          </Box>

          <Box id="start-after" sx={chapterSx('after')}>
            <ChapterKicker kind="after">{t('startPage.nav.after')}</ChapterKicker>
            <Typography component="h2" sx={sectionTitleSx}>{t('startPage.afterTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 2 }}>
              {t('startPage.afterLead')}
            </Typography>
            <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 1.25 }}>{t('startPage.stageTitle')}</Typography>
            <Box sx={{ ...sheetSx, mb: 1.5 }}>
              <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                {stages.map((stage, index) => {
                  const StageIcon = stageIcons[index] ?? GrassOutlined
                  return (
                  <Box
                    key={stage.title}
                    component="li"
                    sx={{
                      px: { xs: 1.75, sm: 2.25 },
                      py: 2,
                      borderTop: { xs: index ? `1px solid ${brand.border}` : 'none', md: 'none' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, position: 'relative', mb: 1.25 }}>
                      <IconMark icon={StageIcon} n={index + 1} />
                      {index < stages.length - 1 ? (
                        <Box
                          aria-hidden
                          sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'absolute',
                            top: 21,
                            left: '50%',
                            width: '100%',
                            height: 2,
                            bgcolor: brand.beigeDark,
                            zIndex: 0,
                          }}
                        />
                      ) : null}
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                      <Typography sx={{ color: brand.plantGreenDark, fontWeight: 800, fontSize: '0.82rem', mb: 0.45 }}>{stage.when}</Typography>
                      <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '1.05rem', mb: 0.4 }}>{stage.title}</Typography>
                      <Typography sx={{ color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.5 }}>{stage.text}</Typography>
                    </Box>
                  </Box>
                  )
                })}
              </Box>
            </Box>
            <Typography sx={{ color: brand.graphite, fontSize: '0.98rem', lineHeight: 1.55, mb: 3 }}>{t('startPage.stageNote')}</Typography>

            <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 1.25 }}>{t('startPage.harvestTitle')}</Typography>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', bgcolor: brand.plantGreenMuted, borderRadius: '16px', px: 1.75, py: 1.35, mb: 1.5 }}>
              <ContentCutOutlined sx={{ color: brand.plantGreenDark, fontSize: 22, mt: 0.15, flexShrink: 0 }} />
              <Typography sx={{ color: brand.plantGreenDark, fontWeight: 700, lineHeight: 1.5 }}>{t('startPage.harvestRule')}</Typography>
            </Stack>
            <Box component="ol" sx={{ ...sheetSx, listStyle: 'none', m: 0, mb: 1.5, p: 0 }}>
              {harvestRows.map((row, index) => (
                <Box key={row.name} component="li" sx={stepCellSx}>
                  <Box sx={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                    <MediaImg src={harvestImages[index] ?? productImages.basil} preset="thumb" alt="" sx={{ width: 44, height: 44, borderRadius: '14px', objectFit: 'contain', bgcolor: brand.beige, display: 'block' }} />
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: brand.plantGreenDark,
                        color: brand.white,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 0 2px ${brand.white}`,
                      }}
                    >
                      {index + 1}
                    </Box>
                  </Box>
                  <Box sx={{ minWidth: 0, pt: 0.35 }}>
                    <Typography sx={{ fontWeight: 800, color: brand.graphite, mb: 0.35 }}>{row.name}</Typography>
                    <Typography sx={{ color: brand.graphite, fontSize: '0.98rem', lineHeight: 1.5 }}>{row.how}</Typography>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.92rem', lineHeight: 1.45, mt: 0.35 }}>{row.why}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Typography sx={{ color: brand.graphite, fontSize: '0.98rem', lineHeight: 1.55 }}>{t('startPage.harvestNote')}</Typography>
          </Box>

          <Box id="start-more" sx={chapterSx('more')}>
            <ChapterKicker kind="more">{t('startPage.nav.more')}</ChapterKicker>
            <Typography component="h2" sx={sectionTitleSx}>{t('startPage.moreTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.5 }}>
              {t('startPage.moreLead')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {extraIds.map((id) => {
                const Icon = extraIcons[id]
                const selected = extra === id
                return (
                  <Box
                    key={id}
                    component="button"
                    type="button"
                    aria-expanded={selected}
                    aria-controls={`start-${id}`}
                    onClick={() => setExtra(selected ? null : id)}
                    sx={{
                      ...quietBtn,
                      minHeight: 72,
                      borderRadius: '16px',
                      border: `1px solid ${selected ? brand.plantGreenDark : brand.border}`,
                      bgcolor: selected ? brand.plantGreenDark : brand.white,
                      color: selected ? brand.white : brand.graphite,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.4,
                      px: 0.75,
                      py: 1,
                      boxShadow: selected ? 'none' : brand.shadow,
                      '&:focus-visible': { outline: `2px solid ${brand.plantGreen}`, outlineOffset: 2 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: selected ? 'rgba(255,255,255,0.16)' : brand.plantGreenMuted,
                        color: selected ? brand.white : brand.plantGreenDark,
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.78rem', sm: '0.88rem' }, lineHeight: 1.2 }}>{t(`startPage.nav.${id}`)}</Typography>
                  </Box>
                )
              })}
            </Box>

            <Collapse in={extra === 'doses'} unmountOnExit>
              <Box id="start-doses" sx={{ scrollMarginTop: underNav, pt: 1.75 }}>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.5 }}>{t('startPage.doseLead')}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mb: 1.5 }}>
                  {doses.map((row, index) => {
                    const change = index === 1
                    return (
                      <Box key={row.label} sx={{ bgcolor: brand.white, border: `1px solid ${brand.border}`, borderRadius: '18px', p: 1.75, borderTop: `4px solid ${change ? '#9C3D32' : brand.plantGreen}` }}>
                        <Box sx={{ mb: 1.25 }}><IconMark icon={change ? AutorenewRounded : ScienceOutlined} tone={change ? 'red' : 'green'} /></Box>
                        <Typography sx={{ fontWeight: 800, color: change ? '#9C3D32' : brand.plantGreenDark, mb: 1 }}>{row.label}</Typography>
                        <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite, lineHeight: 1.15, mb: 0.5 }}>
                          {row.mix}
                        </Typography>
                        <Typography sx={{ color: brand.textSecondary, mb: 1.5 }}>{row.cap}</Typography>
                        <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, fontWeight: 800, bgcolor: brand.beige, borderRadius: 999, px: 1.4, py: 0.55 }}>
                          <WaterDropOutlined sx={{ fontSize: 18 }} />
                          {row.water}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
                <Typography sx={{ color: brand.graphite, fontSize: '0.98rem', lineHeight: 1.55 }}>{t('startPage.doseNote')}</Typography>
              </Box>
            </Collapse>

            <Collapse in={extra === 'care'} unmountOnExit>
              <Box id="start-care" sx={{ scrollMarginTop: underNav, pt: 1.75 }}>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.5 }}>{t('startPage.careLead')}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 1 }}>
                  {careItems.map((item, index) => {
                    const CareIcon = careIcons[index] ?? SpaOutlined
                    return (
                      <Stack key={item.title} direction="row" spacing={1.15} sx={{ alignItems: 'flex-start', bgcolor: brand.white, border: `1px solid ${brand.border}`, borderRadius: '16px', px: 1.4, py: 1.25 }}>
                        <IconMark icon={CareIcon} size={40} />
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.3 }}>{item.title}</Typography>
                          <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', lineHeight: 1.4 }}>{item.text}</Typography>
                        </Box>
                      </Stack>
                    )
                  })}
                </Box>
              </Box>
            </Collapse>

            <Collapse in={extra === 'plants'} unmountOnExit>
              <Box id="start-plants" sx={{ scrollMarginTop: underNav, pt: 1.75 }}>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.5 }}>{t('startPage.plantsLead')}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 1 }}>
                  {plantIds.map((id) => (
                    <Box key={id} sx={{ display: 'flex', gap: 1.25, alignItems: 'center', bgcolor: brand.white, border: `1px solid ${brand.border}`, borderRadius: '16px', p: 1.15 }}>
                      <MediaImg src={productImages[id]} preset="thumb" alt="" sx={{ width: 52, height: 52, borderRadius: '12px', objectFit: 'contain', bgcolor: brand.beige, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: brand.graphite, lineHeight: 1.2 }}>{t(`startPage.plants.${id}.name`)}</Typography>
                        <Typography sx={{ color: brand.textSecondary, fontSize: '0.82rem', lineHeight: 1.35, mt: 0.35 }}>
                          {t('startPage.plantsSprout')} {t(`startPage.plants.${id}.sprout`)}
                        </Typography>
                        <Typography sx={{ color: brand.graphite, fontSize: '0.82rem', lineHeight: 1.35, fontWeight: 700 }}>
                          {t('startPage.plantsHarvest')} {t(`startPage.plants.${id}.harvest`)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Collapse>
          </Box>

          <Box id="start-faq" sx={chapterSx('faq')}>
            <ChapterKicker kind="faq">{t('startPage.nav.faq')}</ChapterKicker>
            <Typography component="h2" sx={sectionTitleSx}>{t('startPage.faqTitle')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.45, mb: 1.5 }}>
              {t('startPage.faqLead')}
            </Typography>
            <Box sx={sheetSx}>
              {faqs.map((item, index) => {
                const FaqIcon = faqIcons[index] ?? HelpOutlineRounded
                return (
                <Box
                  key={item.q}
                  component="details"
                  sx={{
                    px: { xs: 1.75, sm: 2.25 },
                    borderTop: index ? `1px solid ${brand.border}` : 'none',
                    '& summary': {
                      cursor: 'pointer',
                      listStyle: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      minHeight: 64,
                      fontWeight: 800,
                      color: brand.graphite,
                      fontSize: '1rem',
                      lineHeight: 1.35,
                    },
                    '& summary::-webkit-details-marker': { display: 'none' },
                    '&[open] summary > svg': { transform: 'rotate(180deg)' },
                  }}
                >
                  <Box component="summary">
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <IconMark icon={FaqIcon} size={36} />
                      <Box component="span">{item.q}</Box>
                    </Stack>
                    <ExpandMoreRounded sx={{ color: brand.plantGreenDark, flexShrink: 0, transition: 'transform 0.15s ease' }} />
                  </Box>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.98rem', lineHeight: 1.55, pb: 1.75, pl: { xs: 0, sm: 6 }, maxWidth: 760 }}>{item.a}</Typography>
                </Box>
                )
              })}
            </Box>
            <Button
              component={RouterLink}
              to={navHrefs.faq}
              endIcon={<ArrowForwardRounded />}
              sx={{ mt: 1.5, fontWeight: 800, color: brand.plantGreenDark }}
            >
              {t('startPage.faqMore')}
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gap: 1.5 }}>
            <Box sx={{ background: brand.gradientCta, color: brand.white, borderRadius: '24px', px: { xs: 2.5, sm: 3.5 }, py: { xs: 3, sm: 3.5 } }}>
              <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.55rem', mb: 1 }}>{t('startPage.order')}</Typography>
              <Typography sx={{ fontSize: '1.02rem', lineHeight: 1.6, mb: 2, maxWidth: 460, color: 'rgba(255,255,255,0.88)' }}>
                {t('startPage.orderHint')}
              </Typography>
              <Button
                component={RouterLink}
                to={navHrefs.pods}
                variant="contained"
                size="large"
                sx={{ width: { xs: '100%', sm: 'auto' }, bgcolor: brand.white, color: brand.plantGreenDark, px: 3, py: 1.25, '&:hover': { bgcolor: brand.cream } }}
              >
                {t('startPage.order')}
              </Button>
            </Box>
            <Box sx={{ bgcolor: brand.white, border: `1px solid ${brand.border}`, borderRadius: '24px', px: { xs: 2.5, sm: 3.5 }, py: { xs: 2.5, sm: 3 } }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.25 }}>
                <IconMark icon={HealthAndSafetyOutlined} size={40} />
                <Typography component="h2" sx={sectionTitleSx}>{t('startPage.contactTitle')}</Typography>
              </Stack>
              <Typography sx={{ color: brand.graphite, fontSize: '1rem', lineHeight: 1.65, mb: 1.5 }}>{t('startPage.warranty')}</Typography>
              <Box component="ol" sx={{ listStyle: 'none', m: 0, mb: 2, p: 0 }}>
                {claimSteps.map((step, index) => (
                  <Stack key={step} component="li" direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', mb: 1.15 }}>
                    <StepBadge n={index + 1} />
                    <Typography sx={{ color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.5, pt: 0.35 }}>{step}</Typography>
                  </Stack>
                ))}
              </Box>
              <Stack spacing={1}>
                <Link href={`mailto:${SUPPORT_EMAIL}`} underline="hover" sx={{ color: brand.plantGreenDark, fontWeight: 800, fontSize: '1.05rem' }}>
                  {SUPPORT_EMAIL}
                </Link>
                <Link component={RouterLink} to={navHrefs.contact} underline="hover" sx={{ color: brand.graphite, fontWeight: 700 }}>
                  {t('startPage.contactLink')}
                </Link>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              bgcolor: brand.white,
              border: `1px solid ${brand.border}`,
              borderRadius: '20px',
              px: { xs: 2, sm: 2.5 },
              py: 2,
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <IconMark icon={SchoolOutlined} size={40} />
              <Box>
                <Typography sx={{ fontWeight: 800, color: brand.graphite }}>{t('startPage.academyTitle')}</Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.5 }}>{t('startPage.academyText')}</Typography>
              </Box>
            </Stack>
            <Button
              component={RouterLink}
              to={navHrefs.learn}
              variant="outlined"
              endIcon={<ArrowForwardRounded />}
              sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0, fontWeight: 800, borderColor: brand.border, color: brand.plantGreenDark }}
            >
              {t('startPage.academyLink')}
            </Button>
          </Box>

          <Box component="aside" sx={{ mt: 2, px: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9C3D32', mb: 0.4 }}>
              {t('startPage.safetyTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.78rem', lineHeight: 1.45 }}>
              {t('startPage.safetyText')}
            </Typography>
          </Box>
      </SectionContainer>
    </main>
  )
}
