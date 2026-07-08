import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { useCart } from '../hooks/useCart'
import { FREE_SHIPPING_THRESHOLD } from '../utils/price'
import { brand } from '../theme'

export default function CartPage() {
  const { t } = useTranslation()
  const { items, itemCount, subtotalLabel, shippingLabel, totalLabel, freeShipping, updateQuantity, removeItem } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main>
      <SectionContainer py={{ xs: 3, sm: 4, md: 5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
            {t('pdp.home')}
          </Link>
          <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
          <Typography sx={{ color: brand.graphite, fontSize: '0.85rem', fontWeight: 700 }}>
            {t('cart.title')}
          </Typography>
        </Stack>

        <Typography component="h1" variant="h2" sx={{ color: brand.graphite, mb: { xs: 3, md: 4 } }}>
          {t('cart.title')}
        </Typography>

        {items.length === 0 ? (
          <Reveal
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              px: 3,
              borderRadius: '28px',
              border: `1px dashed ${brand.border}`,
              bgcolor: brand.surface,
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 56, color: brand.plantGreen, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: brand.graphite, mb: 1 }}>
              {t('cart.emptyTitle')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, mb: 3, maxWidth: 420, mx: 'auto' }}>
              {t('cart.emptySubtitle')}
            </Typography>
            <Button variant="contained" size="large" component={RouterLink} to={navHrefs.pods}>
              {t('cart.continueShopping')}
            </Button>
          </Reveal>
        ) : (
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={2}>
                {items.map((item) => (
                  <Reveal
                    key={item.key}
                    sx={{
                      display: 'flex',
                      gap: { xs: 2, sm: 3 },
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: '20px',
                      border: `1px solid ${brand.border}`,
                      bgcolor: brand.white,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { sm: 'center' },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: { xs: '100%', sm: 96 },
                        height: { xs: 180, sm: 96 },
                        objectFit: item.imageFit ?? 'contain',
                        borderRadius: '14px',
                        bgcolor: brand.surface,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: brand.graphite, mb: 0.5 }}>
                        {item.name}
                      </Typography>
                      {item.pack && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          {item.pack}
                        </Typography>
                      )}
                      <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: brand.plantGreenDark }}>
                        {item.price}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'center', border: `1px solid ${brand.border}`, borderRadius: 999, px: 0.5 }}
                      >
                        <IconButton
                          aria-label="−"
                          size="small"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveRounded fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</Typography>
                        <IconButton aria-label="+" size="small" onClick={() => updateQuantity(item.key, item.quantity + 1)}>
                          <AddRounded fontSize="small" />
                        </IconButton>
                      </Stack>
                      <IconButton aria-label={t('cart.remove')} onClick={() => removeItem(item.key)} sx={{ color: brand.textSecondary }}>
                        <DeleteOutlineRounded />
                      </IconButton>
                    </Stack>
                  </Reveal>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Reveal
                sx={{
                  position: { lg: 'sticky' },
                  top: { lg: 96 },
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '24px',
                  border: `1px solid ${brand.border}`,
                  bgcolor: brand.surface,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: brand.graphite, mb: 2 }}>
                  {t('cart.summary')}
                </Typography>
                <Stack spacing={1.25}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">{t('cart.subtotal', { count: itemCount })}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{subtotalLabel}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">{t('cart.shipping')}</Typography>
                    <Typography sx={{ fontWeight: 700, color: freeShipping ? brand.plantGreenDark : 'inherit' }}>
                      {freeShipping ? t('cart.freeShipping') : shippingLabel}
                    </Typography>
                  </Stack>
                  {!freeShipping && (
                    <Typography variant="caption" sx={{ color: brand.textSecondary, fontWeight: 600 }}>
                      {t('cart.freeShippingHint', { amount: `€${FREE_SHIPPING_THRESHOLD}` })}
                    </Typography>
                  )}
                  <Divider sx={{ my: 0.5 }} />
                  <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 0.5 }}>
                    <Typography sx={{ fontWeight: 800 }}>{t('cart.total')}</Typography>
                    <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '1.35rem', color: brand.plantGreenDark }}>
                      {totalLabel}
                    </Typography>
                  </Stack>
                </Stack>
                <Button variant="contained" size="large" fullWidth component={RouterLink} to={navHrefs.checkout} sx={{ mt: 3, fontWeight: 800 }}>
                  {t('cart.checkout')}
                </Button>
                <Button variant="text" fullWidth component={RouterLink} to={navHrefs.pods} sx={{ mt: 1, fontWeight: 700 }}>
                  {t('cart.continueShopping')}
                </Button>
              </Reveal>
            </Grid>
          </Grid>
        )}
      </SectionContainer>
    </main>
  )
}
