import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import { navHrefs } from '../data/catalog'
import { lifestyleImages, productVideo, productVideoPoster } from '../data/images'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const sectionIds = ['start', 'grow', 'harvest'] as const
type SectionId = (typeof sectionIds)[number]

const topicIds = ['basics', 'setup', 'light', 'pods', 'harvest', 'care'] as const
type TopicId = (typeof topicIds)[number]

const sectionTopics: Record<SectionId, TopicId[]> = {
  start: ['basics', 'setup'],
  grow: ['light', 'pods'],
  harvest: ['harvest', 'care'],
}

const topicImages: Record<TopicId, [string, string]> = {
  basics: [lifestyleImages.basilCloseup, lifestyleImages.kitchenBasil],
  setup: [lifestyleImages.homeGardenProduct, lifestyleImages.heroKitchen],
  light: [lifestyleImages.heroKitchen, lifestyleImages.basilCloseup],
  pods: [lifestyleImages.kitchenBasil, lifestyleImages.mintCloseup],
  harvest: [lifestyleImages.kitchenCaprese, lifestyleImages.mintKitchen],
  care: [lifestyleImages.mintKitchen, lifestyleImages.outdoorHerbs],
}

const topicsWithVideo = new Set<TopicId>(['basics', 'setup', 'light'])

type TopicContent = {
  title: string
  duration: string
  summary: string
  lead: string
  steps: string[]
  tip: string
  videoLabel?: string
  galleryLabel?: string
}

type SectionContent = {
  title: string
  description: string
  topicsLabel: string
}

type LearnPageContent = {
  title: string
  eyebrow: string
  lead: string
  pickSection: string
  backToSections: string
  backToTopics: string
  openTopic: string
  tipLabel: string
  stepsLabel: string
  sections: Record<SectionId, SectionContent>
  topics: Record<TopicId, TopicContent>
  ctaTitle: string
  ctaText: string
  ctaFaq: string
  ctaContact: string
  ctaBuy: string
}

const crumbBtnSx = {
  color: brand.textSecondary,
  fontSize: { xs: '0.78rem', sm: '0.85rem' },
  fontWeight: 600,
  border: 0,
  background: 'none',
  cursor: 'pointer',
  p: 0,
  fontFamily: 'inherit',
  WebkitTapHighlightColor: 'transparent',
} as const

const choiceBtnSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: { xs: 112, sm: 0 },
  textAlign: 'center',
  border: `1px solid ${brand.border}`,
  borderRadius: { xs: '14px', sm: '18px' },
  bgcolor: brand.white,
  cursor: 'pointer',
  px: { xs: 2, sm: 2.5 },
  py: { xs: 2, sm: 2.5 },
  font: 'inherit',
  color: 'inherit',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
  '&:focus-visible': {
    outline: `2px solid ${brand.plantGreen}`,
    outlineOffset: 2,
  },
  '&:active': {
    bgcolor: brand.plantGreenMuted,
    borderColor: brand.plantGreen,
  },
  '@media (hover: hover)': {
    '&:hover': {
      borderColor: brand.plantGreen,
      bgcolor: brand.plantGreenMuted,
      boxShadow: brand.shadow,
    },
  },
} as const

const labelSx = {
  fontSize: { xs: '0.68rem', sm: '0.72rem' },
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: brand.textSecondary,
  textAlign: 'center',
} as const

function isSectionId(value: string | null): value is SectionId {
  return !!value && (sectionIds as readonly string[]).includes(value)
}

function isTopicId(value: string | null): value is TopicId {
  return !!value && (topicIds as readonly string[]).includes(value)
}

function LessonVideo({
  src,
  poster,
  label,
  playLabel,
  pauseLabel,
}: {
  src: string
  poster: string
  label: string
  playLabel: string
  pauseLabel: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const pendingPlay = useRef(false)

  useEffect(() => {
    if (!activated || !pendingPlay.current) return
    const el = videoRef.current
    if (!el) return
    pendingPlay.current = false
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [activated])

  const toggle = () => {
    const el = videoRef.current
    if (!el) return
    if (!activated) {
      pendingPlay.current = true
      setActivated(true)
      return
    }
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      return
    }
    el.pause()
    setPlaying(false)
  }

  return (
    <Box sx={{ mb: { xs: 2, sm: 2.25 } }}>
      <Typography sx={{ ...labelSx, mb: 0.85 }}>{label}</Typography>
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: '12px', sm: '16px', md: '20px' },
          overflow: 'hidden',
          bgcolor: brand.graphite,
          aspectRatio: { xs: '16 / 11', sm: '16 / 10' },
        }}
      >
        <Box
          component="video"
          ref={videoRef}
          src={activated ? src : undefined}
          poster={poster}
          preload="none"
          muted
          playsInline
          loop
          onClick={toggle}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
        />
        <IconButton
          onClick={toggle}
          aria-label={playing ? pauseLabel : playLabel}
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 52, sm: 56 },
            height: { xs: 52, sm: 56 },
            bgcolor: 'rgba(255,255,255,0.95)',
            color: brand.graphite,
            boxShadow: brand.shadow,
            WebkitTapHighlightColor: 'transparent',
            '&:hover': { bgcolor: brand.white },
          }}
        >
          {playing ? <PauseRounded /> : <PlayArrowRounded sx={{ fontSize: { xs: 28, sm: 32 } }} />}
        </IconButton>
      </Box>
    </Box>
  )
}

export default function LearnPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const content = t('learnPage', { returnObjects: true }) as LearnPageContent

  const sectionParam = params.get('section')
  const topicParam = params.get('topic')
  const sectionId = isSectionId(sectionParam) ? sectionParam : null
  const topicId = isTopicId(topicParam) && sectionId && sectionTopics[sectionId].includes(topicParam) ? topicParam : null
  const view: 'hub' | 'section' | 'topic' = topicId ? 'topic' : sectionId ? 'section' : 'hub'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view, sectionId, topicId])

  useEffect(() => {
    if (!sectionId) return
    const first = sectionTopics[sectionId][0]
    if (!first) return
    const img = new Image()
    img.src = topicImages[first][0]
  }, [sectionId])

  const navigate = (next: Record<string, string>) => {
    startTransition(() => setParams(next))
  }

  const goHub = () => navigate({})
  const goSection = (id: SectionId) => navigate({ section: id })
  const goTopic = (section: SectionId, topic: TopicId) => navigate({ section, topic })

  const section = sectionId ? content.sections?.[sectionId] : null
  const topic = topicId ? content.topics?.[topicId] : null
  const topicsInSection = sectionId ? sectionTopics[sectionId] : []

  const nextTopicId = useMemo(() => {
    if (!sectionId || !topicId) return null
    const list = sectionTopics[sectionId]
    const idx = list.indexOf(topicId)
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null
  }, [sectionId, topicId])

  const nextTopic = nextTopicId ? content.topics?.[nextTopicId] : null

  const mobileBack =
    view === 'topic'
      ? { label: content.backToTopics, onClick: () => sectionId && goSection(sectionId) }
      : view === 'section'
        ? { label: content.backToSections, onClick: goHub }
        : null

  return (
    <main>
      <SectionContainer
        bgcolor={brand.surface}
        py={view === 'hub' ? { xs: 2.5, sm: 4, md: 5 } : { xs: 1.5, sm: 2.25, md: 2.75 }}
      >
        {/* Mobile: single back control — avoids long wrapping crumbs */}
        {mobileBack && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mb: 1.25 }}>
            <Button
              startIcon={<ArrowBackRounded />}
              onClick={mobileBack.onClick}
              sx={{
                color: brand.plantGreenDark,
                minHeight: 44,
                px: 1.75,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {mobileBack.label}
            </Button>
          </Box>
        )}

        {/* Desktop / tablet breadcrumb */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            display: { xs: view === 'hub' ? 'flex' : 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            mb: view === 'hub' ? { xs: 1.5, sm: 2 } : 1.25,
            flexWrap: 'wrap',
            rowGap: 0.25,
            px: 0.5,
          }}
        >
          <Link component={RouterLink} to="/" underline="hover" sx={crumbBtnSx}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          {view === 'hub' ? (
            <Typography sx={{ color: brand.graphite, fontSize: { xs: '0.78rem', sm: '0.85rem' }, fontWeight: 700 }}>
              {content.title}
            </Typography>
          ) : (
            <Link component="button" type="button" onClick={goHub} underline="hover" sx={crumbBtnSx}>
              {content.title}
            </Link>
          )}
          {section && (
            <>
              <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
              {view === 'topic' ? (
                <Link component="button" type="button" onClick={() => sectionId && goSection(sectionId)} underline="hover" sx={crumbBtnSx}>
                  {section.title}
                </Link>
              ) : (
                <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{section.title}</Typography>
              )}
            </>
          )}
          {topic && view === 'topic' && (
            <>
              <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
              <Typography
                sx={{
                  color: brand.graphite,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {topic.title}
              </Typography>
            </>
          )}
        </Stack>

        {view === 'hub' && (
          <Box sx={{ maxWidth: 920, mx: 'auto', textAlign: 'center' }}>
            <Typography
              sx={{
                display: 'inline-block',
                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: brand.plantGreen,
                bgcolor: brand.plantGreenMuted,
                borderRadius: 999,
                px: 1.35,
                py: 0.5,
                mb: { xs: 1.15, sm: 1.5 },
              }}
            >
              {content.eyebrow}
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.35rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: brand.graphite,
                mb: { xs: 0.75, sm: 1 },
                px: 0.5,
              }}
            >
              {content.title}
            </Typography>
            <Typography
              sx={{
                color: brand.textSecondary,
                fontSize: { xs: '0.92rem', sm: '1rem' },
                lineHeight: 1.55,
                mx: 'auto',
                maxWidth: 480,
                mb: { xs: 2.25, sm: 3 },
                px: 0.5,
              }}
            >
              {content.lead}
            </Typography>

            <Typography sx={{ ...labelSx, mb: { xs: 1.35, sm: 1.75 } }}>{content.pickSection}</Typography>
            <Stack spacing={1.15} sx={{ display: { xs: 'flex', sm: 'none' } }}>
              {sectionIds.map((id, index) => {
                const item = content.sections?.[id]
                if (!item) return null
                const count = sectionTopics[id].length
                return (
                  <Box key={id} component="button" type="button" onClick={() => goSection(id)} sx={{ ...choiceBtnSx, py: 1.85 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: brand.plantGreen, mb: 0.5 }}>
                      {String(index + 1).padStart(2, '0')} · {t('learnPage.topicsCount', { count })}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontWeight: 600,
                        fontSize: '1.15rem',
                        color: brand.graphite,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        mb: 0.45,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: brand.textSecondary, fontSize: '0.86rem', lineHeight: 1.45, mb: 0.85 }}>
                      {item.description}
                    </Typography>
                    <Typography
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.4,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: brand.plantGreenDark,
                      }}
                    >
                      {t('learnPage.topicsCount', { count })} <ArrowForwardRounded sx={{ fontSize: 16 }} />
                    </Typography>
                  </Box>
                )
              })}
            </Stack>

            <Grid container spacing={2} sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}>
              {sectionIds.map((id, index) => {
                const item = content.sections?.[id]
                if (!item) return null
                const count = sectionTopics[id].length
                return (
                  <Grid key={id} size={{ sm: 6, md: 4 }} sx={{ display: 'flex' }}>
                    <Box component="button" type="button" onClick={() => goSection(id)} sx={choiceBtnSx}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: brand.plantGreen, mb: 1 }}>
                        {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 600,
                          fontSize: { sm: '1.2rem', md: '1.3rem' },
                          color: brand.graphite,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.2,
                          mb: 0.75,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', lineHeight: 1.5, mb: 1.5, maxWidth: 240 }}>
                        {item.description}
                      </Typography>
                      <Typography
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: brand.plantGreenDark,
                          mt: 'auto',
                        }}
                      >
                        {t('learnPage.topicsCount', { count })} <ArrowForwardRounded sx={{ fontSize: 16 }} />
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}

        {view === 'section' && section && (
          <Box sx={{ maxWidth: 520, mx: 'auto', textAlign: 'center' }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: { xs: '1.5rem', sm: '1.65rem', md: '1.9rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.12,
                color: brand.graphite,
                mb: 0.45,
              }}
            >
              {section.title}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.88rem', sm: '0.92rem' }, lineHeight: 1.5, mb: { xs: 1.75, sm: 2 } }}>
              {section.description}
            </Typography>

            <Stack spacing={1}>
              {topicsInSection.map((id, index) => {
                const item = content.topics?.[id]
                if (!item) return null
                return (
                  <Box
                    key={id}
                    component="button"
                    type="button"
                    onClick={() => goTopic(sectionId!, id)}
                    sx={{ ...choiceBtnSx, py: { xs: 1.6, sm: 1.75 }, borderRadius: '14px' }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.4 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: brand.plantGreen }}>
                        {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: brand.textSecondary }}>{item.duration}</Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontWeight: 600,
                        fontSize: { xs: '1.05rem', sm: '1.1rem' },
                        color: brand.graphite,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        mb: 0.3,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.84rem', sm: '0.88rem' }, lineHeight: 1.45, mb: 0.7, maxWidth: 380 }}>
                      {item.summary}
                    </Typography>
                    <Typography
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.4,
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: brand.plantGreenDark,
                      }}
                    >
                      {content.openTopic} <ArrowForwardRounded sx={{ fontSize: 16 }} />
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>
        )}

        {view === 'topic' && topic && section && topicId && sectionId && (
          <Box sx={{ maxWidth: 680, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 1.75 } }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.35rem', sm: '1.45rem', md: '1.7rem' },
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: brand.graphite,
                  mb: 0.3,
                  px: 0.5,
                }}
              >
                {topic.title}
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: brand.plantGreenDark, mb: 0.45 }}>
                {topic.duration}
              </Typography>
              <Typography
                sx={{
                  color: brand.textSecondary,
                  fontSize: { xs: '0.86rem', sm: '0.9rem' },
                  lineHeight: 1.5,
                  mx: 'auto',
                  maxWidth: 460,
                  px: 0.5,
                }}
              >
                {topic.lead}
              </Typography>
            </Box>

            {topicsWithVideo.has(topicId) && (
              <LessonVideo
                src={productVideo}
                poster={productVideoPoster}
                label={topic.videoLabel || t('learnPage.videoLabel')}
                playLabel={t('learnPage.playVideo')}
                pauseLabel={t('learnPage.pauseVideo')}
              />
            )}

            <Typography sx={{ ...labelSx, mb: 0.85 }}>{topic.galleryLabel || t('learnPage.galleryLabel')}</Typography>
            <Grid container spacing={{ xs: 1, sm: 1.15 }} sx={{ mb: { xs: 2.15, sm: 2.5 } }}>
              {topicImages[topicId].map((src, i) => (
                <Grid key={src} size={{ xs: 6 }}>
                    <MediaImg
                      src={src}
                      preset="gallery"
                      alt=""
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    sx={{
                      width: '100%',
                      height: { xs: 100, sm: 140, md: 150 },
                      objectFit: 'cover',
                      borderRadius: { xs: '10px', sm: '12px' },
                      display: 'block',
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Typography sx={{ ...labelSx, mb: 1 }}>{content.stepsLabel}</Typography>
            <Stack component="ol" spacing={0.95} sx={{ m: 0, pl: 0, listStyle: 'none', mb: { xs: 1.75, sm: 2 } }}>
              {(topic.steps ?? []).map((step, stepIndex) => (
                <Box key={`${topicId}-${stepIndex}`} component="li" sx={{ display: 'flex', gap: 1.1, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: { xs: 22, sm: 24 },
                      height: { xs: 22, sm: 24 },
                      borderRadius: '7px',
                      bgcolor: brand.plantGreenMuted,
                      color: brand.plantGreenDark,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      mt: 0.1,
                    }}
                  >
                    {stepIndex + 1}
                  </Box>
                  <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.88rem', sm: '0.93rem' }, lineHeight: 1.55 }}>
                    {step}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Box
              sx={{
                bgcolor: brand.plantGreenMuted,
                borderRadius: '12px',
                px: { xs: 1.5, sm: 1.85 },
                py: { xs: 1.15, sm: 1.25 },
                borderLeft: `3px solid ${brand.plantGreen}`,
                mb: { xs: 2, sm: 2.25 },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: brand.plantGreenDark,
                  mb: 0.25,
                }}
              >
                {content.tipLabel}
              </Typography>
              <Typography sx={{ color: brand.graphite, fontSize: { xs: '0.86rem', sm: '0.88rem' }, lineHeight: 1.5 }}>{topic.tip}</Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignItems: 'stretch', justifyContent: 'center', pb: { xs: 1, sm: 0 } }}
            >
              <Button
                variant="outlined"
                size="medium"
                fullWidth
                startIcon={<ArrowBackRounded />}
                onClick={() => goSection(sectionId)}
                sx={{ minHeight: 44, maxWidth: { sm: 220 } }}
              >
                {content.backToTopics}
              </Button>
              {nextTopicId && nextTopic && (
                <Button
                  variant="contained"
                  size="medium"
                  fullWidth
                  endIcon={<ArrowForwardRounded />}
                  onClick={() => goTopic(sectionId, nextTopicId)}
                  sx={{ minHeight: 44, maxWidth: { sm: 220 } }}
                >
                  {t('learnPage.nextTopic')}
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </SectionContainer>

      {view === 'hub' && (
        <Box
          component="section"
          sx={{
            background: brand.gradientCta,
            color: brand.white,
            py: { xs: 3.5, sm: 4.5, md: 5.5 },
            pb: { xs: 'max(28px, env(safe-area-inset-bottom))', sm: 4.5, md: 5.5 },
          }}
        >
          <Box sx={{ maxWidth: 480, mx: 'auto', px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: { xs: '1.3rem', md: '1.65rem' },
                mb: 0.85,
              }}
            >
              {content.ctaTitle}
            </Typography>
            <Typography sx={{ opacity: 0.9, lineHeight: 1.55, mb: 2, fontSize: { xs: '0.88rem', sm: '0.92rem' } }}>
              {content.ctaText}
            </Typography>
            <Stack spacing={1} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                component={RouterLink}
                to={navHrefs.faq}
                sx={{
                  minHeight: 44,
                  bgcolor: brand.white,
                  color: brand.graphite,
                  '&:hover': { bgcolor: brand.beige },
                }}
              >
                {content.ctaFaq}
              </Button>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to={navHrefs.contact}
                  sx={{
                    minHeight: 44,
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: brand.white,
                    '&:hover': { borderColor: brand.white, bgcolor: brand.white, color: brand.graphite },
                  }}
                >
                  {content.ctaContact}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to={navHrefs.buy}
                  sx={{
                    minHeight: 44,
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: brand.white,
                    '&:hover': { borderColor: brand.white, bgcolor: brand.white, color: brand.graphite },
                  }}
                >
                  {content.ctaBuy}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}
    </main>
  )
}
