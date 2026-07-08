import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from './SectionContainer'
import Reveal from './Reveal'
import { brand } from '../theme'

type Props = {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function AuthPageLayout({ eyebrow, title, subtitle, children }: Props) {
  const { t } = useTranslation()

  return (
    <main>
      <Box sx={{ bgcolor: brand.surface, minHeight: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 140px)' }, display: 'flex', alignItems: 'center' }}>
        <SectionContainer py={{ xs: 5, sm: 6, md: 8 }}>
          <Box sx={{ width: '100%' }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}
            >
              {t('pdp.home')}
            </Link>
            <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
            <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{title}</Typography>
          </Stack>

          <Reveal sx={{ maxWidth: 440, mx: 'auto' }}>
            <Box
              sx={{
                bgcolor: brand.white,
                borderRadius: '28px',
                border: `1px solid ${brand.border}`,
                boxShadow: brand.shadowHover,
                p: { xs: 3, sm: 4 },
              }}
            >
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
                {eyebrow}
              </Typography>
              <Typography component="h1" variant="h3" sx={{ color: brand.graphite, fontSize: { xs: '1.6rem', sm: '1.85rem' }, mb: 1 }}>
                {title}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: '0.98rem', lineHeight: 1.6, mb: 3 }}>
                {subtitle}
              </Typography>
              {children}
            </Box>
          </Reveal>
          </Box>
        </SectionContainer>
      </Box>
    </main>
  )
}
