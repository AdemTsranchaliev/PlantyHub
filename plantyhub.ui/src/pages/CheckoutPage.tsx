import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined'
import HomeOutlined from '@mui/icons-material/HomeOutlined'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined'
import { useTranslation } from 'react-i18next'
import Logo from '../components/Logo'
import CheckoutField from '../components/checkout/CheckoutField'
import CheckoutPlaceFields, { CheckoutOfficeField } from '../components/checkout/CheckoutPlaceFields'
import { CheckoutOrderSummary, MobileOrderSummary, checkout } from '../components/checkout/CheckoutOrderSummary'
import { navHrefs } from '../data/catalog'
import type { PaymentMethod } from '../admin/orderDetails'
import { ApiError } from '../api/client'
import { promoApi, shippingApi, storeApi, taxApi } from '../api'
import type { ShippingQuote, VatQuote } from '../api/types'
import type { PromoQuote } from '../api'
import { useCart } from '../hooks/useCart'
import { useCustomerAuth } from '../hooks/useCustomerAuth'
import { createCustomerOrder } from '../store/orders'
import { cartTrackingItems, markPendingPurchase, trackBeginCheckout } from '../measure/commerce'
import { formatEuro, FREE_SHIPPING_THRESHOLD, COD_FEE_PERCENT, codFeeAmount } from '../utils/price'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const invalidFieldOrder = ['email', 'name', 'phone', 'city', 'street', 'officeCode'] as const

function revealFirstProblem(errors: FieldErrors, termsMissing: boolean) {
  const key = invalidFieldOrder.find((field) => errors[field])
  const el = key
    ? document.getElementById(key === 'officeCode' ? 'checkout-office' : `checkout-${key}`)
    : termsMissing
      ? document.getElementById('checkout-terms')
      : null
  if (!el) return
  el.scrollIntoView({ block: 'center', behavior: 'auto' })
  if (key) el.focus({ preventScroll: true })
}

type FormState = {
  name: string
  email: string
  phone: string
  street: string
  city: string
  cityId: string
  countryId: string
  postalCode: string
  country: string
  officeCode: string
  paymentMethod: PaymentMethod
  notes: string
}

type FieldErrors = Partial<Record<keyof FormState, boolean>>

const emptyForm: FormState = {
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  cityId: '',
  countryId: '',
  postalCode: '',
  country: 'BG',
  officeCode: '',
  paymentMethod: 'card',
  notes: '',
}

const allPaymentOptions: { id: PaymentMethod; Icon: typeof CreditCardOutlined; detailKey?: string }[] = [
  { id: 'card', Icon: CreditCardOutlined, detailKey: 'checkout.stripe' },
  { id: 'cod', Icon: LocalShippingOutlined, detailKey: 'checkout.codFeeHint' },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: checkout.text, mb: 1.25 }}>
      {children}
    </Typography>
  )
}

function DeliveryOption({
  selected,
  title,
  detail,
  price,
  badge,
  Icon,
  onSelect,
}: {
  selected: boolean
  title: string
  detail: string
  price: string
  badge?: string
  Icon: typeof HomeOutlined
  onSelect: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        minHeight: 68,
        borderRadius: '12px',
        border: `1.5px solid ${selected ? checkout.link : checkout.inputBorder}`,
        bgcolor: selected ? 'rgba(47, 125, 83, 0.07)' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: `2px solid ${selected ? checkout.link : checkout.inputBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: checkout.link }} />}
      </Box>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          bgcolor: selected ? '#fff' : '#F5F5F3',
          color: selected ? checkout.link : checkout.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: checkout.text, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {badge ? (
            <Box
              component="span"
              sx={{
                px: 0.75,
                py: '1px',
                borderRadius: '999px',
                bgcolor: 'rgba(47, 125, 83, 0.12)',
                color: checkout.link,
                fontSize: '0.65rem',
                fontWeight: 700,
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
              }}
            >
              {badge}
            </Box>
          ) : null}
        </Stack>
        <Typography sx={{ fontSize: '0.75rem', color: checkout.muted, lineHeight: 1.3, mt: 0.15 }}>{detail}</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: checkout.text, flexShrink: 0 }}>{price}</Typography>
    </Box>
  )
}

function PaymentOption({
  selected,
  label,
  detail,
  Icon,
  onSelect,
}: {
  selected: boolean
  label: string
  detail?: string
  Icon: typeof CreditCardOutlined
  onSelect: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: { xs: 1.5, sm: 1.1 },
        minHeight: 48,
        borderRadius: '12px',
        border: `1.5px solid ${selected ? checkout.link : checkout.inputBorder}`,
        bgcolor: selected ? 'rgba(47, 125, 83, 0.07)' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: `2px solid ${selected ? checkout.link : checkout.inputBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: checkout.link }} />}
      </Box>
      <Icon sx={{ fontSize: 18, color: selected ? checkout.link : checkout.muted }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: checkout.text, lineHeight: 1.3 }}>{label}</Typography>
        {detail ? (
          <Typography sx={{ fontSize: '0.75rem', color: checkout.muted, lineHeight: 1.3 }}>{detail}</Typography>
        ) : null}
      </Box>
    </Box>
  )
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { items, itemCount, subtotal, subtotalLabel, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [delivery, setDelivery] = useState<'address' | 'office'>('address')
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [quoteKey, setQuoteKey] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoQuote | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoBusy, setPromoBusy] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [vat, setVat] = useState<VatQuote | null>(null)
  const [cardEnabled, setCardEnabled] = useState(true)
  const paymentOptions = allPaymentOptions.filter((option) => option.id !== 'card' || cardEnabled)
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD
  const cityReady = form.city.trim().length >= 2 && form.postalCode.trim().length >= 3
  const requestKey = `${form.country}|${form.cityId}|${form.city.trim()}|${form.postalCode.trim()}|${subtotal.toFixed(2)}`
  const freshQuotes = !shippingFree && quoteKey === requestKey ? quotes : []
  const addressQuote = freshQuotes.find((quote) => quote.delivery === 'address')
  const officeQuote = freshQuotes.find((quote) => quote.delivery === 'office')
  const selectedQuote = delivery === 'office' ? officeQuote : addressQuote
  const shippingKnown = shippingFree || selectedQuote != null
  const shippingAmount = shippingFree ? 0 : (selectedQuote?.priceEur ?? null)
  const chargedShipping = shippingAmount ?? 0
  const cheaper =
    addressQuote && officeQuote && addressQuote.priceEur !== officeQuote.priceEur
      ? addressQuote.priceEur < officeQuote.priceEur
        ? 'address'
        : 'office'
      : null

  useEffect(() => {
    let cancelled = false
    void storeApi.getPayments().then((settings) => {
      if (cancelled) return
      setCardEnabled(settings.cardEnabled)
      if (!settings.cardEnabled) {
        setForm((prev) => (prev.paymentMethod === 'card' ? { ...prev, paymentMethod: 'cod' } : prev))
      }
    }).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (shippingFree || !cityReady) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void shippingApi
        .quotes({
          country: form.country || 'BG',
          city: form.city.trim(),
          cityId: form.cityId || undefined,
          postalCode: form.postalCode.trim(),
          subtotal,
          courier: 'econt',
        })
        .then((data) => {
          if (cancelled) return
          setQuotes(
            data.quotes.filter(
              (quote) =>
                quote.courier === 'econt' &&
                (quote.delivery === 'address' || quote.delivery === 'office') &&
                !quote.message,
            ),
          )
          setQuoteKey(requestKey)
        })
        .catch(() => {
          // Keep the options on screen. A failed refresh must not wipe the prices already shown.
        })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [shippingFree, cityReady, requestKey, form.country, form.city, form.cityId, form.postalCode, subtotal])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    trackBeginCheckout(cartTrackingItems(items))
    // Count the checkout once, with the cart it was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!customer) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || customer.name,
      email: prev.email || customer.email,
    }))
  }, [customer])

  const discountAmount = appliedPromo?.discount ?? 0
  const goodsAmount = Math.max(0, subtotal - discountAmount)

  const promoErrorText = (code: string) => {
    const key = `checkout.promoErrors.${code}`
    const translated = t(key)
    return translated === key ? t('checkout.promoErrors.invalid') : translated
  }

  const applyPromo = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) {
      setAppliedPromo(null)
      setPromoError(null)
      return
    }
    setPromoBusy(true)
    setPromoError(null)
    try {
      const quote = await promoApi.validate(trimmed, subtotal)
      setAppliedPromo(quote)
      setPromoInput(quote.code)
    } catch (err) {
      setAppliedPromo(null)
      setPromoError(err instanceof ApiError ? promoErrorText(err.message) : t('checkout.promoErrors.invalid'))
    } finally {
      setPromoBusy(false)
    }
  }

  useEffect(() => {
    if (!appliedPromo) return
    let cancelled = false
    void promoApi
      .validate(appliedPromo.code, subtotal)
      .then((quote) => {
        if (!cancelled) setAppliedPromo(quote)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAppliedPromo(null)
        setPromoError(err instanceof ApiError ? promoErrorText(err.message) : t('checkout.promoErrors.invalid'))
      })
    return () => {
      cancelled = true
    }
  }, [subtotal, appliedPromo?.code, t])

  useEffect(() => {
    let cancelled = false
    void taxApi
      .quote(form.country || 'BG', goodsAmount, chargedShipping)
      .then((data) => {
        if (!cancelled) setVat(data)
      })
      .catch(() => {
        if (!cancelled) setVat(null)
      })
    return () => {
      cancelled = true
    }
  }, [form.country, goodsAmount, chargedShipping])

  if (submitting && items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F4F5F0', display: 'grid', placeItems: 'center', px: 2 }}>
        <Stack
          spacing={1.5}
          sx={{
            alignItems: 'center',
            bgcolor: '#fff',
            border: `1px solid ${checkout.border}`,
            borderRadius: '16px',
            px: 4,
            py: 3,
          }}
        >
          <CircularProgress size={28} sx={{ color: checkout.link }} />
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('checkout.placing')}</Typography>
        </Stack>
      </Box>
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: checkout.bg, display: 'grid', placeItems: 'center', px: 3 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 380 }}>
          <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, mb: 1, color: checkout.text }}>
            {t('checkout.emptyTitle')}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to={navHrefs.cart}
            sx={{ mt: 2, borderRadius: '5px', minHeight: 48, px: 3, boxShadow: 'none' }}
          >
            {t('checkout.backToCart')}
          </Button>
        </Box>
      </Box>
    )
  }

  const pickupCourier = delivery === 'office' ? 'econt' : null

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }))
  }

  const validate = () => {
    const next: FieldErrors = {
      name: form.name.trim().length < 2,
      email: !emailPattern.test(form.email.trim()),
      phone: form.phone.trim().length < 6,
      street: delivery === 'office' ? false : form.street.trim().length < 3,
      city: form.city.trim().length < 2 || form.postalCode.trim().length < 3,
      postalCode: false,
      officeCode: pickupCourier != null && form.officeCode.trim().length < 1,
    }
    setErrors(next)
    const termsMissing = !termsAccepted
    setTermsError(termsMissing)
    const valid = !Object.values(next).some(Boolean) && !termsMissing
    if (!valid) revealFirstProblem(next, termsMissing)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!shippingKnown) {
      setSubmitError(cityReady ? t('checkout.shippingUnavailable') : t('checkout.quoteFallback'))
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await createCustomerOrder(items, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
        courier: 'econt',
        delivery,
        officeCode: delivery === 'office' ? form.officeCode : undefined,
        cityId: form.cityId || undefined,
        promoCode: appliedPromo?.code,
        termsAccepted,
      })
      markPendingPurchase(order.id)
      navigate(`/order/${order.id}`, { replace: true })
      clearCart()
    } catch (err) {
      const promoCodes = new Set(['invalid', 'expired', 'not_started', 'used_up', 'min_subtotal'])
      if (err instanceof ApiError && err.message === 'terms_required') setTermsError(true)
      setSubmitError(
        err instanceof ApiError
          ? err.message === 'terms_required'
            ? t('checkout.termsRequired')
            : err.message === 'delivery_bulgaria_only'
              ? t('checkout.deliveryBulgariaOnly')
            : err.message === 'shipping_unavailable'
              ? t('checkout.shippingUnavailable')
            : err.message === 'card_unavailable'
              ? t('checkout.failed')
            : promoCodes.has(err.message)
              ? promoErrorText(err.message)
              : err.message
          : t('checkout.failed'),
      )
      setSubmitting(false)
    }
  }

  const payableBeforeCod = vat?.enabled ? vat.total : goodsAmount + chargedShipping
  const codFee = form.paymentMethod === 'cod' ? codFeeAmount(payableBeforeCod) : 0
  const totalAmount = payableBeforeCod + codFee
  const codPercent = `${new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(COD_FEE_PERCENT)}%`
  const summaryShipping = shippingFree
    ? t('cart.freeShipping')
    : shippingKnown && shippingAmount != null
      ? formatEuro(shippingAmount)
      : cityReady
        ? t('checkout.quoting')
        : '—'
  const vatHint =
    vat?.enabled && vat.ratePercent > 0
      ? vat.pricesIncludeVat
        ? t('cart.vatIncluded', { rate: vat.ratePercent })
        : t('cart.vatAdded', { rate: vat.ratePercent })
      : vat?.enabled && vat.message === 'outsideEu'
        ? t('cart.vatExport')
        : null
  const summaryProps = {
    items,
    itemCount,
    subtotalLabel,
    shippingLabel: summaryShipping,
    totalLabel: formatEuro(totalAmount),
    freeShipping: shippingFree,
    taxLabel: vat?.enabled && !vat.pricesIncludeVat && vat.tax > 0 ? formatEuro(vat.tax) : null,
    taxHint: vatHint,
    discountLabel: discountAmount > 0 ? `−${formatEuro(discountAmount)}` : null,
    codFeeLabel: codFee > 0 ? formatEuro(codFee) : null,
    codPercent,
    deliveryTotalLabel:
      codFee > 0 && (shippingFree || (shippingKnown && shippingAmount != null))
        ? formatEuro((shippingAmount ?? 0) + codFee)
        : null,
    promo: {
      input: promoInput,
      busy: promoBusy,
      error: promoError,
      appliedCode: appliedPromo?.code ?? null,
      onInput: (value: string) => {
        setPromoInput(value.toUpperCase())
        setPromoError(null)
      },
      onApply: () => void applyPromo(promoInput),
      onClear: () => {
        setAppliedPromo(null)
        setPromoInput('')
        setPromoError(null)
      },
    },
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F5F0', color: checkout.text }}>
      {submitting ? (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 20,
            bgcolor: 'rgba(244, 245, 240, 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              alignItems: 'center',
              bgcolor: '#fff',
              border: `1px solid ${checkout.border}`,
              borderRadius: '16px',
              px: 4,
              py: 3,
            }}
          >
            <CircularProgress size={28} sx={{ color: checkout.link }} />
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('checkout.placing')}</Typography>
          </Stack>
        </Box>
      ) : null}
      <MobileOrderSummary {...summaryProps} open={summaryOpen} onToggle={() => setSummaryOpen((v) => !v)} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: { md: 3 },
          maxWidth: 1080,
          mx: 'auto',
          px: { xs: 0, md: 3 },
          py: { md: 3.5 },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#fff',
            borderRadius: { md: '20px' },
            border: { md: `1px solid ${checkout.border}` },
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2.5, md: 3.5 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 520 }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}
            >
              <Link component={RouterLink} to="/" underline="none" sx={{ display: 'inline-flex' }}>
                <Logo size="sm" />
              </Link>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Link
                  component={RouterLink}
                  to={navHrefs.cart}
                  underline="hover"
                  sx={{ fontSize: '0.75rem', color: checkout.link, fontWeight: 500 }}
                >
                  {t('checkout.breadcrumb.cart')}
                </Link>
                <Typography sx={{ color: checkout.muted, fontSize: '0.75rem' }} aria-hidden>
                  ›
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: checkout.text, fontWeight: 500 }}>
                  {t('checkout.breadcrumb.checkout')}
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={2.5}>
              <Box>
                <SectionHeading>{t('checkout.contact')}</SectionHeading>
                <Stack spacing={1.25}>
                  <CheckoutField
                    id="checkout-email"
                    label={t('checkout.email')}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    helperText={t('checkout.invalidEmail')}
                    slotProps={{ htmlInput: { inputMode: 'email', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } }}
                  />
                  <Grid container spacing={1.25}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CheckoutField
                        id="checkout-name"
                        label={t('checkout.name')}
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        error={errors.name}
                        helperText={t('checkout.required')}
                        slotProps={{ htmlInput: { autoCapitalize: 'words' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CheckoutField
                        id="checkout-phone"
                        label={t('checkout.phone')}
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        error={errors.phone}
                        helperText={t('checkout.required')}
                        slotProps={{ htmlInput: { inputMode: 'tel' } }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>

              <Box>
                <SectionHeading>{t('checkout.shipping')}</SectionHeading>
                <Stack spacing={1.25}>
                  <CheckoutPlaceFields
                    value={{
                      country: form.country,
                      countryId: form.countryId,
                      city: form.city,
                      cityId: form.cityId,
                      postalCode: form.postalCode,
                      officeCode: form.officeCode,
                    }}
                    errors={{ city: errors.city }}
                    onChange={(patch) => {
                      setForm((prev) => ({ ...prev, ...patch }))
                      setErrors((prev) => ({
                        ...prev,
                        city: patch.city !== undefined ? false : prev.city,
                        postalCode: patch.postalCode !== undefined ? false : prev.postalCode,
                        officeCode: patch.officeCode !== undefined ? false : prev.officeCode,
                      }))
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: checkout.muted, mb: 0.75 }}>
                      {t('checkout.deliveryMethod')}
                    </Typography>
                    <Stack spacing={0.75}>
                      {(['address', 'office'] as const).map((mode) => {
                        const quote = mode === 'address' ? addressQuote : officeQuote
                        const price = shippingFree
                          ? t('cart.freeShipping')
                          : quote
                            ? formatEuro(quote.priceEur)
                            : cityReady
                              ? t('checkout.quoting')
                              : '—'
                        return (
                          <DeliveryOption
                            key={mode}
                            selected={delivery === mode}
                            title={t(`checkout.delivery.${mode}`).replace(/^./, (letter) => letter.toUpperCase())}
                            detail={t('checkout.couriers.econt')}
                            price={price}
                            badge={cheaper === mode ? t('checkout.cheapest') : undefined}
                            Icon={mode === 'address' ? HomeOutlined : StorefrontOutlined}
                            onSelect={() => {
                              setDelivery(mode)
                              if (mode === 'address') {
                                setForm((prev) => ({ ...prev, officeCode: '' }))
                                setErrors((prev) => ({ ...prev, officeCode: false }))
                              } else {
                                setErrors((prev) => ({ ...prev, street: false }))
                              }
                            }}
                          />
                        )
                      })}
                    </Stack>
                    {!cityReady && !shippingFree ? (
                      <Typography sx={{ fontSize: '0.75rem', color: checkout.muted, mt: 0.75 }}>
                        {t('checkout.quoteFallback')}
                      </Typography>
                    ) : null}
                  </Box>
                  {delivery === 'address' ? (
                    <CheckoutField
                      id="checkout-street"
                      label={t('checkout.street')}
                      autoComplete="street-address"
                      value={form.street}
                      onChange={(e) => updateField('street', e.target.value)}
                      error={errors.street}
                      helperText={t('checkout.required')}
                    />
                  ) : null}
                  {pickupCourier ? (
                    <CheckoutOfficeField
                      value={{
                        country: form.country,
                        countryId: form.countryId,
                        city: form.city,
                        cityId: form.cityId,
                        postalCode: form.postalCode,
                        officeCode: form.officeCode,
                      }}
                      pickupCourier={pickupCourier}
                      officeRequired
                      errors={{ officeCode: errors.officeCode }}
                      onChange={(patch) => {
                        setForm((prev) => ({ ...prev, ...patch }))
                        setErrors((prev) => ({
                          ...prev,
                          officeCode: patch.officeCode !== undefined ? false : prev.officeCode,
                        }))
                      }}
                    />
                  ) : null}
                  <Box>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => setNotesOpen((v) => !v)}
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: checkout.link,
                        border: 0,
                        bgcolor: 'transparent',
                        cursor: 'pointer',
                        p: 0,
                      }}
                    >
                      {notesOpen ? t('checkout.hideNotes') : t('checkout.addNotes')}
                    </Link>
                    <Collapse in={notesOpen} unmountOnExit>
                      <Box sx={{ mt: 1.25 }}>
                        <CheckoutField
                          label={t('checkout.notes')}
                          multiline
                          minRows={2}
                          value={form.notes}
                          onChange={(e) => updateField('notes', e.target.value)}
                        />
                      </Box>
                    </Collapse>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <SectionHeading>{t('checkout.payment')}</SectionHeading>
                <Stack spacing={0.75}>
                  {paymentOptions.map(({ id, Icon, detailKey }) => (
                    <PaymentOption
                      key={id}
                      selected={form.paymentMethod === id}
                      label={t(`checkout.paymentMethods.${id}`)}
                      detail={detailKey ? t(detailKey, { percent: codPercent }) : undefined}
                      Icon={Icon}
                      onSelect={() => updateField('paymentMethod', id)}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
                  <Checkbox
                    id="checkout-terms"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked)
                      if (event.target.checked) setTermsError(false)
                    }}
                    sx={{
                      p: 0.25,
                      color: termsError ? '#C62828' : checkout.inputBorder,
                      '&.Mui-checked': { color: checkout.link },
                    }}
                  />
                  <Typography sx={{ fontSize: '0.8125rem', color: termsError ? '#C62828' : checkout.text, lineHeight: 1.45, pt: 0.35 }}>
                    {t('checkout.termsBefore')}{' '}
                    <Link component={RouterLink} to={navHrefs.terms} underline="hover" sx={{ fontWeight: 700, color: checkout.link }}>
                      {t('footer.links.terms')}
                    </Link>
                    {t('checkout.termsMiddle')}{' '}
                    <Link component={RouterLink} to={navHrefs.privacy} underline="hover" sx={{ fontWeight: 700, color: checkout.link }}>
                      {t('footer.links.privacy')}
                    </Link>
                    {t('checkout.termsAfter')}
                  </Typography>
                </Stack>
                {termsError ? (
                  <Typography sx={{ color: '#C62828', fontSize: '0.75rem', fontWeight: 600, mb: 1.25 }}>
                    {t('checkout.termsRequired')}
                  </Typography>
                ) : null}
                {submitError ? (
                  <Typography sx={{ color: '#C62828', fontSize: '0.8125rem', fontWeight: 600, mb: 1.25 }}>
                    {submitError}
                  </Typography>
                ) : null}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  sx={{
                    minHeight: 48,
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    bgcolor: checkout.link,
                    '&:hover': { bgcolor: '#1F5A3B', boxShadow: 'none' },
                  }}
                >
                  {submitting ? (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ color: '#fff' }} />
                      <span>{t('checkout.placing')}</span>
                    </Stack>
                  ) : (
                    t('checkout.placeOrder')
                  )}
                </Button>

                {cardEnabled ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', justifyContent: 'center', mt: 1.25, color: checkout.muted }}
                  >
                    <LockOutlined sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: '0.6875rem' }}>{t('checkout.secureCheckout')}</Typography>
                  </Stack>
                ) : null}

                <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                  <Link
                    component={RouterLink}
                    to={navHrefs.cart}
                    underline="hover"
                    sx={{ fontSize: '0.8125rem', fontWeight: 500, color: checkout.link }}
                  >
                    ‹ {t('checkout.returnToCart')}
                  </Link>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: { md: 340, lg: 380 },
            flexShrink: 0,
            position: 'sticky',
            top: 28,
          }}
        >
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: '20px',
              border: `1px solid ${checkout.border}`,
              px: 2.5,
              py: 2.5,
            }}
          >
            <CheckoutOrderSummary {...summaryProps} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
