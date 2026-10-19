import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from './SectionContainer'
import Reveal from './Reveal'
import { productVideo } from '../data/images'
import { useSiteAsset } from '../hooks/useSiteAssets'
import { resolveGardenVideo } from '../media/cfImage'
import { brand } from '../theme'

const plantIds = ['arugula', 'basil', 'lettuce', 'mint', 'cilantro', 'dill', 'parsley', 'plant-everything'] as const

type Step = { title: string; text: string }
type Plant = { name: string; sprout?: string; harvest?: string; note?: string }
type FaqItem = { q: string; a: string }

const idAliases: Record<string, string> = { lettuce2: 'lettuce' }

function plantFor(plants: Partial<Record<string, Plant>>, id: string): Plant | undefined {
  return plants[id] ?? plants[idAliases[id] ?? '']
}

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

type Props = {
  /** When set, the timing card is for this pod. Otherwise the catalog shows every known plant. */
  plantId?: string
  /** Pods currently on the catalog page. Timing rows stay limited to those. */
  listedIds?: string[]
}

export default function PodGuide({ plantId, listedIds }: Props) {
  const { t } = useTranslation()
  const podsVideo = useSiteAsset('pods.video', productVideo)
  const { src: videoSrc, poster: videoPoster } = resolveGardenVideo(podsVideo, '', productVideo)
  const points = asList<string>(t('podGuide.points', { returnObjects: true }))
  const steps = asList<Step>(t('podGuide.steps', { returnObjects: true }))
  const faq = asList<FaqItem>(t('podGuide.faq', { returnObjects: true }))
  const plants = t('podGuide.plants', { returnObjects: true }) as Partial<Record<string, Plant>>
  const focus = plantId ? plantFor(plants, plantId) : undefined
  const catalogIds = listedIds?.length ? listedIds : [...plantIds]
  const catalog = catalogIds.flatMap((id) => {
    const plant = plantFor(plants, id)
    return plant?.name ? [plant] : []
  })

  return (
    <>
      <SectionContainer bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 8 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Reveal sx={{ width: '100%', maxWidth: 300, mx: 'auto' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  mx: 'auto',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: `4px solid ${brand.white}`,
                  boxShadow: brand.shadowHover,
                  bgcolor: brand.graphite,
                }}
              >
                {videoSrc ? (
                  <Box
                    key={videoSrc}
                    component="video"
                    src={videoSrc}
                    poster={videoPoster}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={t('podGuide.videoTitle')}
                    sx={{ width: '100%', aspectRatio: '9 / 16', objectFit: 'cover', display: 'block' }}
                  />
                ) : null}
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
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{t('podGuide.videoBadge')}</Typography>
              </Stack>
              <Typography component="h2" variant="h2" sx={{ color: brand.graphite, mb: 2 }}>
                {t('podGuide.videoTitle')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem', lineHeight: 1.75, mb: 3, maxWidth: 520 }}>
                {t('podGuide.videoText')}
              </Typography>
              <Stack spacing={1.5}>
                {points.map((point) => (
                  <Stack key={point} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleRounded sx={{ color: brand.plantGreen, fontSize: 20, mt: '2px' }} />
                    <Typography sx={{ color: brand.graphite, fontWeight: 600, fontSize: '0.95rem' }}>{point}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 6, sm: 7, md: 8 }}>
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal
              sx={{
                height: '100%',
                borderRadius: '24px',
                border: `1.5px solid ${brand.plantGreen}`,
                p: { xs: 3, sm: 4 },
              }}
            >
              <Typography component="h2" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.4rem', color: brand.graphite, mb: 1 }}>
                {t('podGuide.stepsTitle')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6, mb: 2.5 }}>
                {t('podGuide.stepsLead')}
              </Typography>
              <Stack spacing={2.25}>
                {steps.map((step, i) => (
                  <Stack key={step.title} direction="row" spacing={1.75} sx={{ alignItems: 'flex-start' }}>
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
                        mt: '2px',
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Box>
                      <Typography sx={{ color: brand.graphite, fontWeight: 800, fontSize: '1rem', lineHeight: 1.3 }}>{step.title}</Typography>
                      <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.55, mt: 0.35 }}>{step.text}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Reveal
              sx={{
                height: '100%',
                borderRadius: '24px',
                border: `1.5px solid ${brand.plantGreen}`,
                p: { xs: 3, sm: 4 },
              }}
            >
              <Typography component="h2" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.4rem', color: brand.graphite, mb: 1 }}>
                {t('podGuide.timingTitle')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6, mb: 2.5 }}>
                {t('podGuide.timingLead')}
              </Typography>
              {focus ? (
                <Stack spacing={1.75}>
                  <Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.plantGreenDark, mb: 0.4 }}>
                      {t('podGuide.thisPlant')}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '1.15rem' }}>{focus.name}</Typography>
                  </Box>
                  {focus.note ? (
                    <Typography sx={{ color: brand.graphite, fontSize: '1rem', lineHeight: 1.6 }}>{focus.note}</Typography>
                  ) : (
                    <>
                      {focus.sprout ? <TimingRow label={t('podGuide.sprout')} value={focus.sprout} /> : null}
                      {focus.harvest ? <TimingRow label={t('podGuide.harvest')} value={focus.harvest} /> : null}
                    </>
                  )}
                </Stack>
              ) : plantId || catalog.length === 0 ? (
                <Typography sx={{ color: brand.graphite, fontSize: '1rem', lineHeight: 1.6 }}>{t('podGuide.timingFallback')}</Typography>
              ) : (
                <Stack spacing={0}>
                  {catalog.map((plant, i) => (
                    <Stack
                      key={plant.name}
                      direction="row"
                      sx={{
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 1.15,
                        borderTop: i === 0 ? 'none' : `1px solid ${brand.border}`,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, color: brand.graphite, fontSize: '0.95rem' }}>{plant.name}</Typography>
                      <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', lineHeight: 1.35 }}>
                        {plant.note ?? [plant.sprout, plant.harvest].filter(Boolean).join(' · ')}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>

      {faq.length > 0 && (
        <SectionContainer bgcolor={brand.surface} py={{ xs: 6, sm: 7, md: 8 }}>
          <Reveal sx={{ maxWidth: 820, mx: 'auto' }}>
            <Typography component="h2" variant="h2" sx={{ textAlign: 'center', color: brand.graphite, mb: { xs: 4, md: 5 } }}>
              {t('podGuide.faqTitle')}
            </Typography>
            <Box>
              {faq.map((item) => (
                <Accordion
                  key={item.q}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    bgcolor: brand.white,
                    border: `1px solid ${brand.border}`,
                    borderRadius: '16px !important',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRounded sx={{ color: brand.plantGreen }} />} sx={{ px: { xs: 2, sm: 3 }, py: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: brand.graphite }}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 0 }}>
                    <Typography sx={{ color: brand.textSecondary, lineHeight: 1.7 }}>{item.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button component={RouterLink} to="/faq" variant="outlined">
                {t('podGuide.faqSeeAll')}
              </Button>
            </Box>
          </Reveal>
        </SectionContainer>
      )}
    </>
  )
}

function TimingRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
      <Typography sx={{ color: brand.textSecondary, fontWeight: 700, fontSize: '0.85rem' }}>{label}</Typography>
      <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite }}>{value}</Typography>
    </Stack>
  )
}
