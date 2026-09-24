import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import HomepageSectionEditor from '../../components/admin/HomepageSectionEditor'
import {
  homepageSectionMeta,
  homepageSectionOrder,
  type HomepageSectionKey,
} from '../../admin/homepageSchema'
import { useHomepageStore } from '../../hooks/useHomepage'
import { subscribeHomepage } from '../../store/homepage'
import { supportedLanguages, type LanguageCode } from '../../i18n/languages'
import { brand } from '../../theme'

export default function AdminContentPage() {
  const { t, i18n } = useTranslation()
  const { state, resetHomepageState: reset } = useHomepageStore()
  const [sectionKey, setSectionKey] = useState<HomepageSectionKey>('hero')
  const uiLang = i18n.language?.split('-')[0]
  const [lang, setLang] = useState<LanguageCode>(
    uiLang === 'bg' || uiLang === 'de' || uiLang === 'fr' ? uiLang : 'en',
  )
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewTick, setPreviewTick] = useState(0)

  useEffect(() => {
    let timer = 0
    return subscribeHomepage(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setPreviewTick((value) => value + 1), 800)
    })
  }, [])

  const sectionHref = homepageSectionMeta[sectionKey].href
  const [previewPath, previewHash = ''] = sectionHref.split('#')
  const previewSrc = `${previewPath}${previewPath.includes('?') ? '&' : '?'}preview=${previewTick}${previewHash ? `#${previewHash}` : ''}`

  const handleReset = () => {
    if (window.confirm(t('admin.homepage.resetConfirm'))) reset()
  }

  return (
    <>
      <AdminPageHeader
        title={t('admin.homepage.title')}
        subtitle={t('admin.homepage.subtitle')}
        action={
          <Button variant="outlined" onClick={handleReset}>
            {t('admin.homepage.reset')}
          </Button>
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          mb: 2.5,
          p: 1.5,
          borderRadius: '16px',
          bgcolor: brand.white,
          border: `1px solid ${brand.border}`,
        }}
      >
        <Typography sx={{ fontWeight: 700, color: brand.graphite, fontSize: '0.9rem' }}>
          {t('admin.homepage.editingLang')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={lang}
          onChange={(_, value: LanguageCode | null) => {
            if (value) setLang(value)
          }}
          size="small"
        >
          {supportedLanguages.map((item) => (
            <ToggleButton key={item.code} value={item.code} sx={{ px: 1.75, fontWeight: 800, textTransform: 'none' }}>
              {item.short}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Grid container spacing={2.5} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Box
            sx={{
              bgcolor: brand.white,
              borderRadius: '20px',
              border: `1px solid ${brand.border}`,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: { md: 88 },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${brand.border}` }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: brand.textSecondary }}>
                {t('admin.homepage.outline')}
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' }, p: 1.5 }}>
              <TextField
                select
                label={t('admin.homepage.outline')}
                value={sectionKey}
                onChange={(e) => setSectionKey(e.target.value as HomepageSectionKey)}
              >
                {homepageSectionOrder.map((key, index) => (
                  <MenuItem key={key} value={key}>
                    {index + 1}. {t(`admin.content.sections.${key}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <List dense disablePadding sx={{ display: { xs: 'none', md: 'block' } }}>
              {homepageSectionOrder.map((key, index) => {
                const enabled = state.sections[key] ?? true
                const preview =
                  state.texts[lang]?.[homepageSectionMeta[key].previewKey] || t(homepageSectionMeta[key].previewKey)
                return (
                  <ListItemButton
                    key={key}
                    selected={key === sectionKey}
                    onClick={() => setSectionKey(key)}
                    sx={{
                      alignItems: 'flex-start',
                      py: 1.25,
                      px: 2,
                      '&.Mui-selected': { bgcolor: brand.plantGreenMuted },
                      '&.Mui-selected:hover': { bgcolor: brand.plantGreenMuted },
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        mr: 1.25,
                        mt: 0.1,
                        flexShrink: 0,
                        borderRadius: '8px',
                        bgcolor: key === sectionKey ? brand.plantGreen : brand.surface,
                        color: key === sectionKey ? brand.white : brand.textSecondary,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: brand.graphite }}>
                          {t(`admin.content.sections.${key}`)}
                        </Typography>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: enabled ? brand.plantGreen : brand.border,
                            flexShrink: 0,
                          }}
                          title={enabled ? t('admin.homepage.visible') : t('admin.homepage.hidden')}
                        />
                      </Stack>
                      {preview && (
                        <Typography noWrap sx={{ color: brand.textSecondary, fontSize: '0.75rem', mt: 0.25 }}>
                          {preview}
                        </Typography>
                      )}
                    </Box>
                  </ListItemButton>
                )
              })}
            </List>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <HomepageSectionEditor sectionKey={sectionKey} lang={lang} />
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 2.5,
          borderRadius: '20px',
          border: `1px solid ${brand.border}`,
          bgcolor: brand.white,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${brand.border}` }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, color: brand.graphite }}>{t('admin.homepage.preview')}</Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.8rem' }}>{t('admin.homepage.previewHint')}</Typography>
          </Box>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={device}
            onChange={(_, value: 'desktop' | 'mobile' | null) => {
              if (value) setDevice(value)
            }}
          >
            <ToggleButton value="desktop" sx={{ px: 1.75, fontWeight: 800, textTransform: 'none' }}>
              {t('admin.homepage.previewDesktop')}
            </ToggleButton>
            <ToggleButton value="mobile" sx={{ px: 1.75, fontWeight: 800, textTransform: 'none' }}>
              {t('admin.homepage.previewMobile')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Box sx={{ bgcolor: brand.surface, py: device === 'mobile' ? 2 : 0, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="iframe"
            key={previewSrc}
            title={t('admin.homepage.preview')}
            src={previewSrc}
            sx={{
              width: device === 'mobile' ? 390 : '100%',
              maxWidth: '100%',
              height: device === 'mobile' ? 720 : 640,
              border: 0,
              display: 'block',
              bgcolor: brand.white,
              borderRadius: device === 'mobile' ? '24px' : 0,
              boxShadow: device === 'mobile' ? brand.shadow : 'none',
            }}
          />
        </Box>
      </Box>
    </>
  )
}
