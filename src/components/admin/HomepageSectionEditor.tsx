import { useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../../i18n/languages'
import type { LanguageCode } from '../../i18n/languages'
import {
  type HomepageSectionKey,
  homepageSectionsSchema,
} from '../../admin/homepageSchema'
import { useHomepageStore } from '../../hooks/useHomepage'
import { brand } from '../../theme'

type Props = {
  sectionKey: HomepageSectionKey
}

export default function HomepageSectionEditor({ sectionKey }: Props) {
  const { t } = useTranslation()
  const { state, setSectionEnabled, setHomepageText, setHomepageImage } = useHomepageStore()
  const [lang, setLang] = useState<LanguageCode>('en')
  const fields = homepageSectionsSchema[sectionKey]
  const enabled = state.sections[sectionKey]

  return (
    <Accordion
      disableGutters
      sx={{
        bgcolor: brand.white,
        border: `1px solid ${brand.border}`,
        borderRadius: '16px !important',
        mb: 1.5,
        '&:before': { display: 'none' },
        overflow: 'hidden',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
          <Typography sx={{ fontWeight: 700, color: brand.graphite }}>
            {t(`admin.content.sections.${sectionKey}`)}
          </Typography>
          <FormControlLabel
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            control={
              <Switch
                size="small"
                checked={enabled}
                onChange={(e) => setSectionEnabled(sectionKey, e.target.checked)}
                sx={{ '& .Mui-checked': { color: brand.plantGreen } }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.8rem', color: brand.textSecondary }}>
                {enabled ? t('admin.homepage.visible') : t('admin.homepage.hidden')}
              </Typography>
            }
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pb: 2.5, borderTop: `1px solid ${brand.border}` }}>
        <Tabs value={lang} onChange={(_, v) => setLang(v)} sx={{ mb: 2, minHeight: 40 }}>
          {supportedLanguages.map((l) => (
            <Tab key={l.code} value={l.code} label={l.short} sx={{ minHeight: 40, py: 0.5 }} />
          ))}
        </Tabs>
        <Stack spacing={2}>
          {fields.map((field) => {
            if (field.kind === 'image') {
              const value = state.images[field.key] ?? field.defaultUrl
              return (
                <Box key={field.key}>
                  <TextField
                    label={t(field.labelKey, { defaultValue: field.key })}
                    value={value}
                    onChange={(e) => setHomepageImage(field.key, e.target.value)}
                    fullWidth
                    size="small"
                  />
                  {value && (
                    <Box
                      component="img"
                      src={value}
                      alt=""
                      sx={{
                        mt: 1,
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: `1px solid ${brand.border}`,
                      }}
                    />
                  )}
                </Box>
              )
            }
            const value = state.texts[lang]?.[field.key] ?? ''
            return (
              <TextField
                key={`${field.key}-${lang}`}
                label={t(field.labelKey, { defaultValue: field.key })}
                value={value}
                onChange={(e) => setHomepageText(lang, field.key, e.target.value)}
                fullWidth
                size="small"
                multiline={field.kind === 'textarea'}
                minRows={field.kind === 'textarea' ? 2 : undefined}
              />
            )
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
