import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import AutorenewOutlined from '@mui/icons-material/AutorenewOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { brand } from '../theme'

const contactCards: { key: string; Icon: typeof MailOutlineRounded; href?: string }[] = [
  { key: 'email', Icon: MailOutlineRounded, href: 'mailto:support@plantyhub.com' },
  { key: 'shipping', Icon: LocalShippingOutlined },
  { key: 'returns', Icon: AutorenewOutlined },
]

export default function SupportPage() {
  const { t } = useTranslation()
  const faqItems = t('supportPage.faqItems', { returnObjects: true }) as { q: string; a: string }[]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 5, sm: 6, md: 8 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {t('supportPage.title')}
          </Typography>
        </Stack>

        <Reveal sx={{ maxWidth: 640 }}>
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
              mb: 2,
            }}
          >
            {t('supportPage.eyebrow')}
          </Typography>
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.5 }}>
            {t('supportPage.title')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.08rem', lineHeight: 1.7 }}>
            {t('supportPage.subtitle')}
          </Typography>
        </Reveal>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 6, md: 8 }}>
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {contactCards.map(({ key, Icon, href }, index) => {
            const inner = (
              <>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    bgcolor: brand.plantGreenMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Icon sx={{ color: brand.plantGreenDark, fontSize: 26 }} />
                </Box>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.2rem', color: brand.graphite, mb: 1 }}>
                  {t(`supportPage.cards.${key}.title`)}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6, mb: 1 }}>
                  {t(`supportPage.cards.${key}.text`)}
                </Typography>
                <Typography sx={{ color: brand.plantGreen, fontWeight: 700, fontSize: '0.9rem' }}>
                  {t(`supportPage.cards.${key}.action`)}
                </Typography>
              </>
            )
            return (
              <Grid key={key} size={{ xs: 12, md: 4 }}>
                <Reveal
                  delay={index * 0.08}
                  {...(href ? { component: Link, href } : {})}
                  sx={{
                    display: 'block',
                    height: '100%',
                    textDecoration: 'none',
                    bgcolor: brand.white,
                    borderRadius: '24px',
                    border: `1px solid ${brand.border}`,
                    p: { xs: 3, sm: 4 },
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                    '@media (hover: hover)': {
                      '&:hover': { boxShadow: brand.shadowHover, transform: 'translateY(-4px)', borderColor: brand.plantGreenLight },
                    },
                  }}
                >
                  {inner}
                </Reveal>
              </Grid>
            )
          })}
        </Grid>
      </SectionContainer>

      <SectionContainer bgcolor={brand.cream} py={{ xs: 6, sm: 7, md: 8 }}>
        <Reveal sx={{ maxWidth: 820, mx: 'auto' }}>
          <Typography component="h2" variant="h2" sx={{ textAlign: 'center', color: brand.graphite, mb: { xs: 4, md: 5 } }}>
            {t('supportPage.faqTitle')}
          </Typography>
          <Box>
            {faqItems.map((item, i) => (
              <Accordion
                key={i}
                disableGutters
                elevation={0}
                sx={{
                  mb: 1.5,
                  bgcolor: brand.white,
                  border: `1px solid ${brand.creamBorder}`,
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
        </Reveal>
      </SectionContainer>
    </main>
  )
}
