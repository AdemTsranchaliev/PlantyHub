import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import { brand } from '../../theme'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import AdminPageHeader from './AdminPageHeader'
import AdminProductTable from './AdminProductTable'
import ProductEditDialog from './ProductEditDialog'
import { useCategoryProducts } from '../../hooks/useProducts'
import { addProduct, getProduct, resolveKit, setProductActive, updateProduct, type ProductCategory, type StoredProduct } from '../../store/products'

type Props = {
  category: ProductCategory
  titleKey: string
  subtitleKey: string
}

export default function AdminCatalogPage({ category, titleKey, subtitleKey }: Props) {
  const { t } = useTranslation()
  const all = useCategoryProducts(category)
  const products = all.filter((item) => item.active)
  const hiddenCount = all.length - products.length
  const [editing, setEditing] = useState<StoredProduct | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingHide, setPendingHide] = useState<{ id: string; name: string } | null>(null)
  const [hiding, setHiding] = useState(false)
  const [hideError, setHideError] = useState('')

  const openEdit = (id: string) => {
    const product = getProduct(category, id)
    if (!product) return
    setEditing(product)
    setIsNew(false)
    setDialogOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    setIsNew(true)
    setDialogOpen(true)
  }

  const handleSave = async (product: StoredProduct) => {
    if (isNew) {
      await addProduct(category, product)
    } else {
      await updateProduct(category, product.id, product)
    }
  }

  const askHide = (id: string) => {
    const product = products.find((item) => item.id === id)
    if (!product) return
    setHideError('')
    setPendingHide({ id, name: product.name })
  }

  const confirmHide = async () => {
    if (!pendingHide) return
    setHiding(true)
    setHideError('')
    try {
      await setProductActive(pendingHide.id, false)
      setPendingHide(null)
    } catch (err) {
      setHideError(err instanceof ApiError ? err.message : t('admin.hidden.error'))
    } finally {
      setHiding(false)
    }
  }

  const rows = products.map((item) => {
    const kit = category === 'pods' ? resolveKit(item) : undefined
    const includes = kit
      ? kit.caps || kit.nutrientMl
        ? t('admin.pods.includes', { pods: kit.pods, caps: kit.caps, ml: kit.nutrientMl })
        : kit.pods
          ? t('admin.pods.podsOnly', { count: kit.pods })
          : undefined
      : undefined
    const difficulty =
      category === 'pods' && item.growingDifficulty
        ? t(`growingDifficulty.${item.growingDifficulty}`)
        : undefined
    const extraParts = [difficulty, includes ?? item.tagline ?? item.description].filter(Boolean)
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      compareAt: item.compareAt,
      image: item.image,
      extra: extraParts.length ? extraParts.join(' · ') : undefined,
      active: item.active,
      featured: item.featured,
    }
  })
  const totalPods = category === 'pods' ? products.reduce((sum, item) => sum + resolveKit(item).pods, 0) : 0

  return (
    <>
      <AdminPageHeader
        title={t(titleKey)}
        subtitle={t(subtitleKey)}
        action={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 700 }}>
              {t('admin.catalog.count', { count: products.length })}
              {category === 'pods' ? ` · ${t('admin.pods.totalPods', { count: totalPods })}` : ''}
            </Typography>
            {hiddenCount > 0 && (
              <Button component={RouterLink} to="/admin/hidden" sx={{ color: brand.textSecondary, fontWeight: 700 }}>
                {t('admin.hidden.short', { count: hiddenCount })}
              </Button>
            )}
            <Button variant="contained" startIcon={<AddRounded />} onClick={openAdd}>
              {t('admin.actions.addProduct')}
            </Button>
          </Stack>
        }
      />
      <AdminProductTable rows={rows} onEdit={openEdit} onHide={askHide} />
      <ProductEditDialog
        open={dialogOpen}
        category={category}
        product={editing}
        isNew={isNew}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
      <Dialog
        open={Boolean(pendingHide)}
        onClose={() => {
          if (!hiding) setPendingHide(null)
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.hidden.confirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: brand.textSecondary, lineHeight: 1.6 }}>
            {t('admin.hidden.confirmText', { name: pendingHide?.name ?? '' })}
          </Typography>
          {hideError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
              {hideError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingHide(null)} disabled={hiding}>
            {t('admin.hidden.cancel')}
          </Button>
          <Button variant="contained" onClick={() => void confirmHide()} disabled={hiding}>
            {hiding ? t('admin.hidden.hiding') : t('admin.hidden.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
