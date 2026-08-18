import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ImagePicker from '../../components/admin/ImagePicker'
import { siteAssetGroups } from '../../admin/siteAssetsSchema'
import { useSiteAssetsStore } from '../../hooks/useSiteAssets'
import { brand } from '../../theme'

export default function AdminMediaPage() {
  const { t } = useTranslation()
  const { images, setSiteAsset } = useSiteAssetsStore()
  const [error, setError] = useState('')

  const handleChange = async (key: string, url: string) => {
    setError('')
    try {
      await setSiteAsset(key, url)
    } catch {
      setError(t('admin.media.saveFailed'))
    }
  }

  return (
    <>
      <AdminPageHeader title={t('admin.media.title')} subtitle={t('admin.media.subtitle')} />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {siteAssetGroups.map((group) => (
          <Box
            key={group.id}
            sx={{
              bgcolor: brand.white,
              borderRadius: '20px',
              border: `1px solid ${brand.border}`,
              p: { xs: 2, sm: 2.5 },
            }}
          >
            <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '1.05rem', mb: 2 }}>
              {t(group.labelKey)}
            </Typography>
            <Stack spacing={2.5}>
              {group.slots.map((slot) => (
                <ImagePicker
                  key={slot.key}
                  label={t(slot.labelKey, { defaultValue: slot.key })}
                  value={images[slot.key] ?? slot.defaultUrl}
                  onChange={(url) => void handleChange(slot.key, url)}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  )
}
