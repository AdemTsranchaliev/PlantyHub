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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import SelectMui from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
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
import ImagePicker from './ImagePicker'
import AdminFieldGroup from './AdminFieldGroup'
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
      <DialogTitle>
        {isNew ? t('admin.productEdit.addTitle') : t('admin.productEdit.editTitle')}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: brand.surface }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <AdminFieldGroup title={t('admin.productEdit.photo')}>
            <ImagePicker
              label={t('admin.productEdit.imageUrl')}
              value={draft.image}
              onChange={(url) => setDraft((p) => ({ ...p, image: url }))}
              size="medium"
              previewFit={draft.imageFit}
            />
            <FormControl>
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
          </AdminFieldGroup>

          <AdminFieldGroup title={t('admin.productEdit.pricing')} hint={t('admin.productEdit.pricingHint')}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75}>
              <TextField
                label={t('admin.productEdit.price')}
                value={draft.price}
                onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))}
                placeholder="€9.99"
              />
              {hasCompareAt && (
                <TextField
                  label={t('admin.productEdit.compareAt')}
                  value={draft.compareAt ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, compareAt: e.target.value || undefined }))}
                  placeholder="€129.00"
                  helperText={t('admin.productEdit.compareAtHint')}
                />
              )}
              {hasPack && (
                <FormControl>
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
            </Stack>
          </AdminFieldGroup>

          <AdminFieldGroup title={t('admin.productEdit.content')} hint={t('admin.productEdit.contentHint')}>
            <Tabs value={langTab} onChange={(_, v) => setLangTab(v)} sx={{ borderBottom: `1px solid ${brand.border}` }}>
              {supportedLanguages.map((l) => (
                <Tab key={l.code} value={l.code} label={l.short} />
              ))}
            </Tabs>
            <TextField
              label={t('admin.productEdit.name')}
              value={locale.name}
              onChange={(e) => updateLocale(langTab, 'name', e.target.value)}
              required
              helperText={langTab === 'en' ? t('admin.productEdit.nameHint') : undefined}
            />
            {hasTagline && (
              <TextField
                label={t('admin.productEdit.tagline')}
                value={locale.tagline ?? ''}
                onChange={(e) => updateLocale(langTab, 'tagline', e.target.value)}
              />
            )}
            <TextField
              label={t('admin.productEdit.description')}
              value={locale.description ?? ''}
              onChange={(e) => updateLocale(langTab, 'description', e.target.value)}
              multiline
              minRows={3}
            />
          </AdminFieldGroup>

          <AdminFieldGroup title={t('admin.productEdit.visibility')}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.active}
                    onChange={(e) => setDraft((p) => ({ ...p, active: e.target.checked }))}
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
                    />
                  }
                  label={t('admin.productEdit.featured')}
                />
              )}
            </Stack>
            {isNew && (
              <TextField
                label={t('admin.productEdit.id')}
                value={draft.id}
                onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))}
                helperText={t('admin.productEdit.idHint')}
              />
            )}
          </AdminFieldGroup>
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
