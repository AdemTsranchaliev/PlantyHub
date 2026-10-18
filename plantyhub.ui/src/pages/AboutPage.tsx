import { useCallback, useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import MediaImg from '../components/MediaImg'
import { navHrefs } from '../data/catalog'
import { lifestyleImages } from '../data/images'
import { useSiteAssetsStore } from '../hooks/useSiteAssets'
import { useProduct } from '../hooks/useProducts'
import { objectPositionForKey } from '../media/imageFocus'
import { resolveGardenVideo } from '../media/cfImage'
import { brand } from '../theme'

const serif = '"Fraunces", Georgia, serif'
const missionPointKeys = ['home', 'dig', 'child', 'grow'] as const
const statKeys = ['plants', 'countries', 'harvests'] as const
const aimKeys = ['wanted', 'next', 'future'] as const

const kickerSx = {
  fontSize: '0.72rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: brand.plantGreenDark,
} as const

function AboutDemoVideo({ src, poster, title, playLabel, pauseLabel }: { src: string; poster?: string; title: string; playLabel: string; pauseLabel: string }) {
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
      className="about-video"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 300,
        mx: { xs: 'auto', md: 0 },
        borderRadius: '28px',
        overflow: 'hidden',
        bgcolor: brand.graphite,
        boxShadow: brand.shadowHover,
        '&:hover .about-video-toggle, &:focus-within .about-video-toggle': { opacity: 1 },
      }}
    >
      <Box
        component="video"
        key={src}
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
        sx={{ width: '100%', aspectRatio: '9 / 16', objectFit: 'cover', display: 'block' }}
      />
      <IconButton
        className="about-video-toggle"
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        sx={{
          position: 'absolute',
          right: 12,
          bottom: 12,
          width: 44,
          height: 44,
          bgcolor: 'rgba(28, 35, 30, 0.72)',
          color: brand.white,
          opacity: playing ? 0 : 1,
          transition: 'opacity 0.2s ease',
          '@media (hover: none)': { opacity: 1 },
          '&:hover': { bgcolor: brand.plantGreen },
        }}
      >
        {playing ? <PauseRounded /> : <PlayArrowRounded sx={{ ml: '2px' }} />}
      </IconButton>
    </Box>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()
  const { images } = useSiteAssetsStore()
  const garden = useProduct('gardens', 'homegarder-one')
  const { src: videoSrc, poster: videoPoster } = resolveGardenVideo(garden?.videoUrl, garden?.videoPoster)
  const heroImage = images['about.hero'] || lifestyleImages.heroKitchen
  const storyImage = lifestyleImages.mintKitchen

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 2.5, sm: 4, md: 6 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 2.5, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{t('nav.about')}</Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(280px, 0.95fr)' },
            gap: { xs: 2.5, md: 6 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...kickerSx, mb: 1.25 }}>{t('aboutPage.eyebrow')}</Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: { xs: '2.35rem', sm: '3rem', md: '3.6rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.02,
                color: brand.graphite,
                mb: 1.75,
                maxWidth: 560,
              }}
            >
              {t('aboutPage.title')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '1.02rem', md: '1.12rem' }, lineHeight: 1.6, maxWidth: 480, mb: 2.75 }}>
              {t('aboutPage.lead')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button component={RouterLink} to={navHrefs.buy} variant="contained" size="large" sx={{ minHeight: 48 }}>
                {t('nav.buyNow')}
              </Button>
              <Button component={RouterLink} to={navHrefs.howItWorks} variant="outlined" size="large" sx={{ minHeight: 48 }}>
                {t('nav.howItWorks')}
              </Button>
            </Stack>
          </Box>
          <MediaImg
            src={heroImage}
            preset="hero"
            alt={t('aboutPage.title')}
            sx={{
              width: '100%',
              minWidth: 0,
              aspectRatio: { xs: '4 / 3', md: '5 / 4' },
              objectFit: 'cover',
              objectPosition: objectPositionForKey(images, 'about.hero', 'main'),
              display: 'block',
              borderRadius: { xs: '22px', md: '28px' },
              boxShadow: brand.shadow,
            }}
          />
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1.25 }}>{t('aboutPage.missionKicker')}</Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: { xs: '1.85rem', sm: '2.35rem', md: '2.75rem' },
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: brand.graphite,
            whiteSpace: 'pre-line',
            maxWidth: 680,
            mb: 1.5,
          }}
        >
          {t('aboutPage.quote')}
        </Typography>
        <Typography sx={{ color: brand.graphite, fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.65, maxWidth: 720, mb: { xs: 3, md: 4 } }}>
          {t('aboutPage.missionBody')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
          {missionPointKeys.map((key) => (
            <Box key={key} sx={{ bgcolor: brand.white, borderRadius: '22px', p: { xs: 2, md: 2.5 }, borderTop: `3px solid ${brand.plantGreen}` }}>
              <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.3rem', color: brand.graphite, mb: 0.75, lineHeight: 1.2 }}>
                {t(`aboutPage.missionPoints.${key}.title`)}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.55 }}>
                {t(`aboutPage.missionPoints.${key}.text`)}
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionContainer>

      <SectionContainer py={{ xs: 4, sm: 6, md: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
            gap: { xs: 2.5, md: 6 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ order: { xs: 2, md: 1 }, minWidth: 0 }}>
            {videoSrc ? (
              <AboutDemoVideo
                src={videoSrc}
                poster={videoPoster}
                title={t('aboutPage.videoBadge')}
                playLabel={t('aboutPage.playVideo')}
                pauseLabel={t('aboutPage.pauseVideo')}
              />
            ) : null}
          </Box>
          <Box sx={{ order: { xs: 1, md: 2 }, minWidth: 0 }}>
            <Typography sx={{ ...kickerSx, mb: 1.25 }}>{t('aboutPage.videoBadge')}</Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: { xs: '1.7rem', md: '2.15rem' },
                letterSpacing: '-0.02em',
                color: brand.graphite,
                lineHeight: 1.2,
                maxWidth: 520,
              }}
            >
              {t('aboutPage.mission')}
            </Typography>
          </Box>
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.surface} py={{ xs: 4, sm: 6, md: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' },
            gap: { xs: 2.5, md: 6 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...kickerSx, mb: 1 }}>{t('aboutPage.storyKicker')}</Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: { xs: '1.7rem', md: '2.2rem' },
                letterSpacing: '-0.02em',
                color: brand.graphite,
                mb: 1.5,
              }}
            >
              {t('aboutPage.storyTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.65, mb: 1.5 }}>
              {t('aboutPage.story1')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.65, mb: 2.5 }}>
              {t('aboutPage.story2')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
              {statKeys.map((key) => (
                <Box key={key} sx={{ bgcolor: brand.white, borderRadius: '16px', border: `1px solid ${brand.border}`, px: 1.25, py: 1.15 }}>
                  <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.25rem', color: brand.graphite, lineHeight: 1.1 }}>
                    {t(`aboutPage.stats.${key}.value`)}
                  </Typography>
                  <Typography sx={{ color: brand.textSecondary, fontSize: '0.75rem', lineHeight: 1.3, mt: 0.4 }}>
                    {t(`aboutPage.stats.${key}.label`)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <MediaImg
            src={storyImage}
            preset="gallery"
            alt={t('aboutPage.storyTitle')}
            loading="lazy"
            decoding="async"
            sx={{
              width: '100%',
              minWidth: 0,
              aspectRatio: { xs: '4 / 3', md: '5 / 4' },
              objectFit: 'cover',
              display: 'block',
              borderRadius: { xs: '22px', md: '28px' },
            }}
          />
        </Box>
      </SectionContainer>

      <SectionContainer py={{ xs: 4, sm: 6, md: 8 }}>
        <Typography sx={{ ...kickerSx, mb: 1 }}>{t('aboutPage.foundersKicker')}</Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: { xs: '1.7rem', md: '2.35rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: brand.graphite,
            maxWidth: 680,
            mb: 1.5,
          }}
        >
          {t('aboutPage.foundersTitle')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.65, maxWidth: 640, mb: { xs: 2.5, md: 3.5 } }}>
          {t('aboutPage.foundersLead')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {aimKeys.map((key, index) => (
            <Box key={key} sx={{ bgcolor: brand.surface, borderRadius: '22px', p: { xs: 2, md: 2.5 } }}>
              <Typography sx={{ fontFamily: serif, fontWeight: 600, color: brand.plantGreen, fontSize: '1.2rem', lineHeight: 1, mb: 1.25 }}>
                0{index + 1}
              </Typography>
              <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: '1.25rem', color: brand.graphite, mb: 0.75, lineHeight: 1.2 }}>
                {t(`aboutPage.aims.${key}.title`)}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.55 }}>
                {t(`aboutPage.aims.${key}.text`)}
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionContainer>

      <Box component="section" sx={{ background: brand.gradientCta, color: brand.white, py: { xs: 4, sm: 5, md: 6 } }}>
        <Box sx={{ maxWidth: 640, mx: 'auto', px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85, mb: 1 }}>
            {t('aboutPage.originEyebrow')}
          </Typography>
          <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2.15rem' }, letterSpacing: '-0.02em', lineHeight: 1.15, mb: 1.25 }}>
            {t('aboutPage.originTitle')}
          </Typography>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.92, mb: 2.5 }}>{t('aboutPage.originText')}</Typography>
          <Button
            component={RouterLink}
            to={navHrefs.buy}
            variant="contained"
            size="large"
            sx={{ minHeight: 48, bgcolor: brand.white, color: brand.graphite, '&:hover': { bgcolor: brand.beige } }}
          >
            {t('aboutPage.ctaButton')}
          </Button>
        </Box>
      </Box>
    </main>
  )
}
