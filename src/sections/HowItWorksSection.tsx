import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { howItWorksStepIds } from '../data/catalog'
import { brand } from '../theme'

export default function HowItWorksSection() {
  const { t } = useTranslation()

  return (
    <Box id="how-it-works" component="section" sx={{ position: 'relative', overflow: 'hidden', bgcolor: brand.graphite, color: brand.white, scrollMarginTop: { xs: 64, md: 76 } }}>
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '80%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.plantGreenGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <SectionContainer bgcolor="transparent" py={{ xs: 7, sm: 9, md: 12 }}>
        <SectionHeading
          light
          eyebrow={t('howItWorks.eyebrow')}
          title={t('howItWorks.title')}
          subtitle={t('howItWorks.subtitle')}
        />

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 1 }}>
          {howItWorksStepIds.map((stepId, index) => (
            <Grid key={stepId} size={{ xs: 12, sm: 6, md: 3 }}>
              <Reveal delay={index * 0.1} sx={{ position: 'relative', height: '100%' }}>
                {index < howItWorksStepIds.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      position: 'absolute',
                      top: 27,
                      left: 'calc(54px + 12px)',
                      right: -20,
                      height: 2,
                      background: `linear-gradient(90deg, ${brand.plantGreenLight}, transparent)`,
                      opacity: 0.5,
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${brand.peach}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.3rem', color: brand.peach }}>
                    {index + 1}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.25rem', mb: 1, color: brand.white }}>
                  {t(`howItWorks.steps.${stepId}.title`)}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {t(`howItWorks.steps.${stepId}.description`)}
                </Typography>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </SectionContainer>
    </Box>
  )
}
