import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined'
import { useTranslation } from 'react-i18next'
import HorizontalScroll from '../components/HorizontalScroll'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import { communityAvatars, communityPostIds } from '../data/catalog'
import { brand } from '../theme'

export default function CommunitySection() {
  const { t } = useTranslation()

  return (
    <SectionContainer py={{ xs: 5, sm: 7, md: 9 }} bleedX>
      <Box sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <SectionHeading title={t('community.title')} subtitle={t('community.subtitle')} />
      </Box>

      <HorizontalScroll gap={2}>
        {communityPostIds.map((id) => (
          <Box
            key={id}
            data-scroll-item
            sx={{
              flex: { xs: '0 0 min(86vw, 320px)', sm: '0 0 min(50vw, 320px)', md: '0 0 320px' },
              scrollSnapAlign: 'start',
              bgcolor: brand.surface,
              border: `1px solid ${brand.border}`,
              borderRadius: 3,
              p: { xs: 2.5, sm: 3 },
              minHeight: { xs: 200, sm: 220 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src={communityAvatars[id]}
                alt={t(`community.handles.${id}`)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${brand.plantGreenMuted}`,
                  flexShrink: 0,
                }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: brand.plantGreenDark, fontSize: '0.85rem' }}>
                @{t(`community.handles.${id}`)}
              </Typography>
            </Box>
            <FormatQuoteOutlinedIcon sx={{ color: brand.plantGreen, fontSize: 24, mb: 1, opacity: 0.6 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, flex: 1, fontSize: { xs: '0.88rem', sm: '0.9rem' } }}>
              {t(`community.posts.${id}`)}
            </Typography>
          </Box>
        ))}
      </HorizontalScroll>
    </SectionContainer>
  )
}
