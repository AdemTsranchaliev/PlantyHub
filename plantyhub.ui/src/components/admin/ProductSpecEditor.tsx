import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import { useTranslation } from 'react-i18next'
import type { ProductSpec } from '../../store/products'

type Props = {
  specs: ProductSpec[]
  onChange: (specs: ProductSpec[]) => void
}

function moveSpec(specs: ProductSpec[], index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= specs.length) return specs
  const copy = [...specs]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

export default function ProductSpecEditor({ specs, onChange }: Props) {
  const { t } = useTranslation()

  const update = (index: number, field: keyof ProductSpec, value: string) => {
    onChange(specs.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)))
  }

  return (
    <Stack spacing={1.25}>
      {specs.map((spec, index) => (
        <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            size="small"
            label={t('admin.productEdit.specLabel')}
            value={spec.label}
            onChange={(e) => update(index, 'label', e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            label={t('admin.productEdit.specValue')}
            value={spec.value}
            onChange={(e) => update(index, 'value', e.target.value)}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton size="small" aria-label={t('admin.productEdit.moveBack')} disabled={index === 0} onClick={() => onChange(moveSpec(specs, index, -1))}>
              <ArrowUpwardRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label={t('admin.productEdit.moveForward')} disabled={index === specs.length - 1} onClick={() => onChange(moveSpec(specs, index, 1))}>
              <ArrowDownwardRounded fontSize="small" />
            </IconButton>
          </Box>
          <IconButton size="small" aria-label={t('admin.productEdit.removeSpec')} onClick={() => onChange(specs.filter((_, i) => i !== index))} sx={{ mt: 0.5 }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button
        variant="outlined"
        startIcon={<AddRounded />}
        onClick={() => onChange([...specs, { label: '', value: '' }])}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('admin.productEdit.addSpec')}
      </Button>
    </Stack>
  )
}
