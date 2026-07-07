import type { ComponentType } from 'react'
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
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { pagePaddingX } from './SectionContainer'
import { footerLinkKeys, navHrefs, socialLinks } from '../data/catalog'
import { resolveHref } from '../paths'
import { brand } from '../theme'

const footerHrefs: Record<(typeof footerLinkKeys.main)[number], string> = {
  product: navHrefs.product,
  howItWorks: navHrefs.howItWorks,
  pods: navHrefs.pods,
  accessories: navHrefs.accessories,
  about: navHrefs.about,
  support: navHrefs.support,
  contact: 'mailto:support@plantyhub.com',
  privacy: '#',
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
        pb: 'calc(24px + env(safe-area-inset-bottom))',
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: pagePaddingX }}>
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, md: 5 }}>
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

            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight, mb: 1.5 }}>
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
                        width: 42,
                        height: 42,
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

          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight, mb: 2 }}>
              {t('footer.linksTitle')}
            </Typography>
            <Stack spacing={1}>
              {footerLinkKeys.main.map((linkKey) => (
                <Link
                  key={linkKey}
                  href={resolveHref(footerHrefs[linkKey])}
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', py: 0.25, '&:hover': { color: brand.white } }}
                >
                  {t(`footer.links.${linkKey}`)}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight, mb: 2 }}>
              {t('footer.contactTitle')}
            </Typography>
            <Stack spacing={1.25}>
              <Link
                href="mailto:support@plantyhub.com"
                underline="hover"
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', '&:hover': { color: brand.white } }}
              >
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
            pt: 3,
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
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
            {t('footer.madeWith')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
