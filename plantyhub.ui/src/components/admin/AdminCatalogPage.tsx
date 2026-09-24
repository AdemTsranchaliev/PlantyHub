import { useState } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import { brand } from '../../theme'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from './AdminPageHeader'
import AdminProductTable from './AdminProductTable'
import ProductEditDialog from './ProductEditDialog'
import { useCategoryProducts } from '../../hooks/useProducts'
import { addProduct, getProduct, resolveKit, updateProduct, type ProductCategory, type StoredProduct } from '../../store/products'

type Props = {
  category: ProductCategory
  titleKey: string
  subtitleKey: string
}

export default function AdminCatalogPage({ category, titleKey, subtitleKey }: Props) {
  const { t } = useTranslation()
  const products = useCategoryProducts(category)
  const [editing, setEditing] = useState<StoredProduct | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

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

  const rows = products.map((item) => {
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
            <Button variant="contained" startIcon={<AddRounded />} onClick={openAdd}>
              {t('admin.actions.addProduct')}
            </Button>
          </Stack>
        }
      />
      <AdminProductTable rows={rows} onEdit={openEdit} />
      <ProductEditDialog
        open={dialogOpen}
        category={category}
        product={editing}
        isNew={isNew}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
