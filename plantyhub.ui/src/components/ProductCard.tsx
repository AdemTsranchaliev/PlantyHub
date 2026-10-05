import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import SpaOutlined from '@mui/icons-material/SpaOutlined'
import CircleOutlined from '@mui/icons-material/CircleOutlined'
import WaterDropOutlined from '@mui/icons-material/WaterDropOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { GrowingDifficulty } from '../store/products'
import { brand, carouselCardWidth } from '../theme'
import GrowingDifficultyBadge from './GrowingDifficultyBadge'
import MediaImg from './MediaImg'

export type ProductCardData = {
  id: string
  name: string
  price: string
  compareAt?: string
  image: string
  pack?: string
  includes?: { pods: number; caps: number; nutrientMl: number }
  tagline?: string
  imageFit?: 'cover' | 'contain'
  growingDifficulty?: GrowingDifficulty
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
          : { width: '100%', p: { xs: 0.75, sm: 2 } }),
      }}
    >
      <Box
        className="product-card-wrap"
        {...(to ? { component: RouterLink, to } : {})}
        sx={{
          position: 'relative',
          display: 'block',
          bgcolor: brand.white,
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          aspectRatio: '1',
          mb: { xs: 1.15, sm: 1.75 },
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
        <MediaImg
          src={product.image}
          preset="card"
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
            fontSize: { xs: '0.82rem', sm: '0.95rem' },
            lineHeight: 1.3,
            color: 'inherit',
            textDecoration: 'none',
            '@media (hover: hover)': { '&:hover': to ? { color: brand.plantGreenDark } : {} },
          }}
        >
          {product.name}
        </Typography>
        {product.growingDifficulty && <GrowingDifficultyBadge difficulty={product.growingDifficulty} />}
        {product.includes ? (
          <Stack direction="row" spacing={0.5} sx={{ pt: 0.25, flexWrap: 'nowrap' }}>
            {[
              { key: 'pods', Icon: SpaOutlined, text: String(product.includes.pods) },
              { key: 'caps', Icon: CircleOutlined, text: String(product.includes.caps) },
              { key: 'nutrient', Icon: WaterDropOutlined, text: `${product.includes.nutrientMl} ml` },
            ].map(({ key, Icon, text }) => (
              <Stack
                key={key}
                direction="row"
                spacing={0.35}
                sx={{ alignItems: 'center', px: 0.7, py: 0.25, borderRadius: 999, bgcolor: brand.plantGreenMuted, color: brand.plantGreenDark }}
              >
                <Icon sx={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.2 }}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        ) : product.pack ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {product.pack}
          </Typography>
        ) : null}
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
