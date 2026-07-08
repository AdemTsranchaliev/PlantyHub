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

export default function LightCycleSection() {
  const eyebrow = useHt('lightCycle.eyebrow')
  const title = useHt('lightCycle.title')
  const description = useHt('lightCycle.description')
  const onLabel = useHt('lightCycle.onLabel')
  const onDescription = useHt('lightCycle.onDescription')
  const offLabel = useHt('lightCycle.offLabel')
  const offDescription = useHt('lightCycle.offDescription')
  const diagramLabel = useHt('lightCycle.diagramLabel')
  const day0 = useHt('lightCycle.days.0')
  const day1 = useHt('lightCycle.days.1')
  const day2 = useHt('lightCycle.days.2')
  const day3 = useHt('lightCycle.days.3')
  const days = [day0, day1, day2, day3]

  return (
    <SectionContainer bgcolor={brand.white} py={{ xs: 7, sm: 9, md: 12 }}>
      <Grid container spacing={{ xs: 5, md: 7 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionHeading align="left" eyebrow={eyebrow} title={title} subtitle={description} />
          <Stack spacing={2.5} sx={{ mt: 3 }}>
            <Reveal>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: brand.plantGreenMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LightModeOutlinedIcon sx={{ color: brand.plantGreenDark }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.15rem' }}>{onLabel}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{onDescription}</Typography>
                </Box>
              </Stack>
            </Reveal>
            <Reveal delay={0.08}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: 'rgba(34,48,31,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <NightsStayOutlinedIcon sx={{ color: brand.graphite }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.15rem' }}>{offLabel}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{offDescription}</Typography>
                </Box>
              </Stack>
            </Reveal>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Reveal sx={{ bgcolor: brand.surface, borderRadius: '28px', p: { xs: 3, sm: 4.5 }, border: `1px solid ${brand.border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary', mb: 3, textAlign: 'center' }}>{diagramLabel}</Typography>
            <Box sx={{ display: 'flex', borderRadius: '18px', overflow: 'hidden', height: { xs: 64, sm: 84 }, mb: 2, boxShadow: brand.shadow }}>
              <Box sx={{ flex: 16, background: `linear-gradient(90deg, ${brand.plantGreenLight} 0%, ${brand.plantGreen} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: brand.white, fontSize: { xs: '1.3rem', sm: '1.6rem' } }}>16h</Typography>
                <LightModeOutlinedIcon sx={{ position: 'absolute', right: 14, color: 'rgba(255,255,255,0.55)', fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 8, bgcolor: brand.graphite, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: { xs: '1.3rem', sm: '1.6rem' } }}>8h</Typography>
                <NightsStayOutlinedIcon sx={{ position: 'absolute', right: 10, color: 'rgba(255,255,255,0.3)', fontSize: 22 }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mb: 3 }}>
              {['06', '12', '18', '00', '06'].map((hour, i) => (
                <Typography key={`${hour}-${i}`} variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem' }}>{hour}:00</Typography>
              ))}
            </Box>
            <Box sx={{ pt: 3, borderTop: `1px dashed ${brand.border}`, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {days.map((day) => (
                <Box key={day} sx={{ flex: '1 1 60px', minWidth: 56 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75, textAlign: 'center', fontSize: '0.68rem', color: 'text.secondary' }}>{day}</Typography>
                  <Box sx={{ display: 'flex', borderRadius: 1.5, overflow: 'hidden', height: 12 }}>
                    <Box sx={{ flex: 2, bgcolor: brand.plantGreen }} />
                    <Box sx={{ flex: 1, bgcolor: brand.graphite, opacity: 0.25 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Reveal>
        </Grid>
      </Grid>
    </SectionContainer>
  )
}
