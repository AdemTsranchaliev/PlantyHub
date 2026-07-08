import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import SelectMui from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import SaveRounded from '@mui/icons-material/SaveRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../../i18n/languages'
import type { LanguageCode } from '../../i18n/languages'
import {
  type ProductCategory,
  type StoredProduct,
  type ProductLocaleContent,
  packKeyOptions,
  slugify,
} from '../../store/products'
import { brand } from '../../theme'

type Props = {
  open: boolean
  category: ProductCategory
  product: StoredProduct | null
  isNew?: boolean
  onClose: () => void
  onSave: (product: StoredProduct) => void | Promise<void>
}

const emptyLocale = (): ProductLocaleContent => ({ name: '', tagline: '', description: '' })

function emptyProduct(category: ProductCategory): StoredProduct {
  return {
    id: '',
    price: '€0.00',
    image: '',
    imageFit: 'cover',
    active: true,
    featured: category === 'gardens' ? false : undefined,
    packKey: category === 'pods' || category === 'consumables' ? 'pack3' : undefined,
    locales: { en: emptyLocale() },
  }
}

export default function ProductEditDialog({ open, category, product, isNew, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [langTab, setLangTab] = useState<LanguageCode>('en')
  const [draft, setDraft] = useState<StoredProduct>(emptyProduct(category))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(product ? structuredClone(product) : emptyProduct(category))
      setLangTab('en')
      setError('')
    }
  }, [open, product, category])

  const hasPack = category === 'pods' || category === 'consumables'
  const hasCompareAt = category === 'gardens'
  const hasFeatured = category === 'gardens'
  const hasTagline = category === 'gardens'
  const hasDescription = category !== 'accessories' || true // all can have description

  const updateLocale = (lang: LanguageCode, field: keyof ProductLocaleContent, value: string) => {
    setDraft((prev) => ({
      ...prev,
      locales: {
        ...prev.locales,
        [lang]: { ...emptyLocale(), ...prev.locales[lang], [field]: value },
      },
    }))
  }

  const handleSave = async () => {
    const id = isNew ? slugify(draft.id || draft.locales.en?.name || '') : draft.id
    if (!id) {
      setError(t('admin.productEdit.errors.idRequired'))
      return
    }
    const enName = draft.locales.en?.name?.trim()
    if (!enName) {
      setError(t('admin.productEdit.errors.nameRequired'))
      return
    }
    if (!draft.price.trim()) {
      setError(t('admin.productEdit.errors.priceRequired'))
      return
    }
    if (!draft.image.trim()) {
      setError(t('admin.productEdit.errors.imageRequired'))
      return
    }

    setSaving(true)
    try {
      await onSave({ ...draft, id })
      onClose()
    } catch {
      setError(t('admin.productEdit.errors.saveFailed', { defaultValue: 'Could not save product.' }))
    } finally {
      setSaving(false)
    }
  }

  const locale = draft.locales[langTab] ?? emptyLocale()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 700, color: brand.graphite }}>
        {isNew ? t('admin.productEdit.addTitle') : t('admin.productEdit.editTitle')}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: brand.graphite }}>
            {t('admin.productEdit.basicInfo')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('admin.productEdit.id')}
              value={draft.id}
              onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))}
              disabled={!isNew}
              fullWidth
              helperText={isNew ? t('admin.productEdit.idHint') : undefined}
            />
            <TextField
              label={t('admin.productEdit.price')}
              value={draft.price}
              onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))}
              fullWidth
              placeholder="€9.99"
            />
            {hasCompareAt && (
              <TextField
                label={t('admin.productEdit.compareAt')}
                value={draft.compareAt ?? ''}
                onChange={(e) => setDraft((p) => ({ ...p, compareAt: e.target.value || undefined }))}
                fullWidth
                placeholder="€129.00"
              />
            )}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {hasPack && (
              <FormControl fullWidth>
                <InputLabel>{t('admin.productEdit.pack')}</InputLabel>
                <SelectMui
                  label={t('admin.productEdit.pack')}
                  value={draft.packKey ?? 'pack3'}
                  onChange={(e) => setDraft((p) => ({ ...p, packKey: e.target.value }))}
                >
                  {packKeyOptions.map((key) => (
                    <MenuItem key={key} value={key}>
                      {t(`common.${key}`)}
                    </MenuItem>
                  ))}
                </SelectMui>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel>{t('admin.productEdit.imageFit')}</InputLabel>
              <SelectMui
                label={t('admin.productEdit.imageFit')}
                value={draft.imageFit}
                onChange={(e) => setDraft((p) => ({ ...p, imageFit: e.target.value as 'cover' | 'contain' }))}
              >
                <MenuItem value="cover">{t('admin.productEdit.fitCover')}</MenuItem>
                <MenuItem value="contain">{t('admin.productEdit.fitContain')}</MenuItem>
              </SelectMui>
            </FormControl>
          </Stack>

          <TextField
            label={t('admin.productEdit.imageUrl')}
            value={draft.image}
            onChange={(e) => setDraft((p) => ({ ...p, image: e.target.value }))}
            fullWidth
            placeholder="https://..."
          />

          {draft.image && (
            <Box
              component="img"
              src={draft.image}
              alt=""
              sx={{
                width: 120,
                height: 120,
                objectFit: draft.imageFit,
                borderRadius: '16px',
                border: `1px solid ${brand.border}`,
                bgcolor: brand.surface,
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}

          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.active}
                  onChange={(e) => setDraft((p) => ({ ...p, active: e.target.checked }))}
                  sx={{ '& .Mui-checked': { color: brand.plantGreen } }}
                />
              }
              label={t('admin.productEdit.active')}
            />
            {hasFeatured && (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!draft.featured}
                    onChange={(e) => setDraft((p) => ({ ...p, featured: e.target.checked }))}
                    sx={{ '& .Mui-checked': { color: brand.plantGreen } }}
                  />
                }
                label={t('admin.productEdit.featured')}
              />
            )}
          </Stack>

          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: brand.graphite, mb: 1.5 }}>
              {t('admin.productEdit.content')}
            </Typography>
            <Tabs
              value={langTab}
              onChange={(_, v) => setLangTab(v)}
              sx={{ mb: 2, borderBottom: `1px solid ${brand.border}` }}
            >
              {supportedLanguages.map((l) => (
                <Tab key={l.code} value={l.code} label={l.short} />
              ))}
            </Tabs>
            <Stack spacing={2}>
              <TextField
                label={t('admin.productEdit.name')}
                value={locale.name}
                onChange={(e) => updateLocale(langTab, 'name', e.target.value)}
                fullWidth
                required
              />
              {hasTagline && (
                <TextField
                  label={t('admin.productEdit.tagline')}
                  value={locale.tagline ?? ''}
                  onChange={(e) => updateLocale(langTab, 'tagline', e.target.value)}
                  fullWidth
                />
              )}
              {hasDescription && (
                <TextField
                  label={t('admin.productEdit.description')}
                  value={locale.description ?? ''}
                  onChange={(e) => updateLocale(langTab, 'description', e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CloseRounded />}>
          {t('admin.productEdit.cancel')}
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} startIcon={<SaveRounded />} disabled={saving}>
          {t('admin.productEdit.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
