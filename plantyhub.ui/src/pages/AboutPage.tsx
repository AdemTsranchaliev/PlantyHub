import { useCallback, useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer, { pagePaddingX } from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { lifestyleImages, productVideo, productVideoPoster } from '../data/images'
import { useSiteAssetsStore } from '../hooks/useSiteAssets'
import { objectPositionForKey } from '../media/imageFocus'
import { resolveHref } from '../paths'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const pillarKeys = ['easy', 'modern', 'home'] as const
const statKeys = ['plants', 'countries', 'harvests'] as const

function AboutDemoVideo({ src, poster, title, playLabel, pauseLabel }: { src: string; poster: string; title: string; playLabel: string; pauseLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const tryPlay = useCallback(async () => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    el.setAttribute('muted', '')
    try {
      await el.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }, [])

  useEffect(() => {
    void tryPlay()
  }, [tryPlay])

  const toggle = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      void tryPlay()
      return
    }
    el.pause()
    setPlaying(false)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: { xs: '18px', md: '24px' },
        overflow: 'hidden',
        bgcolor: brand.graphite,
      }}
    >
      <Box
        component="video"
        ref={(el: HTMLVideoElement | null) => {
          videoRef.current = el
          if (!el) return
          el.muted = true
          el.defaultMuted = true
          el.setAttribute('playsinline', '')
          el.setAttribute('webkit-playsinline', 'true')
        }}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        controls={false}
        disablePictureInPicture
        aria-label={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedData={() => {
          void tryPlay()
        }}
        sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
      />
      <IconButton
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 64,
          height: 64,
          bgcolor: 'rgba(28, 35, 30, 0.72)',
          color: brand.white,
          opacity: playing ? 0 : 1,
          transition: 'opacity 0.2s ease, background-color 0.2s ease',
          '&:hover': { bgcolor: brand.plantGreen, opacity: 1 },
        }}
      >
        {playing ? <PauseRounded sx={{ fontSize: 32 }} /> : <PlayArrowRounded sx={{ fontSize: 36 }} />}
      </IconButton>
    </Box>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()
  const { images } = useSiteAssetsStore()
  const heroImage = images['about.hero'] || lifestyleImages.heroKitchen
  const storyImage = lifestyleImages.mintKitchen

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <Box component="section" sx={{ background: brand.gradientHero, overflow: 'hidden' }}>
        <Grid container sx={{ alignItems: 'stretch' }}>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: { xs: 3.5, md: 6 },
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 540,
                mx: { xs: 0, md: 'auto' },
                px: pagePaddingX,
                pr: { md: 5 },
              }}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 2.5, md: 3 } }}>
                <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
                  {t('pdp.home')}
                </Link>
                <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
                <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{t('nav.about')}</Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: brand.plantGreenDark,
                  mb: 1.75,
                }}
              >
                {t('aboutPage.eyebrow')}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: { xs: '2.6rem', sm: '3.4rem', md: '3.9rem' },
                  letterSpacing: '-0.04em',
                  lineHeight: 0.96,
                  color: brand.graphite,
                  mb: 2,
                }}
              >
                {t('aboutPage.title')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '1.05rem', md: '1.12rem' }, lineHeight: 1.65, mb: 3, maxWidth: 440 }}>
                {t('aboutPage.lead')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} fullWidth sx={{ px: 3.5, maxWidth: { sm: 'none' } }}>
                  {t('nav.buyNow')}
                </Button>
                <Button variant="outlined" size="large" href={resolveHref(navHrefs.howItWorks)} fullWidth sx={{ px: 3.5, maxWidth: { sm: 'none' } }}>
                  {t('nav.howItWorks')}
                </Button>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ px: { xs: pagePaddingX.xs, sm: pagePaddingX.sm, md: 0 }, pb: { xs: 3.5, md: 0 }, height: { md: '100%' } }}>
                <MediaImg
                  src={heroImage}
                  preset="hero"
                  alt={t('aboutPage.title')}
                sx={{
                  width: '100%',
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { md: '100%' },
                  aspectRatio: { xs: '4 / 3', md: 'unset' },
                  objectFit: 'cover',
                  objectPosition: objectPositionForKey(images, 'about.hero', 'main'),
                  display: 'block',
                  borderRadius: { xs: '20px', md: 0 },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 8 }}>
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: brand.plantGreen,
            mb: 1.5,
          }}
        >
          {t('aboutPage.missionKicker')}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            fontSize: { xs: '1.85rem', md: '2.55rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: brand.graphite,
            whiteSpace: 'pre-line',
            mb: { xs: 4, md: 5 },
            maxWidth: 640,
          }}
        >
          {t('aboutPage.quote')}
        </Typography>

        <Grid container spacing={{ xs: 3.5, md: 5 }}>
          {pillarKeys.map((key, index) => (
            <Grid key={key} size={{ xs: 12, md: 4 }}>
              <Box sx={{ borderTop: `1.5px solid ${brand.plantGreen}`, pt: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: brand.plantGreen, mb: 0.75 }}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite, mb: 0.75 }}>
                  {t(`aboutPage.pillars.${key}.title`)}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.98rem', lineHeight: 1.65 }}>
                  {t(`aboutPage.pillars.${key}.text`)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>

      <Box component="section" sx={{ bgcolor: brand.graphiteSoft, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: pagePaddingX }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', mb: 2 }}>
            {t('aboutPage.videoBadge')}
          </Typography>
          <AboutDemoVideo
            src={productVideo}
            poster={productVideoPoster}
            title={t('aboutPage.videoBadge')}
            playLabel={t('aboutPage.playVideo')}
            pauseLabel={t('aboutPage.pauseVideo')}
          />
        </Box>
      </Box>

      <SectionContainer bgcolor={brand.white} py={{ xs: 6, sm: 7, md: 8 }}>
        <Grid container spacing={{ xs: 4, md: 7 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: brand.plantGreen,
                mb: 1.25,
              }}
            >
              {t('aboutPage.storyKicker')}
            </Typography>
            <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2, fontSize: { xs: '1.85rem', md: '2.35rem' } }}>
              {t('aboutPage.storyTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.75, mb: 1.75 }}>
              {t('aboutPage.story1')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.75, mb: 3.5 }}>
              {t('aboutPage.story2')}
            </Typography>
            <Stack direction="row" spacing={{ xs: 2.5, md: 4 }} sx={{ pt: 2.5, borderTop: `1px solid ${brand.border}` }}>
              {statKeys.map((key) => (
                <Box key={key}>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.55rem' }, color: brand.graphite, lineHeight: 1.1 }}>
                    {t(`aboutPage.stats.${key}.value`)}
                  </Typography>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.75rem', fontWeight: 600, mt: 0.4 }}>
                    {t(`aboutPage.stats.${key}.label`)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal>
                <MediaImg
                  src={storyImage}
                  preset="gallery"
                  alt={t('aboutPage.storyTitle')}
                  loading="lazy"
                  decoding="async"
                sx={{
                  width: '100%',
                  aspectRatio: { xs: '4 / 3', md: '5 / 4' },
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: { xs: '18px', md: '24px' },
                }}
              />
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <Box component="section" sx={{ background: brand.gradientCta, color: brand.white, py: { xs: 6.5, md: 8 } }}>
        <Box sx={{ maxWidth: 560, mx: 'auto', px: pagePaddingX, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85, mb: 1.5 }}>
            {t('aboutPage.originEyebrow')}
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '1.85rem', md: '2.4rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              mb: 1.75,
            }}
          >
            {t('aboutPage.originTitle')}
          </Typography>
          <Typography sx={{ fontSize: '1.02rem', lineHeight: 1.7, opacity: 0.9, mb: 3.5 }}>{t('aboutPage.originText')}</Typography>
          <Button variant="contained" size="large" component={RouterLink} to={navHrefs.buy} sx={{ px: 4.5, bgcolor: brand.white, color: brand.graphite, '&:hover': { bgcolor: brand.beige } }}>
            {t('aboutPage.ctaButton')}
          </Button>
        </Box>
      </Box>
    </main>
  )
}
