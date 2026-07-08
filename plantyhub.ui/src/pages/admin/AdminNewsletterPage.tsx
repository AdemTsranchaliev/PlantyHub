import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import MailRounded from '@mui/icons-material/MailRounded'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import LocalOfferRounded from '@mui/icons-material/LocalOfferRounded'
import { newsletterApi } from '../../api'
import { brand } from '../../theme'

export default function AdminNewsletterPage() {
  const { t } = useTranslation()
  const [subscriberCount, setSubscriberCount] = useState(0)

  useEffect(() => {
    void newsletterApi.getStats().then((stats) => setSubscriberCount(stats.totalSubscribers))
  }, [])

  return (
    <>
      <AdminPageHeader title={t('admin.newsletter.title')} subtitle={t('admin.newsletter.subtitle')} />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard
            label={t('admin.newsletter.stats.subscribers')}
            value={subscriberCount.toLocaleString()}
            icon={<MailRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard
            label={t('admin.newsletter.stats.openRate')}
            value="42%"
            icon={<TrendingUpRounded />}
            trend={t('admin.newsletter.stats.openRateTrend')}
            trendUp
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdminStatCard
            label={t('admin.newsletter.stats.activeCodes')}
            value="3"
            icon={<LocalOfferRounded />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: brand.white,
              borderRadius: '20px',
              border: `1px solid ${brand.border}`,
              p: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 2 }}>
              {t('admin.newsletter.popupSettings')}
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked disabled sx={{ '& .Mui-checked': { color: brand.plantGreen } }} />}
              label={t('admin.newsletter.enablePopup')}
              sx={{ display: 'block', mb: 1.5 }}
            />
            <FormControlLabel
              control={<Switch defaultChecked disabled sx={{ '& .Mui-checked': { color: brand.plantGreen } }} />}
              label={t('admin.newsletter.exitIntent')}
              sx={{ display: 'block', mb: 1.5 }}
            />
            <TextField
              label={t('admin.newsletter.discountCode')}
              defaultValue="WELCOME10"
              fullWidth
              disabled
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: brand.white,
              borderRadius: '20px',
              border: `1px solid ${brand.border}`,
              p: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: brand.graphite, mb: 2 }}>
              {t('admin.newsletter.sendCampaign')}
            </Typography>
            <TextField label={t('admin.newsletter.subject')} fullWidth disabled sx={{ mb: 2 }} />
            <TextField label={t('admin.newsletter.message')} multiline rows={4} fullWidth disabled sx={{ mb: 2 }} />
            <Button variant="contained" disabled>
              {t('admin.newsletter.send')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}
