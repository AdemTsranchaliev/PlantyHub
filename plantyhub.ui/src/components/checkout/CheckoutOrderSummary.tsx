import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import { useTranslation } from 'react-i18next'
import type { CartItem } from '../../store/cart'
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
}

function lineTotal(item: CartItem) {
  return formatEuro(parseEuro(item.price) * item.quantity)
}

function LineItem({ item }: { item: CartItem }) {
  const { t } = useTranslation()
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
        {item.gift && (
          <Typography sx={{ fontSize: '0.6875rem', color: checkout.link, fontWeight: 600, mt: 0.25 }}>
            {t('cart.freeGift')}: {item.gift.name}
          </Typography>
        )}
      </Box>
      <Stack spacing={0} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: checkout.text }}>
          {lineTotal(item)}
        </Typography>
        {item.gift && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: checkout.link }}>
              {t('pdp.bonus.free')}
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: checkout.muted, textDecoration: 'line-through' }}>
              {item.gift.compareAt}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

function Totals({ itemCount, subtotalLabel, shippingLabel, totalLabel, freeShipping, taxLabel, taxHint, discountLabel }: SummaryProps) {
  const { t } = useTranslation()

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
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.8125rem', color: checkout.muted }}>{t('cart.shipping')}</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: freeShipping ? checkout.link : checkout.text }}>
          {freeShipping ? t('cart.freeShipping') : shippingLabel}
        </Typography>
      </Stack>
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

export function CheckoutOrderSummary(props: SummaryProps) {
  return (
    <Stack spacing={2}>
      <Stack spacing={1.5}>
        {props.items.map((item) => (
          <LineItem key={item.key} item={item} />
        ))}
      </Stack>
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
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 2 }}>
          <CheckoutOrderSummary {...summary} totalLabel={totalLabel} />
        </Box>
      </Collapse>
    </Box>
  )
}
