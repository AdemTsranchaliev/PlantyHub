import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import SectionContainer from '../components/SectionContainer'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import { guaranteeIds } from '../data/catalog'
import { useHt } from '../hooks/useHomepage'
import { brand } from '../theme'

const icons = { sprouting: SpaOutlinedIcon, yearRound: WbSunnyOutlinedIcon, support: HeadsetMicOutlinedIcon, sustainable: AutorenewOutlinedIcon } as const

function GuaranteeCard({ id, index }: { id: (typeof guaranteeIds)[number]; index: number }) {
  const Icon = icons[id]
  const title = useHt(`guarantees.items.${id}.title`)
  const description = useHt(`guarantees.items.${id}.description`)
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <Reveal
        delay={index * 0.08}
        sx={{
          height: '100%',
          bgcolor: brand.surface,
          borderRadius: '24px',
          p: { xs: 3, sm: 3.5 },
          border: `1px solid ${brand.border}`,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          '@media (hover: hover)': { '&:hover': { transform: 'translateY(-4px)', boxShadow: brand.shadowHover } },
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: brand.plantGreenMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color: brand.plantGreenDark, fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: '1.2rem', color: brand.graphite }}>{title}</Typography>
          <Typography sx={{ color: brand.textSecondary, lineHeight: 1.65, fontSize: '0.95rem' }}>{description}</Typography>
        </Stack>
      </Reveal>
    </Grid>
  )
}

export default function GuaranteesSection() {
  const title = useHt('guarantees.title')
  return (
    <SectionContainer bgcolor={brand.white} py={{ xs: 7, sm: 9, md: 12 }}>
      <SectionHeading title={title} />
      <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ alignItems: 'stretch' }}>
        {guaranteeIds.map((id, index) => (
          <GuaranteeCard key={id} id={id} index={index} />
        ))}
      </Grid>
    </SectionContainer>
  )
}
