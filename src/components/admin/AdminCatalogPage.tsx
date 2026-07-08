import { useState } from 'react'
import Button from '@mui/material/Button'
import AddRounded from '@mui/icons-material/AddRounded'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from './AdminPageHeader'
import AdminProductTable from './AdminProductTable'
import ProductEditDialog from './ProductEditDialog'
import { useCategoryProducts } from '../../hooks/useProducts'
import { addProduct, getProduct, updateProduct, type ProductCategory, type StoredProduct } from '../../store/products'

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

  const handleSave = (product: StoredProduct) => {
    if (isNew) {
      addProduct(category, product)
    } else {
      updateProduct(category, product.id, product)
    }
  }

  const rows = products.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    compareAt: item.compareAt,
    image: item.image,
    extra: item.tagline ?? item.description,
    active: item.active,
  }))

  return (
    <>
      <AdminPageHeader
        title={t(titleKey)}
        subtitle={t(subtitleKey)}
        action={
          <Button variant="contained" startIcon={<AddRounded />} onClick={openAdd}>
            {t('admin.actions.addProduct')}
          </Button>
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
