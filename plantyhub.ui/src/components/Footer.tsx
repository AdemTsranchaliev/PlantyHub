import type { ComponentType, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { pagePaddingX } from './SectionContainer'
import { trackingEnabled } from '../measure/config'
import { openCookieSettings } from '../measure/consent'
import { footerLinkKeys, navHrefs, socialLinks } from '../data/catalog'
import { resolveHref } from '../paths'
import { brand } from '../theme'

const navHrefsMap: Record<(typeof footerLinkKeys.nav)[number], string> = {
  product: navHrefs.product,
  howItWorks: navHrefs.howItWorks,
  pods: navHrefs.pods,
  accessories: navHrefs.accessories,
  about: navHrefs.about,
  contact: navHrefs.contact,
}

const guideHrefs: Record<(typeof footerLinkKeys.guides)[number], string> = {
  faq: navHrefs.faq,
  learn: navHrefs.learn,
  blog: navHrefs.blog,
  instructions: navHrefs.start,
}

const legalHrefs: Record<(typeof footerLinkKeys.legal)[number], string> = {
  privacy: navHrefs.privacy,
  cookies: navHrefs.cookies,
  terms: navHrefs.terms,
}

function TikTokIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.4-2.46V9.7a5.68 5.68 0 0 0-.81-.06 5.66 5.66 0 1 0 5.66 5.66V9.01a7.32 7.32 0 0 0 4.28 1.37V7.29a4.28 4.28 0 0 1-3.2-1.47z" />
    </SvgIcon>
  )
}

const socialIcons: Record<string, ComponentType<SvgIconProps>> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  linkedin: LinkedInIcon,
}

const linkSx = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.88rem',
  py: 0.25,
  '&:hover': { color: brand.white },
} as const

const payWordSx = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontWeight: 600,
  fontSize: '0.95rem',
  lineHeight: 1,
  color: '#1a1a1a',
  letterSpacing: '-0.02em',
} as const

function PayBadge({ label, bg = brand.white, width = 52, children }: { label: string; bg?: string; width?: number; children: ReactNode }) {
  return (
    <Box
      component="li"
      aria-label={label}
      sx={{
        width,
        height: 32,
        px: 0.75,
        borderRadius: '6px',
        bgcolor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.4,
        flexShrink: 0,
        border: bg === brand.white ? '1px solid rgba(255,255,255,0.14)' : 'none',
        boxShadow: 'none',
      }}
    >
      {children}
    </Box>
  )
}

function PaymentMarks() {
  return (
    <>
      <PayBadge label="Visa" width={58}>
        <Box component="span" sx={{ ...payWordSx, color: '#1434CB', fontStyle: 'italic', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.04em' }}>
          VISA
        </Box>
      </PayBadge>
      <PayBadge label="Mastercard" width={52}>
        <Box component="svg" viewBox="0 0 40 24" aria-hidden sx={{ width: 32, height: 20, display: 'block' }}>
          <circle cx="14" cy="12" r="8" fill="#EB001B" />
          <circle cx="26" cy="12" r="8" fill="#F79E1B" />
          <path d="M20 5.6a8 8 0 0 1 0 12.8 8 8 0 0 1 0-12.8z" fill="#FF5F00" />
        </Box>
      </PayBadge>
      <PayBadge label="American Express" bg="#2E77BC" width={58}>
        <Box component="span" sx={{ ...payWordSx, color: brand.white, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
          AMEX
        </Box>
      </PayBadge>
      <PayBadge label="Apple Pay" width={72}>
        <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={{ width: 15, height: 15, display: 'block', flexShrink: 0 }}>
          <path fill="#111" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-0.8-3-0.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.7-2.2c.9-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.9zM14.7 6.1c.6-.8 1.1-1.9.9-3-1 .1-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.3z" />
        </Box>
        <Box component="span" sx={payWordSx}>Pay</Box>
      </PayBadge>
      <PayBadge label="Google Pay" width={78}>
        <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={{ width: 16, height: 16, display: 'block', flexShrink: 0 }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.72.12-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </Box>
        <Box component="span" sx={payWordSx}>Pay</Box>
      </PayBadge>
      <PayBadge label="Stripe" width={68}>
        <Box component="span" sx={{ ...payWordSx, color: '#635BFF', fontWeight: 700, letterSpacing: '-0.03em' }}>
          stripe
        </Box>
      </PayBadge>
    </>
  )
}

const sectionTitleSx = {
  fontWeight: 700,
  letterSpacing: '0.06em',
  fontSize: '0.75rem',
  color: brand.plantGreenLight,
  mb: 2,
} as const

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: brand.graphite,
        color: brand.white,
        pt: { xs: 6, sm: 8 },
        pb: 'calc(72px + env(safe-area-inset-bottom))',
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: pagePaddingX }}>
        <Grid container spacing={{ xs: 4, md: 3 }} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ mb: 3, filter: 'brightness(0) invert(1)' }}>
              <Logo size="lg" />
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2 }}>
              <LocalShippingOutlinedIcon sx={{ color: brand.plantGreenLight, fontSize: 22, mt: 0.25 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                {t('footer.shipping')}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, mb: 3 }}>
              {t('footer.shippingNote')}
            </Typography>

            <Typography variant="subtitle2" sx={{ ...sectionTitleSx, mb: 1.5 }}>
              {t('footer.followUs')}
            </Typography>
            <Stack direction="row" spacing={1.25}>
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.icon] ?? InstagramIcon
                return (
                  <Tooltip key={social.label} title={social.label}>
                    <IconButton
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      sx={{
                        width: 44,
                        height: 44,
                        color: brand.white,
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                        '&:hover': {
                          bgcolor: brand.plantGreen,
                          borderColor: brand.plantGreen,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={sectionTitleSx}>
              {t('footer.linksTitle')}
            </Typography>
            <Stack spacing={1}>
              {footerLinkKeys.nav.map((linkKey) => (
                <Link key={linkKey} href={resolveHref(navHrefsMap[linkKey])} underline="hover" sx={linkSx}>
                  {t(`footer.links.${linkKey}`)}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={sectionTitleSx}>
              {t('footer.guidesTitle')}
            </Typography>
            <Stack spacing={1}>
              {footerLinkKeys.guides.map((linkKey) => (
                <Link key={linkKey} href={resolveHref(guideHrefs[linkKey])} underline="hover" sx={linkSx}>
                  {t(`footer.links.${linkKey}`)}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={sectionTitleSx}>
              {t('footer.legalTitle')}
            </Typography>
            <Stack spacing={1}>
              {footerLinkKeys.legal.map((linkKey) => (
                <Link key={linkKey} href={resolveHref(legalHrefs[linkKey])} underline="hover" sx={linkSx}>
                  {t(`footer.links.${linkKey}`)}
                </Link>
              ))}
              {trackingEnabled && (
                <Box
                  component="button"
                  type="button"
                  onClick={openCookieSettings}
                  sx={{ ...linkSx, background: 'none', border: 0, p: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                >
                  {t('footer.cookieSettings')}
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <Typography variant="subtitle2" sx={sectionTitleSx}>
              {t('footer.contactTitle')}
            </Typography>
            <Stack spacing={1.25}>
              <Link href="mailto:support@plantyhub.com" underline="hover" sx={linkSx}>
                support@plantyhub.com
              </Link>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {t('footer.address')}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            pt: 2.5,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 3 },
            mb: 2.5,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', maxWidth: 420, flexShrink: 0 }}>
            <LockOutlinedIcon sx={{ color: brand.plantGreenLight, fontSize: 18 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              {t('footer.payments')}
            </Typography>
          </Stack>
          <Stack
            component="ul"
            direction="row"
            spacing={0.75}
            aria-label={t('footer.paymentsLabel')}
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              minWidth: 0,
              maxWidth: '100%',
              flexWrap: 'wrap',
              rowGap: 0.75,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            <PaymentMarks />
          </Stack>
        </Box>

        <Box
          sx={{
            pt: 2.5,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
            {t('footer.rights', { year })}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
