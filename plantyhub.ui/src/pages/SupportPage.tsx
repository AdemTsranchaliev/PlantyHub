import { useEffect, useRef, useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
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
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import KeyboardReturnOutlined from '@mui/icons-material/KeyboardReturnOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import { contactApi } from '../api'
import { ApiError } from '../api/client'
import { navHrefs, socialLinks } from '../data/catalog'
import { brand } from '../theme'

const SUPPORT_EMAIL = 'support@plantyhub.com'
const MESSAGE_MAX = 4000

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const subjectKeys = ['general', 'order', 'shipping', 'returns', 'warranty', 'pods', 'wholesale', 'other'] as const
type SubjectKey = (typeof subjectKeys)[number]
const subjectsWithOrder: SubjectKey[] = ['order', 'shipping', 'returns', 'warranty']

type FieldErrors = {
  name?: boolean
  email?: boolean
  message?: boolean
}

type SubjectPreset = { subject: SubjectKey; token: number }

type FaqItem = { q: string; a: string }

const topicKeys = ['shipping', 'returns', 'warranty'] as const
type TopicKey = (typeof topicKeys)[number]

const topicMeta: Record<TopicKey, { icon: ComponentType<SvgIconProps>; to?: string; subject?: SubjectKey }> = {
  shipping: { icon: LocalShippingOutlined, to: navHrefs.faq },
  returns: { icon: KeyboardReturnOutlined, subject: 'returns' },
  warranty: { icon: VerifiedOutlined, subject: 'warranty' },
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

const topicCardSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: '100%',
  width: '100%',
  textAlign: 'left',
  textDecoration: 'none',
  bgcolor: brand.white,
  border: `1px solid ${brand.border}`,
  borderRadius: '18px',
  p: { xs: 2.25, md: 2.75 },
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  fontFamily: 'inherit',
  appearance: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '@media (hover: hover)': {
    '&:hover': {
      borderColor: brand.plantGreen,
      boxShadow: brand.shadow,
    },
  },
} as const

function ContactLine({
  icon,
  label,
  href,
  value,
}: {
  icon: ReactNode
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

function TopicCard({
  icon: Icon,
  title,
  text,
  action,
  to,
  onClick,
}: {
  icon: ComponentType<SvgIconProps>
  title: string
  text: string
  action: string
  to?: string
  onClick?: () => void
}) {
  const body = (
    <>
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
          mb: 1.5,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: brand.graphite, mb: 0.75 }}>{title}</Typography>
      <Typography sx={{ color: brand.textSecondary, fontSize: '0.92rem', lineHeight: 1.6, mb: 2 }}>{text}</Typography>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 'auto', color: brand.plantGreen, fontWeight: 800, fontSize: '0.92rem' }}>
        <span>{action}</span>
        <ArrowForwardRounded sx={{ fontSize: 18 }} />
      </Stack>
    </>
  )

  if (to) {
    return (
      <Box component={RouterLink} to={to} sx={topicCardSx}>
        {body}
      </Box>
    )
  }

  return (
    <Box component="button" type="button" onClick={onClick} sx={topicCardSx}>
      {body}
    </Box>
  )
}

function ContactForm({ preset }: { preset: SubjectPreset | null }) {
  const { t } = useTranslation()
  const successRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const pendingSubjectFocus = useRef(false)

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
    if (!preset) return
    setSubject(preset.subject)
    if (!subjectsWithOrder.includes(preset.subject)) setOrderNumber('')
    setSent(false)
    setErrors({})
    setSubmitError('')
    pendingSubjectFocus.current = true
  }, [preset])

  useEffect(() => {
    if (!pendingSubjectFocus.current || sent) return
    pendingSubjectFocus.current = false
    subjectRef.current?.focus({ preventScroll: true })
  }, [preset, sent])

  useEffect(() => {
    if (sent) successRef.current?.focus()
  }, [sent])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {
      name: name.trim().length < 2,
      email: !emailPattern.test(email.trim()),
      message: message.trim().length < 10,
    }
    setErrors(nextErrors)
    if (nextErrors.name) {
      nameRef.current?.focus()
      return
    }
    if (nextErrors.email) {
      emailRef.current?.focus()
      return
    }
    if (nextErrors.message) {
      messageRef.current?.focus()
      return
    }

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

  if (sent) {
    return (
      <Stack
        ref={successRef}
        tabIndex={-1}
        role="status"
        spacing={2}
        sx={{ py: 2, alignItems: 'flex-start', outline: 'none' }}
      >
        <CheckCircleRounded sx={{ fontSize: 48, color: brand.plantGreen }} />
        <Typography component="h2" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite }}>
          {t('supportPage.form.successTitle')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, lineHeight: 1.65 }}>{t('supportPage.form.successText')}</Typography>
        <Button variant="outlined" onClick={() => setSent(false)}>
          {t('supportPage.form.sendAnother')}
        </Button>
      </Stack>
    )
  }

  return (
    <Stack component="form" noValidate onSubmit={(e) => void handleSubmit(e)} spacing={2}>
      <Box>
        <Typography component="h2" sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.35rem', color: brand.graphite, mb: 0.75 }}>
          {t('supportPage.form.title')}
        </Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6 }}>
          {t('supportPage.form.lead')}
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {submitError}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label={t('supportPage.form.name')}
          name="name"
          autoComplete="name"
          inputRef={nameRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: false }))
          }}
          error={errors.name}
          helperText={errors.name ? t('supportPage.form.nameError') : undefined}
          required
          disabled={submitting}
          fullWidth
          sx={fieldSx}
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />
        <TextField
          type="email"
          label={t('supportPage.form.email')}
          name="email"
          autoComplete="email"
          inputRef={emailRef}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: false }))
          }}
          error={errors.email}
          helperText={errors.email ? t('supportPage.form.emailError') : undefined}
          required
          disabled={submitting}
          fullWidth
          sx={fieldSx}
          slotProps={{ htmlInput: { maxLength: 254, inputMode: 'email', spellCheck: false } }}
        />
      </Stack>

      <TextField
        select
        label={t('supportPage.form.subject')}
        name="subject"
        inputRef={subjectRef}
        value={subject}
        onChange={(e) => {
          const next = e.target.value as SubjectKey
          setSubject(next)
          if (!subjectsWithOrder.includes(next)) setOrderNumber('')
        }}
        disabled={submitting}
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
          name="orderNumber"
          autoComplete="off"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          helperText={t('supportPage.form.orderNumberHint')}
          disabled={submitting}
          fullWidth
          sx={fieldSx}
          slotProps={{ htmlInput: { maxLength: 64 } }}
        />
      )}

      <TextField
        label={t('supportPage.form.message')}
        name="message"
        inputRef={messageRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          if (errors.message) setErrors((prev) => ({ ...prev, message: false }))
        }}
        error={errors.message}
        helperText={errors.message ? t('supportPage.form.messageError') : `${message.trim().length}/${MESSAGE_MAX}`}
        required
        disabled={submitting}
        multiline
        minRows={4}
        fullWidth
        sx={fieldSx}
        slotProps={{ htmlInput: { maxLength: MESSAGE_MAX } }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        aria-busy={submitting}
        sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 3.5, mt: 0.5, minHeight: 48 }}
      >
        {submitting ? t('supportPage.form.sending') : t('supportPage.form.submit')}
      </Button>
    </Stack>
  )
}

export default function SupportPage() {
  const { t } = useTranslation()
  const [preset, setPreset] = useState<SubjectPreset | null>(null)
  const faqItems = t('supportPage.faqItems', { returnObjects: true }) as FaqItem[]
  const questions = Array.isArray(faqItems) ? faqItems : []

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const openSubject = (subject: SubjectKey) => {
    setPreset({ subject, token: Date.now() })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('contact-form')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={{ xs: 3, sm: 5, md: 6 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 2, md: 3.5 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>{t('supportPage.title')}</Typography>
        </Stack>

        <Box sx={{ maxWidth: 640, mb: { xs: 3, md: 4 } }}>
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
            {t('supportPage.eyebrow')}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '2.15rem', md: '2.6rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: brand.graphite,
              mb: 1.25,
            }}
          >
            {t('supportPage.heroTitle')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.98rem', md: '1.05rem' }, lineHeight: 1.65 }}>
            {t('supportPage.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4, lg: 5 }} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack
              spacing={2.5}
              sx={{
                bgcolor: brand.white,
                borderRadius: { xs: '18px', md: '24px' },
                border: `1px solid ${brand.border}`,
                p: { xs: 2.5, sm: 3, md: 3.5 },
              }}
            >
              <ContactLine
                icon={<MailOutlineRounded sx={{ fontSize: 20 }} />}
                label={t('supportPage.emailLabel')}
                href={`mailto:${SUPPORT_EMAIL}`}
                value={SUPPORT_EMAIL}
              />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: brand.graphite, mb: 0.4 }}>
                  {t('supportPage.responseTitle')}
                </Typography>
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {t('supportPage.responseText')}
                </Typography>
              </Box>
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
                            width: 44,
                            height: 44,
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
          </Grid>

          <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
            <Box
              id="contact-form"
              sx={{
                bgcolor: brand.white,
                borderRadius: { xs: '18px', md: '24px' },
                border: `1px solid ${brand.border}`,
                p: { xs: 2.5, sm: 3.25, md: 4 },
                boxSizing: 'border-box',
                scrollMarginTop: { xs: 88, md: 96 },
              }}
            >
              <ContactForm preset={preset} />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 4, md: 5.5 } }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '1.45rem', md: '1.7rem' },
              color: brand.graphite,
              mb: 0.75,
            }}
          >
            {t('supportPage.topicsTitle')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6, mb: 2.5, maxWidth: 560 }}>
            {t('supportPage.topicsLead')}
          </Typography>
          <Grid container spacing={2}>
            {topicKeys.map((key) => {
              const meta = topicMeta[key]
              const subject = meta.subject
              return (
                <Grid key={key} size={{ xs: 12, sm: 4 }}>
                  <TopicCard
                    icon={meta.icon}
                    title={t(`supportPage.topics.${key}.title`)}
                    text={t(`supportPage.topics.${key}.text`)}
                    action={t(`supportPage.topics.${key}.action`)}
                    to={meta.to}
                    onClick={subject ? () => openSubject(subject) : undefined}
                  />
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </SectionContainer>

      {questions.length > 0 && (
        <SectionContainer bgcolor={brand.white} py={{ xs: 4, sm: 5, md: 7 }}>
          <Box sx={{ maxWidth: 760 }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                fontSize: { xs: '1.45rem', md: '1.7rem' },
                color: brand.graphite,
                mb: 0.75,
              }}
            >
              {t('supportPage.faqTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.95rem', lineHeight: 1.6, mb: 2.5 }}>
              {t('supportPage.faqText')}
            </Typography>
            {questions.map((item) => (
              <Accordion
                key={item.q}
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
                  sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 0.5, sm: 0.25 }, minHeight: 52 }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: brand.graphite, pr: 1 }}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.25, pt: 0 }}>
                  <Typography sx={{ color: brand.textSecondary, lineHeight: 1.7, fontSize: '0.95rem' }}>{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to={navHrefs.faq}
              endIcon={<ArrowForwardRounded />}
              sx={{ mt: 1.5, px: 3, minHeight: 48 }}
            >
              {t('supportPage.faqCta')}
            </Button>
          </Box>
        </SectionContainer>
      )}
    </main>
  )
}
