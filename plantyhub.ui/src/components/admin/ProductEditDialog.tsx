import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
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
  resolveKit,
  slugify,
} from '../../store/products'
import ImagePicker from './ImagePicker'
import AdminFieldGroup from './AdminFieldGroup'
import ProductGalleryEditor from './ProductGalleryEditor'
import ProductSpecEditor from './ProductSpecEditor'
import ProductLineList, { ProductFaqEditor, ProductFeatureEditor } from './ProductLineList'
import { mediaApi } from '../../api'
import { ApiError } from '../../api/client'
import {
  defaultGardenGallery,
  defaultGardenLocale,
  defaultGardenVideo,
  defaultGardenVideoPoster,
} from '../../admin/gardenMediaDefaults'
import { brand } from '../../theme'
import { toMediaUrl } from '../../media/cfImage'

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
  const [videoUploading, setVideoUploading] = useState(false)
  const [section, setSection] = useState<'photos' | 'video' | 'details' | 'page' | 'faq'>('photos')
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const next = product ? structuredClone(product) : emptyProduct(category)
    if (category === 'pods' && !next.kit) next.kit = resolveKit(next)
    if (category === 'gardens') {
      if (!next.gallery?.length) next.gallery = [...defaultGardenGallery]
      if (!next.image) next.image = next.gallery[0] ?? ''
      if (!next.videoUrl) next.videoUrl = defaultGardenVideo
      if (!next.videoPoster) next.videoPoster = defaultGardenVideoPoster
      for (const language of supportedLanguages) {
        const defaults = defaultGardenLocale(language.code)
        const current = { ...emptyLocale(), ...next.locales[language.code] }
        next.locales[language.code] = {
          ...defaults,
          ...current,
          videoBadge: current.videoBadge || defaults.videoBadge,
          videoTitle: current.videoTitle || defaults.videoTitle,
          videoText: current.videoText || defaults.videoText,
          highlightsTitle: current.highlightsTitle || defaults.highlightsTitle,
          highlightsSubtitle: current.highlightsSubtitle || defaults.highlightsSubtitle,
          specsTitle: current.specsTitle || defaults.specsTitle,
          howTitle: current.howTitle || defaults.howTitle,
          boxTitle: current.boxTitle || defaults.boxTitle,
          faqTitle: current.faqTitle || defaults.faqTitle,
          specs: current.specs?.length ? current.specs : defaults.specs,
          features: current.features?.length ? current.features : defaults.features,
          steps: current.steps?.length ? current.steps : defaults.steps,
          inTheBox: current.inTheBox?.length ? current.inTheBox : defaults.inTheBox,
          faq: current.faq?.length ? current.faq : defaults.faq,
        }
      }
    }
    setDraft(next)
    setLangTab('en')
    setSection(category === 'gardens' ? 'photos' : 'details')
    setError('')
  }, [open, product, category])

  const hasPack = category === 'pods' || category === 'consumables'
  const hasCompareAt = category === 'gardens'
  const hasFeatured = category === 'gardens'
  const hasTagline = category === 'gardens'

  const updateLocale = (lang: LanguageCode, field: keyof ProductLocaleContent, value: ProductLocaleContent[typeof field]) => {
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
    const image = (category === 'gardens' ? draft.gallery?.[0] : draft.image) || draft.image
    if (!image.trim()) {
      setError(t('admin.productEdit.errors.imageRequired'))
      return
    }

    setSaving(true)
    try {
      await onSave({ ...draft, id, image })
      onClose()
    } catch {
      setError(t('admin.productEdit.errors.saveFailed', { defaultValue: 'Could not save product.' }))
    } finally {
      setSaving(false)
    }
  }

  const locale = draft.locales[langTab] ?? emptyLocale()
  const displayName = draft.locales.en?.name?.trim()

  const isGarden = category === 'gardens'
  const sections = (isGarden ? ['photos', 'video', 'details', 'page', 'faq'] : ['details']) as Array<'photos' | 'video' | 'details' | 'page' | 'faq'>

  const languageTabs = (
    <Tabs value={langTab} onChange={(_, v) => setLangTab(v)} sx={{ borderBottom: `1px solid ${brand.border}`, mb: 0.5 }}>
      {supportedLanguages.map((l) => (
        <Tab key={l.code} value={l.code} label={l.short} />
      ))}
    </Tabs>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            border: `1px solid ${brand.border}`,
            height: { md: 'min(92vh, 860px)' },
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.25, pb: 1.25 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: brand.graphite }}>
          {isNew ? t('admin.productEdit.addTitle') : t('admin.productEdit.editTitle')}
        </Typography>
        {displayName && (
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', mt: 0.25 }}>{displayName}</Typography>
        )}
      </DialogTitle>
      {isGarden && (
        <Tabs
          value={section}
          onChange={(_, value) => setSection(value)}
          variant="scrollable"
          sx={{ px: 2, borderBottom: `1px solid ${brand.border}`, display: { md: 'none' } }}
        >
          {sections.map((id) => (
            <Tab key={id} value={id} label={t(`admin.productEdit.sections.${id}`)} />
          ))}
        </Tabs>
      )}
      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden', bgcolor: brand.surface }}>
        {isGarden && (
          <Stack
            spacing={0.5}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 180,
              flexShrink: 0,
              p: 1.5,
              borderRight: `1px solid ${brand.border}`,
              bgcolor: brand.white,
            }}
          >
            {sections.map((id) => (
              <Button
                key={id}
                onClick={() => setSection(id)}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: '12px',
                  fontWeight: 700,
                  color: section === id ? brand.plantGreenDark : brand.graphite,
                  bgcolor: section === id ? brand.plantGreenMuted : 'transparent',
                }}
              >
                {t(`admin.productEdit.sections.${id}`)}
              </Button>
            ))}
          </Stack>
        )}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 2.5 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {section === 'photos' && isGarden && (
            <AdminFieldGroup title={t('admin.productEdit.gallery')}>
              <ProductGalleryEditor
                images={draft.gallery ?? []}
                onChange={(gallery) => setDraft((p) => ({ ...p, gallery, image: gallery[0] ?? '' }))}
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
          )}

          {section === 'video' && isGarden && (
            <Stack spacing={2}>
              <AdminFieldGroup title={t('admin.productEdit.video')}>
                {draft.videoUrl && (
                  <Box
                    component="video"
                    src={toMediaUrl(draft.videoUrl)}
                    poster={draft.videoPoster ? toMediaUrl(draft.videoPoster) : undefined}
                    controls
                    sx={{ width: '100%', maxHeight: 280, borderRadius: '12px', bgcolor: brand.graphite }}
                  />
                )}
                <Button variant="outlined" disabled={videoUploading} onClick={() => videoInputRef.current?.click()}>
                  {videoUploading ? t('admin.imagePicker.uploading') : t('admin.productEdit.replaceVideo')}
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setVideoUploading(true)
                    setError('')
                    void mediaApi.upload(file)
                      .then((result) => setDraft((p) => ({ ...p, videoUrl: result.url })))
                      .catch((err) => setError(err instanceof ApiError ? err.message : t('admin.productEdit.errors.saveFailed')))
                      .finally(() => {
                        setVideoUploading(false)
                        if (videoInputRef.current) videoInputRef.current.value = ''
                      })
                  }}
                />
                <ImagePicker
                  label={t('admin.productEdit.videoPoster')}
                  value={draft.videoPoster ?? ''}
                  onChange={(url) => setDraft((p) => ({ ...p, videoPoster: url }))}
                  size="small"
                />
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.content')} hint={t('admin.productEdit.contentHint')}>
                {languageTabs}
                <TextField label={t('admin.productEdit.videoBadge')} value={locale.videoBadge ?? ''} onChange={(e) => updateLocale(langTab, 'videoBadge', e.target.value)} />
                <TextField label={t('admin.productEdit.videoTitle')} value={locale.videoTitle ?? ''} onChange={(e) => updateLocale(langTab, 'videoTitle', e.target.value)} />
                <TextField label={t('admin.productEdit.videoText')} value={locale.videoText ?? ''} onChange={(e) => updateLocale(langTab, 'videoText', e.target.value)} multiline minRows={2} />
              </AdminFieldGroup>
            </Stack>
          )}

          {section === 'details' && (
            <Stack spacing={2}>
              {!isGarden && (
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
              )}
              <AdminFieldGroup title={t('admin.productEdit.pricing')} hint={t('admin.productEdit.pricingHint')}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75}>
                  <TextField fullWidth label={t('admin.productEdit.price')} value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} placeholder="€9.99" sx={{ flex: 1 }} />
                  {hasCompareAt && (
                    <TextField
                      fullWidth
                      label={t('admin.productEdit.compareAt')}
                      value={draft.compareAt ?? ''}
                      onChange={(e) => setDraft((p) => ({ ...p, compareAt: e.target.value || undefined }))}
                      placeholder="€129.00"
                      helperText={t('admin.productEdit.compareAtHint')}
                      sx={{ flex: 1 }}
                    />
                  )}
                  {hasPack && (
                    <FormControl>
                      <InputLabel>{t('admin.productEdit.pack')}</InputLabel>
                      <SelectMui label={t('admin.productEdit.pack')} value={draft.packKey ?? 'pack3'} onChange={(e) => setDraft((p) => ({ ...p, packKey: e.target.value }))}>
                        {packKeyOptions.map((key) => (
                          <MenuItem key={key} value={key}>{t(`common.${key}`)}</MenuItem>
                        ))}
                      </SelectMui>
                    </FormControl>
                  )}
                </Stack>
                {category === 'pods' && (
                  <Stack spacing={1.25}>
                    <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '0.9rem' }}>{t('admin.productEdit.kit')}</Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                      <TextField type="number" label={t('admin.productEdit.kitPods')} value={draft.kit?.pods ?? 0} onChange={(e) => setDraft((p) => ({ ...p, kit: { pods: Number(e.target.value) || 0, caps: p.kit?.caps ?? 0, nutrientMl: p.kit?.nutrientMl ?? 0 } }))} />
                      <TextField type="number" label={t('admin.productEdit.kitCaps')} value={draft.kit?.caps ?? 0} onChange={(e) => setDraft((p) => ({ ...p, kit: { pods: p.kit?.pods ?? 0, caps: Number(e.target.value) || 0, nutrientMl: p.kit?.nutrientMl ?? 0 } }))} />
                      <TextField type="number" label={t('admin.productEdit.kitNutrient')} value={draft.kit?.nutrientMl ?? 0} onChange={(e) => setDraft((p) => ({ ...p, kit: { pods: p.kit?.pods ?? 0, caps: p.kit?.caps ?? 0, nutrientMl: Number(e.target.value) || 0 } }))} />
                    </Stack>
                  </Stack>
                )}
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.visibility')}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <FormControlLabel control={<Switch checked={draft.active} onChange={(e) => setDraft((p) => ({ ...p, active: e.target.checked }))} />} label={t('admin.productEdit.active')} />
                  {hasFeatured && (
                    <FormControlLabel control={<Switch checked={!!draft.featured} onChange={(e) => setDraft((p) => ({ ...p, featured: e.target.checked }))} />} label={t('admin.productEdit.featured')} />
                  )}
                </Stack>
                {isNew && (
                  <TextField label={t('admin.productEdit.id')} value={draft.id} onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))} helperText={t('admin.productEdit.idHint')} />
                )}
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.content')} hint={t('admin.productEdit.contentHint')}>
                {languageTabs}
                <TextField label={t('admin.productEdit.name')} value={locale.name} onChange={(e) => updateLocale(langTab, 'name', e.target.value)} required helperText={langTab === 'en' ? t('admin.productEdit.nameHint') : undefined} />
                {hasTagline && (
                  <TextField label={t('admin.productEdit.tagline')} value={locale.tagline ?? ''} onChange={(e) => updateLocale(langTab, 'tagline', e.target.value)} />
                )}
                <TextField label={t('admin.productEdit.description')} value={locale.description ?? ''} onChange={(e) => updateLocale(langTab, 'description', e.target.value)} multiline minRows={3} />
              </AdminFieldGroup>
            </Stack>
          )}

          {section === 'page' && isGarden && (
            <Stack spacing={2}>
              <AdminFieldGroup title={t('admin.productEdit.sectionTitles')}>
                {languageTabs}
                <TextField label={t('admin.productEdit.highlightsTitle')} value={locale.highlightsTitle ?? ''} onChange={(e) => updateLocale(langTab, 'highlightsTitle', e.target.value)} />
                <TextField label={t('admin.productEdit.highlightsSubtitle')} value={locale.highlightsSubtitle ?? ''} onChange={(e) => updateLocale(langTab, 'highlightsSubtitle', e.target.value)} />
                <TextField label={t('admin.productEdit.howTitle')} value={locale.howTitle ?? ''} onChange={(e) => updateLocale(langTab, 'howTitle', e.target.value)} />
                <TextField label={t('admin.productEdit.boxTitle')} value={locale.boxTitle ?? ''} onChange={(e) => updateLocale(langTab, 'boxTitle', e.target.value)} />
                <TextField label={t('admin.productEdit.specsTitle')} value={locale.specsTitle ?? ''} onChange={(e) => updateLocale(langTab, 'specsTitle', e.target.value)} />
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.features')}>
                <ProductFeatureEditor items={locale.features ?? []} onChange={(features) => updateLocale(langTab, 'features', features)} />
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.steps')}>
                <ProductLineList items={locale.steps ?? []} label={t('admin.productEdit.steps')} addLabel={t('admin.productEdit.addStep')} onChange={(steps) => updateLocale(langTab, 'steps', steps)} />
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.inTheBox')}>
                <ProductLineList items={locale.inTheBox ?? []} label={t('admin.productEdit.inTheBox')} addLabel={t('admin.productEdit.addBox')} onChange={(inTheBox) => updateLocale(langTab, 'inTheBox', inTheBox)} />
              </AdminFieldGroup>
              <AdminFieldGroup title={t('admin.productEdit.specs')}>
                <ProductSpecEditor specs={locale.specs ?? []} onChange={(specs) => updateLocale(langTab, 'specs', specs)} />
              </AdminFieldGroup>
            </Stack>
          )}

          {section === 'faq' && isGarden && (
            <AdminFieldGroup title={t('admin.productEdit.faq')} hint={t('admin.productEdit.faqHint')}>
              {languageTabs}
              <TextField label={t('admin.productEdit.faqTitle')} value={locale.faqTitle ?? ''} onChange={(e) => updateLocale(langTab, 'faqTitle', e.target.value)} />
              <ProductFaqEditor items={locale.faq ?? []} onChange={(faq) => updateLocale(langTab, 'faq', faq)} />
            </AdminFieldGroup>
          )}
        </Box>
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
