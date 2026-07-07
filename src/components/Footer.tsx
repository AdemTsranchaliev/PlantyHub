import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { pagePaddingX } from './SectionContainer'
import { footerLinkKeys, navHrefs, socialLinks } from '../data/catalog'
import { brand } from '../theme'

const footerColumns = [
  { titleKey: 'gardens', linkKeys: footerLinkKeys.gardens, hrefs: [navHrefs.gardens, navHrefs.gardens, navHrefs.gardens, navHrefs.gardens] },
  { titleKey: 'pods', linkKeys: footerLinkKeys.pods, hrefs: [navHrefs.pods, navHrefs.pods, navHrefs.pods, navHrefs.pods] },
  { titleKey: 'shopLearn', linkKeys: footerLinkKeys.shopLearn, hrefs: [navHrefs.support, navHrefs.press, '#', '#'] },
  { titleKey: 'company', linkKeys: footerLinkKeys.company, hrefs: [navHrefs.story, '#', navHrefs.support, '#'] },
] as const

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: brand.graphite,
        color: brand.white,
        pt: { xs: 6, sm: 8, md: 10 },
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: pagePaddingX,
          pb: { xs: 5, md: 8 },
          borderBottom: `1px solid rgba(255,255,255,0.12)`,
        }}
      >
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.85rem' }, mb: 1 }}>
              {t('footer.newsletter.title')}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480, lineHeight: 1.7, fontSize: { xs: '0.92rem', sm: '1rem' } }}>
              {t('footer.newsletter.description')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack direction="column" spacing={1.5}>
              <TextField
                placeholder={t('footer.newsletter.placeholder')}
                size="medium"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    color: brand.white,
                    borderRadius: 999,
                    minHeight: 48,
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                  },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
                }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: brand.plantGreen,
                  minHeight: 48,
                  '&:hover': { bgcolor: brand.plantGreenLight },
                }}
              >
                {t('footer.newsletter.cta')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: pagePaddingX, py: { xs: 5, sm: 6, md: 8 } }}>
        <Box sx={{ mb: { xs: 4, md: 5 }, filter: 'brightness(0) invert(1)' }}>
          <Logo size="lg" />
        </Box>
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {footerColumns.map((col) => (
            <Grid key={col.titleKey} size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight }}>
                  {t(`footer.columns.${col.titleKey}`)}
                </Typography>
                {col.linkKeys.map((linkKey, i) => (
                  <Link
                    key={linkKey}
                    href={col.hrefs[i]}
                    underline="hover"
                    sx={{
                      display: 'block',
                      py: 0.5,
                      fontSize: '0.88rem',
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': { color: brand.white },
                    }}
                  >
                    {t(`footer.links.${linkKey}`)}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: { xs: 5, md: 6 }, mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, letterSpacing: '0.06em', fontSize: '0.75rem', color: brand.plantGreenLight }}>
            {t('footer.followUs')}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                underline="hover"
                sx={{
                  display: 'inline-block',
                  py: 0.75,
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'rgba(255,255,255,0.85)',
                  '&:hover': { color: brand.plantGreenLight },
                }}
              >
                {social.label}
              </Link>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: { sm: 'center' },
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {t('footer.rights', { year })}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <Link href="#" variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', py: 0.5, '&:hover': { color: brand.white } }} underline="hover">
              {t('footer.privacy')}
            </Link>
            <Link href="#" variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', py: 0.5, '&:hover': { color: brand.white } }} underline="hover">
              {t('footer.terms')}
            </Link>
            <Link href="#" variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', py: 0.5, '&:hover': { color: brand.white } }} underline="hover">
              {t('footer.refunds')}
            </Link>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
