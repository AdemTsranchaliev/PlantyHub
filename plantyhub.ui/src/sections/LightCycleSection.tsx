import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { useHt } from '../hooks/useHomepage'
import { brand } from '../theme'

function CycleSweep({ tall = false }: { tall?: boolean }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: tall ? 22 : 10,
        marginLeft: tall ? '-11px' : '-5px',
        pointerEvents: 'none',
        background: tall
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.72), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
        animation: 'cycleSweep 12s linear infinite',
        '@keyframes cycleSweep': {
          '0%': { left: '0%' },
          '100%': { left: '100%' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          left: '33%',
        },
      }}
    />
  )
}

export default function LightCycleSection() {
  const eyebrow = useHt('lightCycle.eyebrow')
  const title = useHt('lightCycle.title')
  const description = useHt('lightCycle.description')
  const onLabel = useHt('lightCycle.onLabel')
  const onDescription = useHt('lightCycle.onDescription')
  const offLabel = useHt('lightCycle.offLabel')
  const offDescription = useHt('lightCycle.offDescription')
  const diagramLabel = useHt('lightCycle.diagramLabel')
  const days = [
    useHt('lightCycle.days.0'),
    useHt('lightCycle.days.1'),
    useHt('lightCycle.days.2'),
    useHt('lightCycle.days.3'),
    useHt('lightCycle.days.4'),
    useHt('lightCycle.days.5'),
    useHt('lightCycle.days.6'),
  ]
  const todayIndex = (new Date().getDay() + 6) % 7

  return (
    <SectionContainer bgcolor={brand.white} py={{ xs: 4, sm: 6, md: 8 }}>
      <Grid data-clarity-unmask="true" container spacing={{ xs: 3.5, md: 7 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionHeading align="left" eyebrow={eyebrow} title={title} subtitle={description} />
          <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ mt: { xs: 2, sm: 3 } }}>
            <Reveal>
              <Stack direction="row" spacing={1.75} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: '50%', bgcolor: brand.plantGreenMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LightModeOutlinedIcon sx={{ color: brand.plantGreenDark }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>{onLabel}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: { xs: '0.88rem', sm: '0.875rem' } }}>{onDescription}</Typography>
                </Box>
              </Stack>
            </Reveal>
            <Reveal delay={0.08}>
              <Stack direction="row" spacing={1.75} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: '50%', bgcolor: 'rgba(34,48,31,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <NightsStayOutlinedIcon sx={{ color: brand.graphite }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>{offLabel}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: { xs: '0.88rem', sm: '0.875rem' } }}>{offDescription}</Typography>
                </Box>
              </Stack>
            </Reveal>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Reveal sx={{ bgcolor: brand.surface, borderRadius: { xs: '20px', sm: '28px' }, p: { xs: 2.25, sm: 4.5 }, border: `1px solid ${brand.border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary', mb: { xs: 2, sm: 3 }, textAlign: 'center' }}>{diagramLabel}</Typography>
            <Box sx={{ position: 'relative', borderRadius: { xs: '14px', sm: '18px' }, overflow: 'hidden', height: { xs: 56, sm: 84 }, mb: 2, boxShadow: brand.shadow, display: 'flex' }}>
              <Box
                sx={{
                  flex: 16,
                  background: `linear-gradient(100deg, ${brand.plantGreenDark} 0%, ${brand.plantGreen} 38%, ${brand.plantGreenLight} 50%, ${brand.plantGreen} 62%, ${brand.plantGreenDark} 100%)`,
                  backgroundSize: '220% 100%',
                  animation: 'lightShimmer 4.8s ease-in-out infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  '@keyframes lightShimmer': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: brand.white, fontSize: { xs: '1.15rem', sm: '1.6rem' }, position: 'relative' }}>16h</Typography>
                <LightModeOutlinedIcon sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', right: 14, color: 'rgba(255,255,255,0.55)', fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 8, bgcolor: brand.graphite, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: { xs: '1.15rem', sm: '1.6rem' } }}>8h</Typography>
                <NightsStayOutlinedIcon sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', right: 10, color: 'rgba(255,255,255,0.3)', fontSize: 22 }} />
              </Box>
              <CycleSweep tall />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mb: { xs: 2.5, sm: 3 } }}>
              {['06', '12', '18', '00', '06'].map((hour, i) => (
                <Typography key={`${hour}-${i}`} variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem' }}>{hour}:00</Typography>
              ))}
            </Box>
            <Box sx={{ pt: { xs: 2, sm: 3 }, borderTop: `1px dashed ${brand.border}`, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: { xs: 0.5, sm: 1 } }}>
              {days.map((day, index) => {
                const isToday = index === todayIndex
                return (
                  <Box key={`${day}-${index}`}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        display: 'block',
                        mb: 0.75,
                        textAlign: 'center',
                        fontSize: { xs: '0.62rem', sm: '0.72rem' },
                        letterSpacing: { xs: '-0.02em', sm: 0 },
                        color: isToday ? brand.plantGreenDark : 'text.secondary',
                      }}
                    >
                      {day}
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        borderRadius: { xs: 1, sm: 1.5 },
                        overflow: 'hidden',
                        height: { xs: 28, sm: 40 },
                        outline: isToday ? `2px solid ${brand.plantGreen}` : 'none',
                        outlineOffset: 2,
                      }}
                    >
                      <Box sx={{ flex: 16, bgcolor: brand.plantGreen }} />
                      <Box sx={{ flex: 8, bgcolor: brand.graphite, opacity: 0.85 }} />
                      <CycleSweep />
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Reveal>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
