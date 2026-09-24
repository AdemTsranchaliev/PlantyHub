import { useEffect, useId, useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import { navHrefs } from '../data/catalog'
import { brand } from '../theme'

export type LegalDoc = 'privacy' | 'cookies' | 'terms'

type LegalSection = {
  title: string
  paragraphs?: string[]
  items?: string[]
}

type LegalDocContent = {
  title: string
  eyebrow: string
  updated: string
  lead: string
  sections: LegalSection[]
}

const legalDocs: LegalDoc[] = ['privacy', 'cookies', 'terms']

const legalDocHrefs: Record<LegalDoc, string> = {
  privacy: navHrefs.privacy,
  cookies: navHrefs.cookies,
  terms: navHrefs.terms,
}

function sectionId(index: number) {
  return `section-${index + 1}`
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation()
  const tocId = useId()
  const content = t(`legalPages.${doc}`, { returnObjects: true }) as LegalDocContent
  const sections = useMemo(() => (Array.isArray(content?.sections) ? content.sections : []), [content])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [doc])

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 3, sm: 5, md: 6 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{content.title}</Typography>
        </Stack>

        <Box sx={{ maxWidth: 820 }}>
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
            {content.eyebrow}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '2.1rem', md: '2.55rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: brand.graphite,
              mb: 1.25,
            }}
          >
            {content.title}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', fontWeight: 600, mb: 1.75 }}>
            {t('legalPages.updatedLabel')}: {content.updated}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>{content.lead}</Typography>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {legalDocs.map((key) => {
              const active = key === doc
              return (
                <Button
                  key={key}
                  component={RouterLink}
                  to={legalDocHrefs[key]}
                  variant={active ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    px: 2,
                    minHeight: 44,
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    ...(active
                      ? {}
                      : {
                          bgcolor: brand.white,
                          borderColor: brand.border,
                          color: brand.graphite,
                          '&:hover': { borderColor: brand.plantGreen, bgcolor: brand.plantGreenMuted },
                        }),
                  }}
                >
                  {t(`footer.links.${key}`)}
                </Button>
              )
            })}
          </Stack>
        </Box>
      </SectionContainer>

      <SectionContainer bgcolor={brand.white} py={{ xs: 4.5, sm: 5.5, md: 7 }}>
        <Grid container spacing={{ xs: 3.5, md: 5, lg: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              component="nav"
              aria-labelledby={tocId}
              sx={{
                position: { md: 'sticky' },
                top: { md: 104 },
                bgcolor: brand.surface,
                border: `1px solid ${brand.border}`,
                borderRadius: '18px',
                p: { xs: 2, sm: 2.25 },
              }}
            >
              <Typography
                id={tocId}
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: brand.textSecondary,
                  mb: 1.5,
                }}
              >
                {t('legalPages.contentsLabel')}
              </Typography>
              <Stack component="ol" spacing={0.35} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                {sections.map((section, index) => (
                  <Box
                    key={section.title}
                    component="li"
                    sx={{
                      borderBottom: index < sections.length - 1 ? `1px solid ${brand.border}` : 'none',
                    }}
                  >
                    <Link
                      href={`#${sectionId(index)}`}
                      underline="none"
                      sx={{
                        display: 'flex',
                        gap: 1.25,
                        alignItems: 'flex-start',
                        py: 1.05,
                        color: brand.graphite,
                        transition: 'color 0.15s ease',
                        '@media (hover: hover)': {
                          '&:hover': { color: brand.plantGreenDark },
                        },
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          flexShrink: 0,
                          width: 22,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: brand.plantGreen,
                          pt: 0.15,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>
                        {section.title}
                      </Typography>
                    </Link>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={0}>
              {sections.map((section, index) => {
                const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : []
                const items = Array.isArray(section.items) ? section.items : []

                return (
                  <Box
                    key={section.title}
                    id={sectionId(index)}
                    component="section"
                    sx={{
                      scrollMarginTop: 112,
                      py: { xs: 3, md: 3.5 },
                      borderTop: index === 0 ? 'none' : `1px solid ${brand.border}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 1.75 }}>
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 600,
                          fontSize: { xs: '1.15rem', md: '1.3rem' },
                          color: brand.plantGreen,
                          minWidth: 36,
                        }}
                      >
                        {index + 1}.
                      </Typography>
                      <Typography
                        component="h2"
                        sx={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontWeight: 600,
                          fontSize: { xs: '1.2rem', md: '1.35rem' },
                          color: brand.graphite,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.25,
                        }}
                      >
                        {section.title}
                      </Typography>
                    </Stack>

                    <Box sx={{ pl: { xs: 0, sm: 5.5 } }}>
                      {paragraphs.length > 0 && (
                        <Stack spacing={1.35} sx={{ mb: items.length ? 1.75 : 0 }}>
                          {paragraphs.map((paragraph, pIndex) => (
                            <Typography key={`${section.title}-p-${pIndex}`} sx={{ color: brand.textSecondary, fontSize: '1rem', lineHeight: 1.75 }}>
                              {paragraph}
                            </Typography>
                          ))}
                        </Stack>
                      )}

                      {items.length > 0 && (
                        <Box
                          component="ul"
                          sx={{
                            m: 0,
                            pl: 0,
                            listStyle: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.15,
                          }}
                        >
                          {items.map((item, itemIndex) => (
                            <Box
                              key={`${section.title}-i-${itemIndex}`}
                              component="li"
                              sx={{
                                display: 'flex',
                                gap: 1.25,
                                alignItems: 'flex-start',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: '50%',
                                  bgcolor: brand.plantGreen,
                                  mt: 1,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography sx={{ color: brand.textSecondary, fontSize: '1rem', lineHeight: 1.7 }}>{item}</Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Stack>

            <Box
              sx={{
                mt: { xs: 3, md: 4 },
                p: { xs: 2.5, sm: 3 },
                borderRadius: '18px',
                bgcolor: brand.surface,
                border: `1px solid ${brand.border}`,
              }}
            >
              <Typography sx={{ color: brand.graphite, fontWeight: 700, fontSize: '1.05rem', mb: 0.75 }}>{t('legalPages.contactTitle')}</Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.65, mb: 2 }}>{t('legalPages.contactLead')}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" component={RouterLink} to={navHrefs.contact} endIcon={<ArrowForwardRounded />} sx={{ px: 3, alignSelf: 'flex-start' }}>
                  {t('legalPages.contactCta')}
                </Button>
                <Button variant="outlined" component="a" href="mailto:support@plantyhub.com" sx={{ px: 3, alignSelf: 'flex-start' }}>
                  support@plantyhub.com
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </SectionContainer>
    </main>
  )
}
