import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useTranslation } from 'react-i18next'
import SectionContainer, { pagePaddingX } from '../components/SectionContainer'
import Reveal from '../components/Reveal'
import { navHrefs } from '../data/catalog'
import { useCart } from '../hooks/useCart'
import { cartTrackingItems, trackViewCart } from '../measure/commerce'
import MediaImg from '../components/MediaImg'
import type { CartItem } from '../store/cart'
import { formatEuro, parseEuro, FREE_SHIPPING_THRESHOLD } from '../utils/price'
import { brand } from '../theme'

const displayFont = '"Fraunces", Georgia, serif'

function LinePrice({ item, align = 'right' }: { item: CartItem; align?: 'right' | 'left' }) {
  const line = formatEuro(parseEuro(item.price) * item.quantity)

  return (
    <Box sx={{ textAlign: align, flexShrink: 0 }}>
      <Typography sx={{ fontFamily: displayFont, fontWeight: 600, fontSize: '1.05rem', color: brand.plantGreenDark, lineHeight: 1.15 }}>
        {line}
      </Typography>
      {item.quantity > 1 && (
        <Typography sx={{ fontSize: '0.72rem', color: brand.textSecondary, fontWeight: 600, mt: 0.25, whiteSpace: 'nowrap' }}>
          {item.price} × {item.quantity}
        </Typography>
      )}
    </Box>
  )
}

function QtyStepper({ quantity, onChange }: { quantity: number; onChange: (next: number) => void }) {
  const { t } = useTranslation()

  return (
    <Stack
      data-clarity-unmask="true"
      direction="row"
      sx={{
        alignItems: 'center',
        height: 36,
        border: `1px solid ${brand.border}`,
        borderRadius: 999,
        bgcolor: brand.surface,
        flexShrink: 0,
      }}
    >
      <IconButton
        aria-label={t('cart.decrease')}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        sx={{ width: 36, height: 36 }}
      >
        <RemoveRounded sx={{ fontSize: 18 }} />
      </IconButton>
      <Typography sx={{ minWidth: 22, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
        {quantity}
      </Typography>
      <IconButton aria-label={t('cart.increase')} onClick={() => onChange(quantity + 1)} sx={{ width: 36, height: 36 }}>
        <AddRounded sx={{ fontSize: 18 }} />
      </IconButton>
    </Stack>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()

  return (
    <IconButton
      aria-label={t('cart.remove')}
      onClick={onClick}
      sx={{ width: 36, height: 36, color: brand.textSecondary, '&:hover': { color: '#8E3B3B' } }}
    >
      <DeleteOutlineRounded sx={{ fontSize: 20 }} />
    </IconButton>
  )
}

function GiftChip({ gift }: { gift: CartItem['gift'] }) {
  const { t } = useTranslation()
  if (!gift) return null

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: 'center',
        pl: 0.5,
        pr: 1,
        py: 0.5,
        borderRadius: '10px',
        border: `1px dashed ${brand.plantGreen}`,
        bgcolor: brand.plantGreenMuted,
        minWidth: 0,
        maxWidth: { sm: 420 },
      }}
    >
      <MediaImg
        src={gift.image}
        preset="thumb"
        alt=""
        sx={{ width: 28, height: 28, borderRadius: '7px', objectFit: 'contain', bgcolor: brand.white, flexShrink: 0 }}
      />
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontSize: '0.8rem',
          color: brand.graphite,
          lineHeight: 1.25,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {gift.name}
      </Typography>
      <Typography sx={{ flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: brand.plantGreen, whiteSpace: 'nowrap' }}>
        {t('pdp.bonus.free')}
      </Typography>
      {gift.compareAt ? (
        <Typography sx={{ flexShrink: 0, fontSize: '0.72rem', color: brand.textSecondary, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
          {gift.compareAt}
        </Typography>
      ) : null}
    </Stack>
  )
}

function CartLine({ item, onQuantity, onRemove }: { item: CartItem; onQuantity: (next: number) => void; onRemove: () => void }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '72px minmax(0, 1fr)', sm: '92px minmax(0, 1fr) auto' },
        columnGap: { xs: 1.5, sm: 2.25 },
        rowGap: 0.75,
        alignItems: item.gift ? 'start' : 'center',
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 1.75 },
      }}
    >
      <MediaImg
        src={item.image}
        preset="thumb"
        alt={item.name}
        sx={{
          width: { xs: 72, sm: 92 },
          height: { xs: 72, sm: 92 },
          objectFit: item.imageFit ?? 'contain',
          borderRadius: '12px',
          bgcolor: brand.surface,
          border: `1px solid ${brand.border}`,
        }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1rem' }, color: brand.graphite, lineHeight: 1.3 }}>
              {item.name}
            </Typography>
            {item.pack && (
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.78rem', color: brand.textSecondary, fontWeight: 600, mt: 0.25 }}>
                {item.pack}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: { sm: 'none' } }}>
            <LinePrice item={item} />
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: brand.textSecondary, fontWeight: 600, minWidth: 0 }}>
            {item.pack ?? ''}
          </Typography>
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <QtyStepper quantity={item.quantity} onChange={onQuantity} />
            <RemoveButton onClick={onRemove} />
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={0.75} sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'flex-end' }}>
        <LinePrice item={item} />
        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
          <QtyStepper quantity={item.quantity} onChange={onQuantity} />
          <RemoveButton onClick={onRemove} />
        </Stack>
      </Stack>

      {item.gift ? (
        <Box sx={{ gridColumn: { xs: '1 / -1', sm: '2 / 3' }, minWidth: 0 }}>
          <GiftChip gift={item.gift} />
        </Box>
      ) : null}
    </Box>
  )
}

function ShippingMeter({ subtotal, freeShipping }: { subtotal: number; freeShipping: boolean }) {
  const { t } = useTranslation()
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const remaining = formatEuro(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))
  const before = t('cart.freeShippingBefore')

  return (
    <Box sx={{ mb: 1.75 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 0.85 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: brand.plantGreenMuted,
            color: brand.plantGreenDark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LocalShippingOutlined sx={{ fontSize: 17 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.15, color: brand.graphite }}>
            {freeShipping ? (
              <Box component="span" sx={{ fontWeight: 700 }}>{t('cart.freeShippingReached')}</Box>
            ) : (
              <>
                {before ? <>{before}{' '}</> : null}
                <Box component="span" sx={{ fontFamily: displayFont, fontWeight: 600, fontSize: '1.2rem', color: brand.plantGreenDark }}>
                  {remaining}
                </Box>
              </>
            )}
          </Typography>
          {!freeShipping && (
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: brand.textSecondary, lineHeight: 1.3, mt: 0.15 }}>
              {t('cart.freeShippingAfter')}
            </Typography>
          )}
        </Box>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={freeShipping ? 100 : progress}
        aria-label={freeShipping ? t('cart.freeShippingReached') : t('cart.freeShippingLeft', { amount: remaining })}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: freeShipping ? 'rgba(47, 125, 83, 0.16)' : 'rgba(28, 35, 30, 0.08)',
          '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: brand.plantGreen },
        }}
      />
    </Box>
  )
}

export default function CartPage() {
  const { t } = useTranslation()
  const { items, itemCount, subtotal, subtotalLabel, freeShipping, updateQuantity, removeItem } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0 })
    trackViewCart(cartTrackingItems(items))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box component="main" sx={{ bgcolor: brand.beige, minHeight: '60vh' }}>
      <SectionContainer bgcolor="transparent" py={{ xs: 2.5, sm: 3.5, md: 4.5 }}>
        <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: { xs: 2, md: 2.5 } }}>
            <Link component={RouterLink} to="/" underline="hover" sx={{ color: brand.textSecondary, fontSize: '0.82rem', fontWeight: 600 }}>
              {t('pdp.home')}
            </Link>
            <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
            <Typography sx={{ color: brand.graphite, fontSize: '0.82rem', fontWeight: 700 }}>
              {t('cart.title')}
            </Typography>
          </Stack>

          {items.length === 0 ? (
            <Reveal
              sx={{
                textAlign: 'center',
                py: { xs: 7, md: 9 },
                px: 3,
                borderRadius: '28px',
                border: `1px solid ${brand.border}`,
                bgcolor: brand.white,
                boxShadow: brand.shadow,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: '50%',
                  bgcolor: brand.plantGreenMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 34, color: brand.plantGreen }} />
              </Box>
              <Typography component="h1" sx={{ fontFamily: displayFont, fontWeight: 600, fontSize: { xs: '1.7rem', md: '2rem' }, color: brand.graphite, mb: 1 }}>
                {t('cart.emptyTitle')}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
                {t('cart.emptySubtitle')}
              </Typography>
              <Button variant="contained" size="large" component={RouterLink} to={navHrefs.pods}>
                {t('cart.continueShopping')}
              </Button>
            </Reveal>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: { xs: 2, md: 2.5 }, gap: 2 }}
              >
                <Typography component="h1" sx={{ fontFamily: displayFont, fontWeight: 600, fontSize: { xs: '1.85rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: brand.graphite, lineHeight: 1.05 }}>
                  {t('cart.title')}
                  <Box
                    component="span"
                    sx={{
                      ml: 1.25,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 28,
                      height: 28,
                      px: 0.75,
                      borderRadius: 999,
                      bgcolor: brand.plantGreen,
                      color: brand.white,
                      fontFamily: '"Nunito Sans", "Helvetica Neue", Arial, sans-serif',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      verticalAlign: 'middle',
                      position: 'relative',
                      top: -2,
                    }}
                  >
                    {itemCount}
                  </Box>
                </Typography>
                <Link
                  component={RouterLink}
                  to={navHrefs.pods}
                  underline="hover"
                  sx={{ display: { xs: 'none', sm: 'inline' }, color: brand.plantGreenDark, fontWeight: 700, fontSize: '0.88rem', mb: 0.5, flexShrink: 0 }}
                >
                  {t('cart.continueShopping')}
                </Link>
              </Stack>

              <Grid container spacing={{ xs: 2.5, md: 3 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <ShippingMeter subtotal={subtotal} freeShipping={freeShipping} />
                  <Box
                    sx={{
                      borderRadius: '20px',
                      border: `1px solid ${brand.border}`,
                      bgcolor: brand.white,
                      boxShadow: brand.shadow,
                      overflow: 'hidden',
                      '& > * + *': { borderTop: `1px solid ${brand.border}` },
                    }}
                  >
                    {items.map((item) => (
                      <CartLine
                        key={item.key}
                        item={item}
                        onQuantity={(next) => updateQuantity(item.key, next)}
                        onRemove={() => removeItem(item.key)}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                  <Box
                    sx={{
                      position: { lg: 'sticky' },
                      top: { lg: 88 },
                      p: { xs: 2.25, sm: 2.75 },
                      borderRadius: '20px',
                      border: `1px solid ${brand.border}`,
                      bgcolor: brand.white,
                      boxShadow: brand.shadow,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: brand.graphite, mb: 2 }}>
                      {t('cart.summary')}
                    </Typography>
                    <Stack spacing={1.15}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ color: brand.textSecondary, fontSize: '0.92rem' }}>{t('cart.subtotal', { count: itemCount })}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{subtotalLabel}</Typography>
                      </Stack>
                      <Box>
                        <Typography sx={{ color: brand.textSecondary, fontSize: '0.92rem' }}>{t('cart.shipping')}</Typography>
                        <Typography sx={{ mt: 0.35, fontWeight: 700, fontSize: '0.84rem', lineHeight: 1.35, color: freeShipping ? brand.plantGreenDark : brand.graphite }}>
                          {freeShipping ? t('cart.freeShipping') : t('cart.shippingLater')}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 0.25 }} />
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', pt: 0.25 }}>
                        <Typography sx={{ fontWeight: 800 }}>{t('cart.total')}</Typography>
                        <Typography sx={{ fontFamily: displayFont, fontWeight: 600, fontSize: '1.55rem', color: brand.plantGreenDark, lineHeight: 1 }}>
                          {subtotalLabel}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      component={RouterLink}
                      to={navHrefs.checkout}
                      sx={{ display: { xs: 'none', lg: 'inline-flex' }, mt: 2.5, fontWeight: 800 }}
                    >
                      {t('cart.checkout')}
                    </Button>
                    <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'center', mt: 1.25 }}>
                      <LockOutlined sx={{ fontSize: 14, color: brand.textSecondary }} />
                      <Typography sx={{ fontSize: '0.72rem', color: brand.textSecondary, fontWeight: 600, textAlign: 'center' }}>
                        {t('checkout.secureCheckout')}
                      </Typography>
                    </Stack>
                    <Button variant="text" fullWidth component={RouterLink} to={navHrefs.pods} sx={{ mt: { xs: 0.5, lg: 0.75 }, fontWeight: 700 }}>
                      {t('cart.continueShopping')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ height: { xs: 84, lg: 0 } }} />

              <Box
                sx={{
                  display: { xs: 'block', lg: 'none' },
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 30,
                  bgcolor: 'rgba(255,255,255,0.96)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  borderTop: `1px solid ${brand.border}`,
                  boxShadow: '0 -10px 30px rgba(28, 35, 30, 0.06)',
                  px: pagePaddingX,
                  pt: 1,
                  pb: 'calc(10px + env(safe-area-inset-bottom))',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', maxWidth: 1120, mx: 'auto' }}>
                  <Box sx={{ minWidth: 92 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: brand.textSecondary, letterSpacing: '0.02em' }}>
                      {t('cart.total')}
                    </Typography>
                    <Typography sx={{ fontFamily: displayFont, fontWeight: 600, fontSize: '1.25rem', color: brand.plantGreenDark, lineHeight: 1.1 }}>
                      {subtotalLabel}
                    </Typography>
                  </Box>
                  <Button variant="contained" size="large" fullWidth component={RouterLink} to={navHrefs.checkout} sx={{ fontWeight: 800 }}>
                    {t('cart.checkout')}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </SectionContainer>
    </Box>
  )
}
