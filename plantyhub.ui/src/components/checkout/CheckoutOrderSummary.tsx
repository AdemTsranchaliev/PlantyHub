import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import { useTranslation } from 'react-i18next'
import type { CartGift, CartItem } from '../../store/cart'
import { formatEuro, parseEuro, FREE_SHIPPING_THRESHOLD } from '../../utils/price'
import MediaImg from '../MediaImg'

export const checkout = {
  bg: '#FFFFFF',
  sidebar: '#F5F5F3',
  border: '#E3E5E0',
  text: '#1C231E',
  muted: '#6B6F6C',
  link: '#2F7D53',
  inputBorder: '#D4D7D2',
} as const

type SummaryProps = {
  items: CartItem[]
  itemCount: number
  subtotalLabel: string
  shippingLabel: string
  totalLabel: string
  freeShipping: boolean
  taxLabel?: string | null
  taxHint?: string | null
  discountLabel?: string | null
  codFeeLabel?: string | null
  codPercent?: string | null
  deliveryTotalLabel?: string | null
  promo: PromoControls
}

export type PromoControls = {
  input: string
  busy: boolean
  error: string | null
  appliedCode: string | null
  onInput: (value: string) => void
  onApply: () => void
  onClear: () => void
}

function lineTotal(item: CartItem) {
  return formatEuro(parseEuro(item.price) * item.quantity)
}

function LineItem({ item }: { item: CartItem }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '6px',
            border: `1px solid ${checkout.border}`,
            bgcolor: '#fff',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MediaImg
            src={item.image}
            preset="thumb"
            alt={item.name}
            sx={{ width: '88%', height: '88%', objectFit: 'contain', display: 'block' }}
          />
        </Box>
        <Box
          data-clarity-unmask="true"
          sx={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: '999px',
            bgcolor: 'rgba(28, 35, 30, 0.85)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {item.quantity}
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.35, color: checkout.text }}>
          {item.name}
        </Typography>
        {item.pack && (
          <Typography sx={{ fontSize: '0.6875rem', color: checkout.muted }}>{item.pack}</Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: checkout.text, flexShrink: 0 }}>
        {lineTotal(item)}
      </Typography>
    </Stack>
  )
}

function MoneyRow({ label, value, hint = false }: { label: string; value: string; hint?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
      <Typography sx={{ fontSize: hint ? '0.75rem' : '0.8125rem', color: checkout.muted, pl: hint ? 1.25 : 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: hint ? '0.75rem' : '0.8125rem', color: hint ? checkout.muted : checkout.text, flexShrink: 0 }}>{value}</Typography>
    </Stack>
  )
}

function Totals({ itemCount, subtotalLabel, shippingLabel, totalLabel, freeShipping, taxLabel, taxHint, discountLabel, codFeeLabel, codPercent, deliveryTotalLabel }: SummaryProps) {
  const { t } = useTranslation()
  const courierLabel = freeShipping ? t('cart.freeShipping') : shippingLabel

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>
          {t('cart.subtotal', { count: itemCount })}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: checkout.text }}>{subtotalLabel}</Typography>
      </Stack>
      {discountLabel ? (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>{t('checkout.discount')}</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: checkout.link, fontWeight: 600 }}>{discountLabel}</Typography>
        </Stack>
      ) : null}
      {codFeeLabel ? (
        <Stack spacing={0.35}>
          <MoneyRow label={t('cart.shipping')} value={deliveryTotalLabel ?? shippingLabel} />
          <MoneyRow label={t('checkout.courier')} value={courierLabel} hint />
          <MoneyRow label={t('checkout.codFeeRate', { percent: codPercent ?? '' })} value={codFeeLabel} hint />
        </Stack>
      ) : (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>{t('cart.shipping')}</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: freeShipping ? checkout.link : checkout.text }}>{courierLabel}</Typography>
        </Stack>
      )}
      {!freeShipping && (
        <Typography sx={{ fontSize: '0.6875rem', color: checkout.muted }}>
          {t('cart.freeShippingHint', { amount: `€${FREE_SHIPPING_THRESHOLD}` })}
        </Typography>
      )}
      {taxLabel ? (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>{t('cart.vat')}</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: checkout.text }}>{taxLabel}</Typography>
        </Stack>
      ) : null}
      {taxHint ? (
        <Typography sx={{ fontSize: '0.6875rem', color: checkout.muted }}>{taxHint}</Typography>
      ) : null}
      <Divider sx={{ borderColor: checkout.border, my: 0.25 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: checkout.text }}>{t('cart.total')}</Typography>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, color: checkout.text, letterSpacing: '-0.01em' }}>
          {totalLabel}
        </Typography>
      </Stack>
    </Stack>
  )
}

function GiftLine({ gift }: { gift: CartGift }) {
  const { t } = useTranslation()
  return (
    <Stack
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
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '8px',
          bgcolor: '#fff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MediaImg src={gift.image} preset="thumb" alt="" sx={{ width: '86%', height: '86%', objectFit: 'contain', display: 'block' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: checkout.text, lineHeight: 1.3 }}>
          {gift.name}
        </Typography>
      </Box>
      <Stack spacing={0} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: checkout.link }}>{t('pdp.bonus.free')}</Typography>
        {gift.compareAt ? (
          <Typography sx={{ fontSize: '0.75rem', color: checkout.muted, textDecoration: 'line-through' }}>
            {gift.compareAt}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  )
}

function PromoField({ promo }: { promo: PromoControls }) {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: checkout.muted, mb: 0.75 }}>
        {t('checkout.promo')}
      </Typography>
      {promo.appliedCode ? (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 1.25,
            py: 1,
            borderRadius: '12px',
            border: `1.5px solid ${checkout.link}`,
            bgcolor: 'rgba(47, 125, 83, 0.08)',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: checkout.text }}>{promo.appliedCode}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: checkout.link, fontWeight: 600 }}>
              {t('checkout.promoApplied', { code: promo.appliedCode })}
            </Typography>
          </Box>
          <Button
            type="button"
            onClick={promo.onClear}
            sx={{ flexShrink: 0, minWidth: 0, px: 1, color: checkout.muted, textTransform: 'none', fontWeight: 600 }}
          >
            {t('cart.remove')}
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder={t('checkout.promoCode')}
            value={promo.input}
            onChange={(event) => promo.onInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              promo.onApply()
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 40,
                borderRadius: '10px',
                bgcolor: '#fff',
                fontSize: '16px',
                '& fieldset': { borderColor: checkout.inputBorder },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover fieldset': { borderColor: '#A8ACA6' },
                },
                '&.Mui-focused fieldset': { borderColor: checkout.link, borderWidth: 1 },
              },
              '& .MuiOutlinedInput-input': {
                py: 0.85,
                px: 1.25,
                fontSize: '16px',
                scrollMarginTop: '20px',
                scrollMarginBottom: '30vh',
              },
            }}
          />
          <Button
            type="button"
            variant="outlined"
            disabled={promo.busy || !promo.input.trim()}
            onClick={promo.onApply}
            sx={{
              flexShrink: 0,
              minHeight: 40,
              px: 1.75,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: checkout.inputBorder,
              color: checkout.text,
              bgcolor: '#fff',
            }}
          >
            {t('checkout.promoApply')}
          </Button>
        </Stack>
      )}
      {promo.error ? (
        <Typography sx={{ color: '#C62828', fontSize: '0.75rem', fontWeight: 600, mt: 0.75 }}>{promo.error}</Typography>
      ) : null}
    </Box>
  )
}

export function CheckoutOrderSummary(props: SummaryProps) {
  const { t } = useTranslation()
  const gifts = props.items.flatMap((item) => (item.gift ? [item.gift] : []))

  return (
    <Stack spacing={2.25}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: checkout.text }}>{t('checkout.orderSummary')}</Typography>
      <Stack spacing={1.5}>
        {props.items.map((item) => (
          <LineItem key={item.key} item={item} />
        ))}
      </Stack>
      {gifts.length > 0 ? (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: checkout.link, letterSpacing: '0.02em' }}>
            {t('checkout.freeKits')}
          </Typography>
          {props.items
            .filter((item) => item.gift)
            .map((item) => (
              <GiftLine key={item.key} gift={item.gift!} />
            ))}
        </Stack>
      ) : null}
      <PromoField promo={props.promo} />
      <Totals {...props} />
    </Stack>
  )
}

type MobileSummaryProps = SummaryProps & {
  open: boolean
  onToggle: () => void
}

export function MobileOrderSummary({ open, onToggle, totalLabel, ...summary }: MobileSummaryProps) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        bgcolor: checkout.sidebar,
        borderBottom: `1px solid ${checkout.border}`,
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={onToggle}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1.75,
          minHeight: 52,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: checkout.link }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: checkout.link }}>
            {open ? t('checkout.hideOrderSummary') : t('checkout.showOrderSummary')}
          </Typography>
          <ExpandMoreRounded
            sx={{
              fontSize: 20,
              color: checkout.link,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </Stack>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: checkout.text }}>{totalLabel}</Typography>
      </Box>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <CheckoutOrderSummary {...summary} totalLabel={totalLabel} />
        </Box>
      </Collapse>
    </Box>
  )
}
