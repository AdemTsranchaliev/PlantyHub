import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

type FaqItem = { q: string; a: string }
type FaqCategory = { id: string; title: string; items: FaqItem[] }

export default function FaqPage() {
  const { t } = useTranslation()
  const categories = t('faqPage.categories', { returnObjects: true }) as FaqCategory[]
  const [activeId, setActiveId] = useState<string>('all')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const safeCategories = Array.isArray(categories) ? categories : []
  const visible = useMemo(() => {
    if (activeId === 'all') return safeCategories
    return safeCategories.filter((c) => c.id === activeId)
  }, [activeId, safeCategories])

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 3, sm: 5, md: 8 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 2, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{t('faqPage.title')}</Typography>
        </Stack>

        <Reveal sx={{ maxWidth: 720 }}>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: brand.plantGreen,
              bgcolor: brand.plantGreenMuted,
              borderRadius: 999,
              px: 1.5,
              py: 0.6,
              mb: 1.5,
            }}
          >
            {t('faqPage.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.25, fontSize: { xs: '1.85rem', sm: undefined } }}>
            {t('faqPage.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.98rem', sm: '1.08rem' }, lineHeight: 1.65 }}>
            {t('faqPage.lead')}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 3.5, sm: 5, md: 8 }}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{
            flexWrap: 'wrap',
            mb: { xs: 4, md: 5 },
            pb: 1,
          }}
        >
          <Chip
            label={t('faqPage.allCategories')}
            onClick={() => setActiveId('all')}
            clickable
            sx={{
              fontWeight: 700,
              height: { xs: 40, sm: 36 },
              px: 1.5,
              bgcolor: activeId === 'all' ? brand.plantGreen : brand.beige,
              color: activeId === 'all' ? brand.white : brand.graphite,
              '&:hover': { bgcolor: activeId === 'all' ? brand.plantGreenDark : brand.beigeDark },
            }}
          />
          {safeCategories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.title}
              onClick={() => setActiveId(cat.id)}
              clickable
              sx={{
                fontWeight: 700,
                height: { xs: 40, sm: 36 },
                px: 1.5,
                bgcolor: activeId === cat.id ? brand.plantGreen : brand.beige,
                color: activeId === cat.id ? brand.white : brand.graphite,
                '&:hover': { bgcolor: activeId === cat.id ? brand.plantGreenDark : brand.beigeDark },
              }}
            />
          ))}
        </Stack>

        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
          {visible.map((cat) => (
            <Box key={cat.id} sx={{ mb: { xs: 4, md: 5 } }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.35rem', md: '1.55rem' },
                  color: brand.graphite,
                  mb: 2,
                }}
              >
                {cat.title}
              </Typography>
              {cat.items.map((item, i) => (
                <Accordion
                  key={`${cat.id}-${i}`}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1.25,
                    bgcolor: brand.surface,
                    border: `1px solid ${brand.border}`,
                    borderRadius: '14px !important',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreRounded sx={{ color: brand.plantGreen }} />}
                    sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 0.75, sm: 0.25 }, minHeight: { xs: 52, sm: 48 } }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: brand.graphite, pr: 1 }}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.25, pt: 0 }}>
                    <Typography sx={{ color: brand.textSecondary, lineHeight: 1.75, fontSize: '0.95rem' }}>{item.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>
      </SectionContainer>

      <Box component="section" sx={{ background: brand.gradientCta, color: brand.white, py: { xs: 6, md: 8 } }}>
        <Box sx={{ maxWidth: 560, mx: 'auto', px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '1.7rem', md: '2.1rem' },
              mb: 1.5,
            }}
          >
            {t('faqPage.ctaTitle')}
          </Typography>
          <Typography sx={{ opacity: 0.9, lineHeight: 1.7, mb: 3 }}>{t('faqPage.ctaText')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={navHrefs.contact}
              sx={{ px: 4, bgcolor: brand.white, color: brand.graphite, '&:hover': { bgcolor: brand.beige } }}
            >
              {t('faqPage.ctaSupport')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="mailto:support@plantyhub.com"
              sx={{
                px: 4,
                borderColor: 'rgba(255,255,255,0.55)',
                color: brand.white,
                '&:hover': { borderColor: brand.white, bgcolor: brand.white, color: brand.graphite },
              }}
            >
              {t('faqPage.ctaEmail')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </main>
  )
}
