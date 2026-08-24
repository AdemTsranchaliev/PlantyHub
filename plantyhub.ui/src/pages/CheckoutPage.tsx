import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import { useTranslation } from 'react-i18next'
import Logo from '../components/Logo'
import CheckoutField from '../components/checkout/CheckoutField'
import CheckoutPlaceFields from '../components/checkout/CheckoutPlaceFields'
import { CheckoutOrderSummary, MobileOrderSummary, checkout } from '../components/checkout/CheckoutOrderSummary'
import { navHrefs } from '../data/catalog'
import type { PaymentMethod } from '../admin/orderDetails'
import { ApiError } from '../api/client'
import { shippingApi, taxApi } from '../api'
import type { ShippingQuote, VatQuote } from '../api/types'
import { useCart } from '../hooks/useCart'
import { useCustomerAuth } from '../hooks/useCustomerAuth'
import { createCustomerOrder } from '../store/orders'
import { formatEuro, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '../utils/price'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

const paymentOptions: { id: PaymentMethod; Icon: typeof CreditCardOutlined }[] = [
  { id: 'card', Icon: CreditCardOutlined },
  { id: 'paypal', Icon: PaymentsOutlined },
  { id: 'cod', Icon: LocalShippingOutlined },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: checkout.text, mb: 1.25 }}>
      {children}
    </Typography>
  )
}

function PaymentOption({
  selected,
  label,
  Icon,
  onSelect,
}: {
  selected: boolean
  label: string
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
        py: 1.1,
        borderRadius: '5px',
        border: `1px solid ${selected ? checkout.link : checkout.inputBorder}`,
        bgcolor: selected ? 'rgba(47, 125, 83, 0.04)' : '#fff',
        boxShadow: selected ? `inset 0 0 0 1px ${checkout.link}` : 'none',
        cursor: 'pointer',
        textAlign: 'left',
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
      <Icon sx={{ fontSize: 18, color: checkout.muted }} />
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: checkout.text }}>{label}</Typography>
    </Box>
  )
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, itemCount, subtotal, subtotalLabel, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  const [vat, setVat] = useState<VatQuote | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (!customer) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || customer.name,
      email: prev.email || customer.email,
    }))
  }, [customer])

  useEffect(() => {
    if (form.city.trim().length < 2 || form.postalCode.trim().length < 3) {
      setQuotes([])
      setSelectedQuoteId(null)
      return
    }
    const timer = window.setTimeout(() => {
      setQuotesLoading(true)
      void shippingApi
        .quotes({
          country: form.country,
          city: form.city.trim(),
          cityId: form.cityId || undefined,
          postalCode: form.postalCode.trim(),
          street: form.street.trim() || undefined,
          officeCode: form.officeCode || undefined,
          paymentMethod: form.paymentMethod,
          subtotal,
        })
        .then((data) => {
          const curated = curateCheckoutQuotes(data.quotes, form.country)
          setQuotes(curated)
          setSelectedQuoteId((current) => {
            if (current && curated.some((quote) => quote.id === current)) return current
            return defaultQuoteId(curated, form.street, form.officeCode)
          })
        })
        .catch(() => {
          setQuotes([])
          setSelectedQuoteId(null)
        })
        .finally(() => setQuotesLoading(false))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [form.country, form.city, form.cityId, form.postalCode, form.street, form.officeCode, form.paymentMethod, subtotal])

  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId)
  const shippingAmount =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : selectedQuote ? selectedQuote.priceEur : STANDARD_SHIPPING_COST

  useEffect(() => {
    let cancelled = false
    void taxApi
      .quote(form.country || 'BG', subtotal, shippingAmount)
      .then((data) => {
        if (!cancelled) setVat(data)
      })
      .catch(() => {
        if (!cancelled) setVat(null)
      })
    return () => {
      cancelled = true
    }
  }, [form.country, subtotal, shippingAmount])

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

  const pickupCourier = pickupCourierFor(selectedQuote)

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }))
  }

  const validate = () => {
    const next: FieldErrors = {
      name: form.name.trim().length < 2,
      email: !emailPattern.test(form.email.trim()),
      phone: form.phone.trim().length < 6,
      street: form.street.trim().length < 3,
      city: form.city.trim().length < 2,
      postalCode: form.postalCode.trim().length < 3,
      officeCode: pickupCourier != null && form.officeCode.trim().length < 1,
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
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
        courier: selectedQuote?.courier,
        delivery: selectedQuote?.delivery,
        officeCode: form.officeCode || selectedQuote?.officeCode || undefined,
        cityId: form.cityId || undefined,
      })
      clearCart()
      navigate(`/order/${order.id}`, { replace: true })
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : t('checkout.failed'))
      setSubmitting(false)
    }
  }

  const totalAmount = vat?.enabled ? vat.total : subtotal + shippingAmount
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
    shippingLabel: formatEuro(shippingAmount),
    totalLabel: formatEuro(totalAmount),
    freeShipping: shippingAmount === 0,
    taxLabel: vat?.enabled && vat.tax > 0 ? formatEuro(vat.tax) : null,
    taxHint: vatHint,
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: checkout.bg, color: checkout.text }}>
      <MobileOrderSummary {...summaryProps} open={summaryOpen} onToggle={() => setSummaryOpen((v) => !v)} />

      <Box sx={{ display: 'flex', minHeight: { md: '100vh' } }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
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
                    label={t('checkout.email')}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    helperText={t('checkout.invalidEmail')}
                  />
                  <Grid container spacing={1.25}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CheckoutField
                        label={t('checkout.name')}
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        error={errors.name}
                        helperText={t('checkout.required')}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CheckoutField
                        label={t('checkout.phone')}
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        error={errors.phone}
                        helperText={t('checkout.required')}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>

              <Box>
                <SectionHeading>{t('checkout.shipping')}</SectionHeading>
                <Stack spacing={1.25}>
                  <CheckoutField
                    label={t('checkout.street')}
                    autoComplete="street-address"
                    value={form.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    error={errors.street}
                    helperText={t('checkout.required')}
                  />
                  <CheckoutPlaceFields
                    value={{
                      country: form.country,
                      countryId: form.countryId,
                      city: form.city,
                      cityId: form.cityId,
                      postalCode: form.postalCode,
                      officeCode: form.officeCode,
                    }}
                    pickupCourier={pickupCourier}
                    officeRequired={pickupCourier != null}
                    errors={{ city: errors.city, postalCode: errors.postalCode, officeCode: errors.officeCode }}
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
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: checkout.muted, mb: 1 }}>
                      {t('checkout.deliveryMethod')}
                    </Typography>
                    {quotesLoading ? (
                      <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>
                        {t('checkout.quoting')}
                      </Typography>
                    ) : quotes.length === 0 ? (
                      <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>
                        {t('checkout.quoteFallback')}
                      </Typography>
                    ) : (
                      <Stack spacing={0.75}>
                        {quotes.map((quote) => {
                          const cheapest = Math.min(...quotes.map((item) => item.priceEur))
                          const isCheapest = quotes.length > 1 && quote.priceEur === cheapest && subtotal < FREE_SHIPPING_THRESHOLD
                          return (
                            <PaymentOption
                              key={quote.id}
                              selected={selectedQuoteId === quote.id}
                              label={`${t(`checkout.couriers.${quote.courier}`, { defaultValue: quote.courier })} — ${t(`checkout.delivery.${quote.delivery}`, { defaultValue: quote.delivery })} · ${subtotal >= FREE_SHIPPING_THRESHOLD ? t('cart.freeShipping') : formatEuro(quote.priceEur)}${isCheapest ? ` · ${t('checkout.cheapest')}` : ''}`}
                              Icon={LocalShippingOutlined}
                              onSelect={() => {
                                setSelectedQuoteId(quote.id)
                                setForm((prev) => ({
                                  ...prev,
                                  officeCode: quote.courier === selectedQuote?.courier ? prev.officeCode : '',
                                }))
                              }}
                            />
                          )
                        })}
                      </Stack>
                    )}
                  </Box>
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
                    <Collapse in={notesOpen}>
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
                  {paymentOptions.map(({ id, Icon }) => (
                    <PaymentOption
                      key={id}
                      selected={form.paymentMethod === id}
                      label={t(`checkout.paymentMethods.${id}`)}
                      Icon={Icon}
                      onSelect={() => updateField('paymentMethod', id)}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
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
                    minHeight: 44,
                    borderRadius: '5px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    bgcolor: checkout.link,
                    '&:hover': { bgcolor: '#1F5A3B', boxShadow: 'none' },
                  }}
                >
                  {t('checkout.placeOrder')}
                </Button>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'center', mt: 1.25, color: checkout.muted }}
                >
                  <LockOutlined sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: '0.6875rem' }}>{t('checkout.secureCheckout')}</Typography>
                </Stack>

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
            display: { xs: 'none', md: 'flex' },
            width: { md: 340, lg: 380 },
            flexShrink: 0,
            bgcolor: checkout.sidebar,
            borderLeft: `1px solid ${checkout.border}`,
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              alignSelf: 'flex-start',
              width: '100%',
              maxWidth: 320,
              px: 3,
              py: 3.5,
            }}
          >
            <CheckoutOrderSummary {...summaryProps} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function curateCheckoutQuotes(quotes: ShippingQuote[], country: string): ShippingQuote[] {
  const ok = quotes.filter((quote) => !quote.message)
  const best = (delivery: string, couriers: string[]) =>
    ok
      .filter((quote) => quote.delivery === delivery && couriers.includes(quote.courier))
      .sort((a, b) => a.priceEur - b.priceEur)[0]

  const bulgaria = country.trim().toUpperCase() === 'BG'
  const items: ShippingQuote[] = []
  const address = best('address', bulgaria ? ['econt', 'speedy'] : ['econt', 'speedy', 'dhl'])
  const office = best('office', ['econt', 'speedy'])
  const locker = ok.find((quote) => quote.courier === 'boxnow' && quote.delivery === 'locker')
  if (address) items.push(address)
  if (office) items.push(office)
  if (bulgaria && locker) items.push(locker)
  if (!bulgaria) {
    const dhl = best('address', ['dhl'])
    if (dhl && dhl.id !== address?.id) items.push(dhl)
  }
  return items
}

function defaultQuoteId(quotes: ShippingQuote[], street: string, officeCode: string) {
  if (officeCode.trim()) {
    const locker = quotes.find((quote) => quote.delivery === 'locker')
    const office = quotes.find((quote) => quote.delivery === 'office')
    if (locker) return locker.id
    if (office) return office.id
  }
  if (street.trim().length >= 3) {
    const address = quotes.find((quote) => quote.delivery === 'address')
    if (address) return address.id
  }
  return [...quotes].sort((a, b) => a.priceEur - b.priceEur)[0]?.id ?? null
}

function pickupCourierFor(quote: ShippingQuote | undefined): 'econt' | 'speedy' | 'boxnow' | null {
  if (!quote) return null
  if (quote.delivery === 'locker' && quote.courier === 'boxnow') return 'boxnow'
  if (quote.delivery === 'office' && (quote.courier === 'econt' || quote.courier === 'speedy')) return quote.courier
  return null
}
