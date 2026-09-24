import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import AddRounded from '@mui/icons-material/AddRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import { useTranslation } from 'react-i18next'
import type { ProductFaq, ProductFeature } from '../../store/products'

type Props = {
  items: string[]
  label: string
  addLabel: string
  onChange: (items: string[]) => void
}

export default function ProductLineList({ items, label, addLabel, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1}>
      {items.map((item, index) => (
        <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label={`${label} ${index + 1}`}
            value={item}
            onChange={(e) => onChange(items.map((value, i) => (i === index ? e.target.value : value)))}
          />
          <IconButton size="small" aria-label={t('admin.productEdit.removeLine')} onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button variant="outlined" startIcon={<AddRounded />} onClick={() => onChange([...items, ''])} sx={{ alignSelf: 'flex-start' }}>
        {addLabel}
      </Button>
    </Stack>
  )
}

export function ProductFeatureEditor({ items, onChange }: { items: ProductFeature[]; onChange: (items: ProductFeature[]) => void }) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1}>
      {items.map((item, index) => (
        <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
          <TextField
            size="small"
            label={t('admin.productEdit.featureTitle')}
            value={item.title}
            onChange={(e) => onChange(items.map((value, i) => (i === index ? { ...value, title: e.target.value } : value)))}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label={t('admin.productEdit.featureText')}
            value={item.text}
            onChange={(e) => onChange(items.map((value, i) => (i === index ? { ...value, text: e.target.value } : value)))}
            sx={{ flex: 2 }}
          />
          <IconButton size="small" aria-label={t('admin.productEdit.removeLine')} onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button variant="outlined" startIcon={<AddRounded />} onClick={() => onChange([...items, { title: '', text: '' }])} sx={{ alignSelf: 'flex-start' }}>
        {t('admin.productEdit.addFeature')}
      </Button>
    </Stack>
  )
}

export function ProductFaqEditor({ items, onChange }: { items: ProductFaq[]; onChange: (items: ProductFaq[]) => void }) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1.25}>
      {items.map((item, index) => (
        <Stack key={index} spacing={1} sx={{ p: 1.25, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              size="small"
              label={t('admin.productEdit.faqQuestion')}
              value={item.q}
              onChange={(e) => onChange(items.map((value, i) => (i === index ? { ...value, q: e.target.value } : value)))}
            />
            <IconButton size="small" aria-label={t('admin.productEdit.removeLine')} onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <CloseRounded fontSize="small" />
            </IconButton>
          </Stack>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            label={t('admin.productEdit.faqAnswer')}
            value={item.a}
            onChange={(e) => onChange(items.map((value, i) => (i === index ? { ...value, a: e.target.value } : value)))}
          />
        </Stack>
      ))}
      <Button variant="outlined" startIcon={<AddRounded />} onClick={() => onChange([...items, { q: '', a: '' }])} sx={{ alignSelf: 'flex-start' }}>
        {t('admin.productEdit.addFaq')}
      </Button>
    </Stack>
  )
}
