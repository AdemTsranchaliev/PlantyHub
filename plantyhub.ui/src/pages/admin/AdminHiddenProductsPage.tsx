import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminProductTable from '../../components/admin/AdminProductTable'
import ProductEditDialog from '../../components/admin/ProductEditDialog'
import { ApiError } from '../../api/client'
import { useCategoryProducts } from '../../hooks/useProducts'
import { getProduct, resolveKit, setProductActive, updateProduct, type ProductCategory, type StoredProduct } from '../../store/products'
import { brand } from '../../theme'

export default function AdminHiddenProductsPage() {
  const { t } = useTranslation()
  const gardens = useCategoryProducts('gardens').filter((item) => !item.active)
  const pods = useCategoryProducts('pods').filter((item) => !item.active)
  const accessories = useCategoryProducts('accessories').filter((item) => !item.active)
  const groups = [
    { category: 'gardens' as const, items: gardens },
    { category: 'pods' as const, items: pods },
    { category: 'accessories' as const, items: accessories },
  ]
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  const [editing, setEditing] = useState<{ category: ProductCategory; product: StoredProduct } | null>(null)
  const [error, setError] = useState('')
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const openEdit = (category: ProductCategory, id: string) => {
    const product = getProduct(category, id)
    if (!product) return
    setEditing({ category, product })
  }

  const rowsFor = (category: ProductCategory, items: typeof gardens) =>
    items.map((item) => {
      const kit = category === 'pods' ? resolveKit(item) : undefined
      const includes = kit
        ? kit.caps || kit.nutrientMl
          ? t('admin.pods.includes', { pods: kit.pods, caps: kit.caps, ml: kit.nutrientMl })
          : kit.pods
            ? t('admin.pods.podsOnly', { count: kit.pods })
            : undefined
        : undefined
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        compareAt: item.compareAt,
        image: item.image,
        extra: includes ?? item.tagline ?? item.description,
        active: item.active,
        featured: item.featured,
      }
    })

  const restore = async (id: string) => {
    setRestoringId(id)
    setError('')
    try {
      await setProductActive(id, true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.hidden.error'))
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title={t('admin.hidden.title')}
        subtitle={t('admin.hidden.subtitle')}
        action={
          <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', fontWeight: 700 }}>
            {t('admin.catalog.count', { count: total })}
          </Typography>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}
      {total === 0 ? (
        <Typography sx={{ color: brand.textSecondary }}>{t('admin.hidden.empty')}</Typography>
      ) : (
        <Stack spacing={3}>
          {groups.filter((group) => group.items.length > 0).map((group) => (
            <Stack key={group.category} spacing={1.25}>
              <Typography sx={{ fontWeight: 800, color: brand.graphite }}>{t(`admin.dashboard.categories.${group.category}`)}</Typography>
              <AdminProductTable
                rows={rowsFor(group.category, group.items)}
                onEdit={(id) => openEdit(group.category, id)}
                onRestore={(id) => {
                  if (restoringId) return
                  void restore(id)
                }}
              />
            </Stack>
          ))}
        </Stack>
      )}
      <ProductEditDialog
        open={Boolean(editing)}
        category={editing?.category ?? 'gardens'}
        product={editing?.product ?? null}
        isNew={false}
        onClose={() => setEditing(null)}
        onSave={async (product) => {
          if (!editing) return
          await updateProduct(editing.category, product.id, product)
        }}
      />
    </>
  )
}
