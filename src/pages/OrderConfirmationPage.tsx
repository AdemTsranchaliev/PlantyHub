import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { getOrderDetail } from '../store/orders'
import { brand } from '../theme'

export default function OrderConfirmationPage() {
  const { t } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const order = orderId ? getOrderDetail(orderId) : undefined

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (!order) {
    return (
      <SectionContainer py={{ xs: 6, md: 10 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {t('order.notFound')}
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          {t('order.backHome')}
        </Button>
      </SectionContainer>
    )
  }

  return (
    <main>
      <SectionContainer py={{ xs: 4, sm: 5, md: 7 }}>
        <Reveal sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 4, md: 6 } }}>
          <CheckCircleRounded sx={{ fontSize: 64, color: brand.plantGreen, mb: 2 }} />
          <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: 1.5 }}>
            {t('order.successTitle')}
          </Typography>
          <Typography sx={{ color: brand.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, mb: 1 }}>
            {t('order.successSubtitle', { email: order.email })}
          </Typography>
          <Typography sx={{ fontWeight: 800, color: brand.plantGreenDark, fontSize: '1.1rem' }}>
            {t('order.orderNumber', { id: order.id })}
          </Typography>
        </Reveal>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '20px', border: `1px solid ${brand.border}`, mb: 3 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                <LocalShippingOutlined sx={{ color: brand.plantGreen }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {t('order.shippingTo')}
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{order.shipping.name}</Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {order.shipping.street}
                <br />
                {order.shipping.postalCode} {order.shipping.city}
                <br />
                {t(`checkout.countries.${order.shipping.country}`)}
              </Typography>
            </Reveal>

            <Reveal sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '20px', border: `1px solid ${brand.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                {t('order.items')}
              </Typography>
              <Stack spacing={2}>
                {order.lineItems.map((item) => (
                  <Stack key={item.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.nameKey}
                      sx={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'contain', bgcolor: brand.surface }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{item.name ?? item.nameKey}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('checkout.qty', { count: item.quantity })}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>{item.total}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Reveal
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '24px',
                border: `1px solid ${brand.border}`,
                bgcolor: brand.surface,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                {t('order.summary')}
              </Typography>
              <Stack spacing={1.25}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">{t('cart.subtotal', { count: order.items })}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{order.subtotal}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">{t('cart.shipping')}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{order.shippingCost}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 800 }}>{t('cart.total')}</Typography>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: brand.plantGreenDark }}>
                    {order.total}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                  {t(`checkout.paymentMethods.${order.paymentMethod}`)}
                </Typography>
              </Stack>
              <Button variant="contained" size="large" fullWidth component={RouterLink} to="/" sx={{ mt: 3, fontWeight: 800 }}>
                {t('order.continueShopping')}
              </Button>
              <Button variant="text" fullWidth component={RouterLink} to={navHrefs.pods} sx={{ mt: 1, fontWeight: 700 }}>
                {t('cart.continueShopping')}
              </Button>
            </Reveal>
          </Grid>
        </Grid>
      </SectionContainer>
    </main>
  )
}
