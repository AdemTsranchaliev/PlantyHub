import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { pagePaddingX } from './SectionContainer'
import { footerLinkKeys, navHrefs, socialLinks } from '../data/catalog'
import { brand } from '../theme'

const footerHrefs: Record<(typeof footerLinkKeys.main)[number], string> = {
  product: navHrefs.product,
  howItWorks: navHrefs.howItWorks,
  pods: navHrefs.pods,
  accessories: navHrefs.accessories,
  contact: 'mailto:support@plantyhub.com',
  privacy: '#',
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
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              {t('footer.shippingNote')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight, mb: 2 }}>
              {t('footer.linksTitle')}
            </Typography>
            <Stack spacing={1}>
              {footerLinkKeys.main.map((linkKey) => (
                <Link
                  key={linkKey}
                  href={footerHrefs[linkKey]}
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', py: 0.25, '&:hover': { color: brand.white } }}
                >
                  {t(`footer.links.${linkKey}`)}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight, mb: 2 }}>
              {t('footer.followUs')}
            </Typography>
            <Stack spacing={1}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', fontWeight: 600, '&:hover': { color: brand.plantGreenLight } }}
                >
                  {social.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ pt: 3, borderTop: '1px solid rgba(255,255,255,0.12)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
            {t('footer.rights', { year })}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
