import { useEffect, useState, type ComponentType } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import { contactApi } from '../api'
import { ApiError } from '../api/client'
import { navHrefs, socialLinks } from '../data/catalog'
import { brand } from '../theme'

const SUPPORT_EMAIL = 'support@plantyhub.com'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const subjectKeys = ['general', 'order', 'shipping', 'returns', 'warranty', 'pods', 'wholesale', 'other'] as const
type SubjectKey = (typeof subjectKeys)[number]
const subjectsWithOrder: SubjectKey[] = ['order', 'shipping', 'returns', 'warranty']

type FieldErrors = {
  name?: boolean
  email?: boolean
  message?: boolean
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

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: brand.white,
    fontSize: '0.95rem',
    '& fieldset': { borderColor: brand.border },
    '&:hover fieldset': { borderColor: '#D0D4CC' },
    '&.Mui-focused fieldset': { borderColor: brand.plantGreen, borderWidth: 1.5 },
    '&.Mui-error fieldset': { borderColor: '#C62828' },
  },
  '& .MuiOutlinedInput-input': { py: 1.3, px: 1.5 },
  '& .MuiSelect-select': { py: 1.3, px: 1.5 },
  '& .MuiFormHelperText-root': { mx: 0.25, mt: 0.45 },
} as const

function ContactLine({
  icon,
  label,
  href,
  value,
}: {
  icon: React.ReactNode
  label: string
  href: string
  value: string
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          bgcolor: brand.plantGreenMuted,
          color: brand.plantGreenDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.textSecondary, mb: 0.35 }}>
          {label}
        </Typography>
        <Link
          href={href}
          underline="hover"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1rem', md: '1.05rem' },
            color: brand.graphite,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Link>
      </Box>
    </Stack>
  )
}

export default function SupportPage() {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState<SubjectKey>('general')
  const [orderNumber, setOrderNumber] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [sent, setSent] = useState(false)

  const showOrder = subjectsWithOrder.includes(subject)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {
      name: name.trim().length < 2,
      email: !emailPattern.test(email.trim()),
      message: message.trim().length < 10,
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email || nextErrors.message) return

    setSubmitting(true)
    setSubmitError('')
    try {
      await contactApi.sendInquiry({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        orderNumber: showOrder && orderNumber.trim() ? orderNumber.trim() : undefined,
      })
      setSent(true)
      setName('')
      setEmail('')
      setSubject('general')
      setOrderNumber('')
      setMessage('')
      setErrors({})
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : t('supportPage.form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 4, sm: 5, md: 6 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{t('supportPage.title')}</Typography>
        </Stack>

        <Grid container spacing={{ xs: 3.5, md: 5, lg: 7 }} sx={{ alignItems: { md: 'stretch' } }}>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
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
                width: 'fit-content',
              }}
            >
              {t('supportPage.eyebrow')}
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: { xs: '2.25rem', md: '2.6rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                color: brand.graphite,
                mb: 1.25,
              }}
            >
              {t('supportPage.heroTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '1.02rem', lineHeight: 1.65, mb: 3.5, maxWidth: 400 }}>
              {t('supportPage.subtitle')}
            </Typography>

            <Stack spacing={2.5} sx={{ mb: 3.25 }}>
              <ContactLine
                icon={<MailOutlineRounded sx={{ fontSize: 20 }} />}
                label={t('supportPage.emailLabel')}
                href={`mailto:${SUPPORT_EMAIL}`}
                value={SUPPORT_EMAIL}
              />

              <Box>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: brand.textSecondary,
                    mb: 1.15,
                  }}
                >
                  {t('footer.followUs')}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
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
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: brand.plantGreenMuted,
                            color: brand.plantGreenDark,
                            transition: 'background-color 0.2s ease, color 0.2s ease',
                            '@media (hover: hover)': {
                              '&:hover': {
                                bgcolor: brand.plantGreen,
                                color: brand.white,
                              },
                            },
                          }}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    )
                  })}
                </Stack>
              </Box>
            </Stack>

            <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', lineHeight: 1.6, mb: 2.75, maxWidth: 360 }}>
              {t('supportPage.responseText')}
            </Typography>

            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to={navHrefs.faq}
              endIcon={<ArrowForwardRounded />}
              sx={{ px: 3, alignSelf: 'flex-start', mt: 'auto' }}
            >
              {t('nav.faq')}
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
            <Box
              id="contact-form"
              sx={{
                bgcolor: brand.white,
                borderRadius: { xs: '18px', md: '24px' },
                border: `1px solid ${brand.border}`,
                p: { xs: 2.5, sm: 3.25, md: 4 },
                height: '100%',
                boxSizing: 'border-box',
                scrollMarginTop: 96,
              }}
            >
              {sent ? (
                <Stack spacing={2} sx={{ py: 2, alignItems: 'flex-start' }}>
                  <CheckCircleRounded sx={{ fontSize: 48, color: brand.plantGreen }} />
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite }}>
                    {t('supportPage.form.successTitle')}
                  </Typography>
                  <Typography sx={{ color: brand.textSecondary, lineHeight: 1.65 }}>{t('supportPage.form.successText')}</Typography>
                  <Button variant="outlined" onClick={() => setSent(false)}>
                    {t('supportPage.form.sendAnother')}
                  </Button>
                </Stack>
              ) : (
                <Stack component="form" onSubmit={(e) => void handleSubmit(e)} spacing={2}>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite, mb: 0.5 }}>
                    {t('supportPage.form.title')}
                  </Typography>

                  {submitError && (
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                      {submitError}
                    </Alert>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label={t('supportPage.form.name')}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors((prev) => ({ ...prev, name: false }))
                      }}
                      error={errors.name}
                      helperText={errors.name ? t('supportPage.form.nameError') : undefined}
                      fullWidth
                      sx={fieldSx}
                    />
                    <TextField
                      type="email"
                      label={t('supportPage.form.email')}
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors((prev) => ({ ...prev, email: false }))
                      }}
                      error={errors.email}
                      helperText={errors.email ? t('supportPage.form.emailError') : undefined}
                      fullWidth
                      sx={fieldSx}
                    />
                  </Stack>

                  <TextField
                    select
                    label={t('supportPage.form.subject')}
                    value={subject}
                    onChange={(e) => {
                      const next = e.target.value as SubjectKey
                      setSubject(next)
                      if (!subjectsWithOrder.includes(next)) setOrderNumber('')
                    }}
                    fullWidth
                    sx={fieldSx}
                  >
                    {subjectKeys.map((key) => (
                      <MenuItem key={key} value={key}>
                        {t(`supportPage.form.subjects.${key}`)}
                      </MenuItem>
                    ))}
                  </TextField>

                  {showOrder && (
                    <TextField
                      label={t('supportPage.form.orderNumber')}
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      fullWidth
                      sx={fieldSx}
                    />
                  )}

                  <TextField
                    label={t('supportPage.form.message')}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (errors.message) setErrors((prev) => ({ ...prev, message: false }))
                    }}
                    error={errors.message}
                    helperText={errors.message ? t('supportPage.form.messageError') : undefined}
                    multiline
                    minRows={4}
                    fullWidth
                    sx={fieldSx}
                  />

                  <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ alignSelf: 'flex-start', px: 3.5, mt: 0.5 }}>
                    {submitting ? t('supportPage.form.sending') : t('supportPage.form.submit')}
                  </Button>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
      </SectionContainer>
    </main>
  )
}
