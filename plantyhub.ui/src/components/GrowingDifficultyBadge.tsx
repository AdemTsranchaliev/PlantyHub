import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { GrowingDifficulty } from '../store/products'
import { brand } from '../theme'

export const growingDifficultyLevels: GrowingDifficulty[] = ['easy', 'medium', 'hard']

export const growingDifficultyMeta: Record<GrowingDifficulty, { color: string; soft: string }> = {
  easy: { color: '#2F7D53', soft: 'rgba(47, 125, 83, 0.10)' },
  medium: { color: '#C3922F', soft: 'rgba(195, 146, 47, 0.12)' },
  hard: { color: '#C45F42', soft: 'rgba(196, 95, 66, 0.12)' },
}

type LegendProps = {
  active: GrowingDifficulty
  variant?: 'horizontal' | 'stacked'
}

export function GrowingDifficultyLegend({ active, variant = 'horizontal' }: LegendProps) {
  if (variant === 'stacked') {
    return (
      <Stack spacing="5px" sx={{ width: 20 }} aria-hidden>
        {growingDifficultyLevels.map((level) => {
          const on = level === active
          return (
            <Box
              key={level}
              sx={{
                height: 4,
                borderRadius: 999,
                bgcolor: growingDifficultyMeta[level].color,
                opacity: on ? 1 : 0.28,
                transform: on ? 'scaleX(1)' : 'scaleX(0.85)',
                transformOrigin: 'center',
              }}
            />
          )
        })}
      </Stack>
    )
  }

  return (
    <Stack direction="row" spacing="4px" sx={{ alignItems: 'center' }} aria-hidden>
      {growingDifficultyLevels.map((level) => {
        const on = level === active
        return (
          <Box
            key={level}
            sx={{
              width: on ? 16 : 10,
              height: 3.5,
              borderRadius: 999,
              bgcolor: growingDifficultyMeta[level].color,
              opacity: on ? 1 : 0.28,
            }}
          />
        )
      })}
    </Stack>
  )
}

type BadgeProps = {
  difficulty: GrowingDifficulty
}

export default function GrowingDifficultyBadge({ difficulty }: BadgeProps) {
  const { t } = useTranslation()
  const color = growingDifficultyMeta[difficulty].color

  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <GrowingDifficultyLegend active={difficulty} />
      <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color, lineHeight: 1.15 }}>
        {t(`growingDifficulty.${difficulty}`)}
      </Typography>
    </Stack>
  )
}

type PickerProps = {
  value?: GrowingDifficulty
  onChange: (value: GrowingDifficulty) => void
}

export function GrowingDifficultyPicker({ value, onChange }: PickerProps) {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={0.85} sx={{ flexWrap: 'wrap' }}>
      {growingDifficultyLevels.map((level) => {
        const meta = growingDifficultyMeta[level]
        const selected = value === level
        return (
          <Box
            key={level}
            component="button"
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={selected}
            title={t(`growingDifficulty.${level}HintShort`)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              cursor: 'pointer',
              border: selected ? `1.5px solid ${meta.color}` : `1px solid ${brand.border}`,
              bgcolor: selected ? meta.soft : brand.white,
              borderRadius: '12px',
              px: 1.15,
              py: 0.8,
              minHeight: 38,
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
              '@media (hover: hover)': {
                '&:hover': { borderColor: meta.color },
              },
            }}
          >
            <Box sx={{ width: selected ? 18 : 12, height: 4, borderRadius: 999, bgcolor: meta.color }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: selected ? meta.color : brand.graphite }}>
              {t(`growingDifficulty.${level}`)}
            </Typography>
          </Box>
        )
      })}
    </Stack>
  )
}

type PanelProps = {
  difficulty: GrowingDifficulty
}

/** PDP — same rhythm as "what's included" rows. */
export function GrowingDifficultyPanel({ difficulty }: PanelProps) {
  const { t } = useTranslation()
  const meta = growingDifficultyMeta[difficulty]

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          bgcolor: meta.soft,
          color: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <GrowingDifficultyLegend active={difficulty} variant="stacked" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '0.95rem', lineHeight: 1.3 }}>
          {t('growingDifficulty.shortLabel')}
          <Box component="span" sx={{ color: meta.color, fontWeight: 800 }}>
            {' · '}
            {t(`growingDifficulty.${difficulty}`)}
          </Box>
        </Typography>
        <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.35 }}>
          {t(`growingDifficulty.${difficulty}HintShort`)}
        </Typography>
      </Box>
    </Stack>
  )
}
