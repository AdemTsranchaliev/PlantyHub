import { useEffect } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { navHrefs } from '../data/catalog'
import { useCart } from '../hooks/useCart'

export default function CartSnackbar() {
  const { t } = useTranslation()
  const { lastAddedAt, clearLastAdded } = useCart()
  const open = lastAddedAt > 0

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => clearLastAdded(), 4000)
    return () => window.clearTimeout(timer)
  }, [open, lastAddedAt, clearLastAdded])

  return (
    <Snackbar open={open} onClose={clearLastAdded} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert
        onClose={clearLastAdded}
        severity="success"
        variant="filled"
        sx={{ width: '100%', alignItems: 'center' }}
        action={
          <Button color="inherit" size="small" component={RouterLink} to={navHrefs.cart} onClick={clearLastAdded}>
            {t('cart.viewCart')}
          </Button>
        }
      >
        {t('cart.added')}
      </Alert>
    </Snackbar>
  )
}
