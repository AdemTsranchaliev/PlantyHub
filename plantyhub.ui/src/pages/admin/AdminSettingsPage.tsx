import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminFieldGroup from '../../components/admin/AdminFieldGroup'
import { resetProductsState } from '../../store/products'

export default function AdminSettingsPage() {
  const { t } = useTranslation()

  return (
    <>
      <AdminPageHeader title={t('admin.settings.title')} subtitle={t('admin.settings.subtitle')} />

      <Stack spacing={2.5}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AdminFieldGroup title={t('admin.settings.store')}>
              <TextField label={t('admin.settings.storeName')} defaultValue="PlantyHub" disabled helperText={t('admin.settings.readOnly')} />
              <TextField label={t('admin.settings.currency')} defaultValue="EUR (€)" disabled helperText={t('admin.settings.readOnly')} />
              <TextField label={t('admin.settings.shippingThreshold')} defaultValue="€150" disabled helperText={t('admin.settings.readOnly')} />
            </AdminFieldGroup>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AdminFieldGroup title={t('admin.settings.contact')}>
              <TextField label={t('admin.settings.email')} defaultValue="support@plantyhub.com" disabled helperText={t('admin.settings.readOnly')} />
              <TextField label={t('admin.settings.address')} defaultValue="Pazardzhik, Bulgaria" disabled helperText={t('admin.settings.readOnly')} />
            </AdminFieldGroup>
          </Grid>
        </Grid>

        <AdminFieldGroup title={t('admin.settings.catalog')} hint={t('admin.settings.resetCatalogHint')}>
          <Box>
            <Button variant="outlined" onClick={() => resetProductsState()}>
              {t('admin.settings.resetCatalog')}
            </Button>
          </Box>
        </AdminFieldGroup>

        <AdminFieldGroup title={t('admin.settings.notifications')} hint={t('admin.settings.demoNote')}>
          <FormControlLabel control={<Switch defaultChecked disabled />} label={t('admin.settings.newOrderEmail')} />
          <FormControlLabel control={<Switch defaultChecked disabled />} label={t('admin.settings.lowStockAlert')} />
          <FormControlLabel control={<Switch disabled />} label={t('admin.settings.weeklyReport')} />
        </AdminFieldGroup>
      </Stack>
    </>
  )
}
