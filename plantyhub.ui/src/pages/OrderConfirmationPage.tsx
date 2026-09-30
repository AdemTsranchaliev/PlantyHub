import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckRounded from '@mui/icons-material/CheckRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import { useTranslation } from 'react-i18next'
import { countryDisplayName } from '../utils/country'
import { navHrefs } from '../data/catalog'
import type { OrderDetail } from '../admin/orderDetails'
import { downloadOrderSheet } from '../admin/orderSheet'
import { useOrderDetail } from '../hooks/useOrders'
import { checkout } from '../components/checkout/CheckoutOrderSummary'
import Logo from '../components/Logo'
import MediaImg from '../components/MediaImg'

export default function OrderConfirmationPage() {
  const { t, i18n } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const { order, loading } = useOrderDetail(orderId)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F5F0', color: checkout.text, px: 2, py: { xs: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          <Logo size="sm" />
        </Box>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '20px',
            border: `1px solid ${checkout.border}`,
            px: { xs: 2.25, sm: 3.5 },
            py: { xs: 2.5, sm: 3.5 },
          }}
        >
          {loading ? (
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 6 }}>
              <CircularProgress size={28} sx={{ color: checkout.link }} />
            </Stack>
          ) : !order ? (
            <Stack spacing={2} sx={{ alignItems: 'flex-start', py: 2 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('order.notFound')}</Typography>
              <Button component={RouterLink} to="/" variant="contained" sx={primaryButtonSx}>
                {t('order.backHome')}
              </Button>
            </Stack>
          ) : (
            <ConfirmedOrder order={order} language={i18n.language} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

function ConfirmedOrder({ order, language }: { order: OrderDetail; language: string }) {
  const { t } = useTranslation()
  const gifts = order.lineItems.flatMap((item) => (item.gift ? [item.gift] : []))
  const addressLines = [
    order.shipping.street.trim(),
    [order.shipping.postalCode, order.shipping.city].filter(Boolean).join(' '),
    countryDisplayName(order.shipping.country, language),
  ].filter(Boolean)

  return (
    <Stack spacing={3}>
      <Stack spacing={1.25} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: 'rgba(47, 125, 83, 0.12)',
            color: checkout.link,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckRounded sx={{ fontSize: 28 }} />
        </Box>
        <Typography component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {t('order.successTitle')}
        </Typography>
        <Typography sx={{ fontSize: '0.9375rem', color: checkout.muted, lineHeight: 1.5, maxWidth: 420 }}>
          {t('order.successSubtitle', { email: order.email })}
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            px: 1.25,
            py: 0.4,
            borderRadius: '999px',
            bgcolor: '#F4F5F0',
            fontSize: '0.8125rem',
            fontWeight: 700,
          }}
        >
          {t('order.orderNumber', { id: order.id })}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: checkout.border }} />

      <Stack spacing={1.5}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: checkout.muted }}>{t('order.items')}</Typography>
        {order.lineItems.map((item) => (
          <Stack key={item.id} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Thumb src={item.image} alt={item.name ?? item.nameKey} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35 }}>{item.name ?? item.nameKey}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: checkout.muted }}>{t('checkout.qty', { count: item.quantity })}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{item.total}</Typography>
          </Stack>
        ))}
      </Stack>

      {gifts.length > 0 ? (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: checkout.link }}>{t('checkout.freeKits')}</Typography>
          {gifts.map((gift) => (
            <Stack
              key={gift.name}
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: 'center',
                p: 1,
                borderRadius: '12px',
                border: `1.5px dashed ${checkout.link}`,
                bgcolor: 'rgba(47, 125, 83, 0.08)',
              }}
            >
              <Thumb src={gift.image} alt={gift.name} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{gift.name}</Typography>
              </Box>
              <Stack spacing={0} sx={{ alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: checkout.link }}>{t('pdp.bonus.free')}</Typography>
                {gift.compareAt ? (
                  <Typography sx={{ fontSize: '0.75rem', color: checkout.muted, textDecoration: 'line-through' }}>{gift.compareAt}</Typography>
                ) : null}
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : null}

      <Stack spacing={0.75}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: checkout.muted }}>{t('order.shippingTo')}</Typography>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{order.shipping.name}</Typography>
        {order.phone ? <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>{order.phone}</Typography> : null}
        <Typography sx={{ fontSize: '0.875rem', color: checkout.text, lineHeight: 1.55 }}>{addressLines.join(', ')}</Typography>
      </Stack>

      <Stack spacing={0.85}>
        <Row label={t('cart.subtotal', { count: order.items })} value={order.subtotal} />
        <Row label={t('cart.shipping')} value={order.shippingCost} />
        {order.tax && order.tax !== '€0.00' ? (
          <Row label={order.taxRate ? t('cart.vatRate', { rate: order.taxRate }) : t('cart.vat')} value={order.tax} />
        ) : null}
        <Divider sx={{ borderColor: checkout.border }} />
        <Row label={t('cart.total')} value={order.total} strong />
        <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted, pt: 0.25 }}>
          {t(`checkout.paymentMethods.${order.paymentMethod}`)}
          {order.paymentMethod === 'card' ? ` · ${t('checkout.stripe')}` : ''}
        </Typography>
      </Stack>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<FileDownloadRounded />}
        onClick={() => { void downloadOrderSheet(order, t, language) }}
        sx={{ ...primaryButtonSx, bgcolor: '#fff', color: checkout.text, borderColor: checkout.border, '&:hover': { bgcolor: '#F4F5F0', borderColor: checkout.border, boxShadow: 'none' } }}
      >
        {t('order.download')}
      </Button>
      <Button component={RouterLink} to="/" variant="contained" fullWidth sx={primaryButtonSx}>
        {t('order.continueShopping')}
      </Button>
      <Button
        component={RouterLink}
        to={navHrefs.pods}
        variant="text"
        sx={{ alignSelf: 'center', color: checkout.link, textTransform: 'none', fontWeight: 600 }}
      >
        {t('cart.continueShopping')}
      </Button>
    </Stack>
  )
}

function Thumb({ src, alt }: { src?: string; alt: string }) {
  return (
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: '10px',
        border: `1px solid ${checkout.border}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {src ? <MediaImg src={src} preset="thumb" alt={alt} sx={{ width: '86%', height: '86%', objectFit: 'contain', display: 'block' }} /> : null}
    </Box>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Typography sx={{ fontSize: strong ? '0.9375rem' : '0.8125rem', fontWeight: strong ? 700 : 500, color: strong ? checkout.text : checkout.muted }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: strong ? '1.125rem' : '0.875rem', fontWeight: 700 }}>{value}</Typography>
    </Stack>
  )
}

const primaryButtonSx = {
  minHeight: 48,
  borderRadius: '12px',
  fontSize: '0.9375rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  bgcolor: checkout.link,
  '&:hover': { bgcolor: '#1F5A3B', boxShadow: 'none' },
} as const
