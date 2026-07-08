import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { resetProductsState } from '../../store/products'
import { brand } from '../../theme'

export default function AdminSettingsPage() {
  const { t } = useTranslation()

  return (
    <>
      <AdminPageHeader title={t('admin.settings.title')} subtitle={t('admin.settings.subtitle')} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 2 }}>
              {t('admin.settings.store')}
            </Typography>
            <TextField label={t('admin.settings.storeName')} defaultValue="PlantyHub" fullWidth disabled sx={{ mb: 2 }} />
            <TextField label={t('admin.settings.currency')} defaultValue="EUR (€)" fullWidth disabled sx={{ mb: 2 }} />
            <TextField label={t('admin.settings.shippingThreshold')} defaultValue="€60" fullWidth disabled />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 2 }}>
              {t('admin.settings.contact')}
            </Typography>
            <TextField label={t('admin.settings.email')} defaultValue="support@plantyhub.com" fullWidth disabled sx={{ mb: 2 }} />
            <TextField label={t('admin.settings.address')} defaultValue="Pazardzhik, Bulgaria" fullWidth disabled />
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 1 }}>
              {t('admin.settings.catalog')}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem', mb: 2 }}>
              {t('admin.settings.resetCatalogHint')}
            </Typography>
            <Button variant="outlined" onClick={() => resetProductsState()}>
              {t('admin.settings.resetCatalog')}
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, p: 3 }}>
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 2 }}>
              {t('admin.settings.notifications')}
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked disabled sx={{ '& .Mui-checked': { color: brand.plantGreen } }} />}
              label={t('admin.settings.newOrderEmail')}
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={<Switch defaultChecked disabled sx={{ '& .Mui-checked': { color: brand.plantGreen } }} />}
              label={t('admin.settings.lowStockAlert')}
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={<Switch disabled sx={{ '& .Mui-checked': { color: brand.plantGreen } }} />}
              label={t('admin.settings.weeklyReport')}
              sx={{ display: 'block' }}
            />
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.88rem' }}>
              {t('admin.settings.demoNote')}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}
