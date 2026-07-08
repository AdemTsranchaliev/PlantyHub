import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useTranslation } from 'react-i18next'
import HorizontalScroll from '../components/HorizontalScroll'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import SectionLink from '../components/SectionLink'
import { navHrefs } from '../data/catalog'
import { useGardensCatalog } from '../hooks/useProducts'
import { useAddProductToCart } from '../hooks/useCart'
import { brand, carouselCardWidth } from '../theme'

export default function SleekSimpleSection() {
  const { t } = useTranslation()
  const gardens = useGardensCatalog()
  const addProductToCart = useAddProductToCart()
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})

  return (
    <SectionContainer bgcolor={brand.white} py={{ xs: 5, sm: 7, md: 9 }} bleedX>
      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionHeading eyebrow={t('sleek.eyebrow')} title={t('sleek.title')} subtitle={t('sleek.subtitle')} />
      </Box>

      <HorizontalScroll gap={2}>
        {gardens.map((garden) => (
          <Box
            key={garden.id}
            data-scroll-item
            sx={{
              flex: { xs: `0 0 ${carouselCardWidth.xs}`, sm: `0 0 ${carouselCardWidth.sm}`, md: `0 0 ${carouselCardWidth.md}px` },
              scrollSnapAlign: 'start',
              maxWidth: carouselCardWidth.xs,
            }}
          >
            <Box
              className="product-card-wrap"
              sx={{
                position: 'relative',
                bgcolor: brand.surface,
                borderRadius: 3,
                aspectRatio: '1',
                mb: 2,
                border: `1px solid ${brand.border}`,
                overflow: 'hidden',
                '@media (hover: hover)': {
                  '&:hover': { boxShadow: brand.shadowHover, transform: 'translateY(-4px)' },
                },
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}
            >
              <Box
                component="img"
                src={garden.image}
                alt={garden.name}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <IconButton
                aria-label={t('common.addToCartAria', { name: garden.name })}
                onClick={() => addProductToCart('gardens', garden)}
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: brand.plantGreen,
                  color: brand.white,
                  '&:hover': { bgcolor: brand.plantGreenDark },
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {garden.colors && garden.colors.length > 1 && (
              <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
                {garden.colors.map((color) => (
                  <Box
                    key={color.id}
                    component="button"
                    onClick={() => setSelectedColors((s) => ({ ...s, [garden.id]: color.id }))}
                    aria-label={t(color.id === 'white' ? 'common.colorWhite' : 'common.colorStandard')}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: color.hex,
                      border:
                        (selectedColors[garden.id] ?? garden.colors![0].id) === color.id
                          ? `2px solid ${brand.plantGreen}`
                          : `1px solid ${brand.border}`,
                      cursor: 'pointer',
                      p: 0,
                    }}
                  />
                ))}
              </Stack>
            )}

            <Stack spacing={0.35}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>{garden.name}</Typography>
              {garden.featured && (
                <Typography variant="caption" sx={{ color: brand.plantGreenDark, fontWeight: 700 }}>
                  {t('featured.badge')}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>{garden.price}</Typography>
                {garden.compareAt && (
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {garden.compareAt}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>
        ))}
      </HorizontalScroll>

      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionLink href={navHrefs.gardens} label={t('sleek.discoverAll')} />
      </Box>
    </SectionContainer>
  )
}
