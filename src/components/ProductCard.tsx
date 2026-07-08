import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { brand, carouselCardWidth } from '../theme'

export type ProductCardData = {
  id: string
  name: string
  price: string
  compareAt?: string
  image: string
  pack?: string
  tagline?: string
  imageFit?: 'cover' | 'contain'
}

type ProductCardProps = {
  product: ProductCardData
  width?: number | string
  layout?: 'carousel' | 'grid'
  /** When set, the card image and title link to this route */
  to?: string
  onAddToCart?: (e: React.MouseEvent) => void
}

function toFlexBasis(width: number | string) {
  return typeof width === 'number' ? `${width}px` : width
}

export default function ProductCard({ product, width, layout = 'carousel', to, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation()
  const basis = toFlexBasis(width ?? carouselCardWidth.xs)
  const basisSm = toFlexBasis(typeof width === 'number' ? width : carouselCardWidth.sm)
  const basisMd = toFlexBasis(typeof width === 'number' ? width : `${carouselCardWidth.md}px`)

  return (
    <Box
      data-scroll-item={layout === 'carousel' ? true : undefined}
      sx={{
        ...(layout === 'carousel'
          ? {
              flex: { xs: `0 0 ${basis}`, sm: `0 0 ${basisSm}`, md: `0 0 ${basisMd}` },
              scrollSnapAlign: 'start',
              maxWidth: { xs: carouselCardWidth.xs, sm: carouselCardWidth.sm },
            }
          : { width: '100%', p: 2 }),
      }}
    >
      <Box
        className="product-card-wrap"
        {...(to ? { component: RouterLink, to } : {})}
        sx={{
          position: 'relative',
          display: 'block',
          bgcolor: brand.white,
          borderRadius: 4,
          overflow: 'hidden',
          aspectRatio: '1',
          mb: 1.75,
          border: `1px solid ${brand.border}`,
          transition: 'box-shadow 0.28s ease, transform 0.28s ease, border-color 0.28s ease',
          '& img': { transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)' },
          '@media (hover: hover)': {
            '&:hover': {
              boxShadow: brand.shadowHover,
              transform: 'translateY(-6px)',
              borderColor: brand.plantGreenLight,
            },
            '&:hover img': { transform: 'scale(1.06)' },
          },
        }}
      >
        <Box
          component="img"
          src={product.image}
          alt={product.name}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: product.imageFit ?? 'contain',
            display: 'block',
            p: (product.imageFit ?? 'contain') === 'contain' ? 1.5 : 0,
            boxSizing: 'border-box',
          }}
        />
        {!to && (
          <IconButton
            className="cart-btn"
            aria-label={t('common.addToCartAria', { name: product.name })}
            onClick={onAddToCart}
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              bgcolor: brand.plantGreen,
              color: brand.white,
              opacity: 1,
              '@media (hover: hover)': {
                opacity: 0,
              },
              '.product-card-wrap:hover &': {
                '@media (hover: hover)': { opacity: 1 },
              },
              '&:hover': { bgcolor: brand.plantGreenDark },
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      <Stack spacing={0.35} sx={{ px: 0.25 }}>
        <Typography
          {...(to ? { component: RouterLink, to } : {})}
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.9rem', sm: '0.95rem' },
            lineHeight: 1.35,
            color: 'inherit',
            textDecoration: 'none',
            '@media (hover: hover)': { '&:hover': to ? { color: brand.plantGreenDark } : {} },
          }}
        >
          {product.name}
        </Typography>
        {product.pack && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {product.pack}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pt: 0.25, flexWrap: 'wrap' }}>
          <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.05rem' }, color: brand.plantGreenDark }}>{product.price}</Typography>
          {product.compareAt && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: '0.85rem' }}>
              {product.compareAt}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
