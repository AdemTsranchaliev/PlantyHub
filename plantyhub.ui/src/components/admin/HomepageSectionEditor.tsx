import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'
import { useTranslation } from 'react-i18next'
import type { LanguageCode } from '../../i18n/languages'
import {
  type HomepageSectionKey,
  type SchemaField,
  homepageSectionMeta,
  homepageSectionsSchema,
} from '../../admin/homepageSchema'
import { useHomepageStore } from '../../hooks/useHomepage'
import ImagePicker from './ImagePicker'
import AdminFieldGroup from './AdminFieldGroup'
import { brand } from '../../theme'

type Props = {
  sectionKey: HomepageSectionKey
  lang: LanguageCode
}

function groupFields(fields: SchemaField[]) {
  const groups: { id: string; fields: SchemaField[] }[] = []
  for (const field of fields) {
    const last = groups[groups.length - 1]
    if (last && last.id === field.group) last.fields.push(field)
    else groups.push({ id: field.group, fields: [field] })
  }
  return groups
}

function clusterFields(fields: SchemaField[]) {
  const clusters: { id: string | null; fields: SchemaField[] }[] = []
  for (const field of fields) {
    const id = field.cluster ?? null
    const last = clusters[clusters.length - 1]
    if (id && last && last.id === id) last.fields.push(field)
    else clusters.push({ id, fields: [field] })
  }
  return clusters
}

export default function HomepageSectionEditor({ sectionKey, lang }: Props) {
  const { t } = useTranslation()
  const { state, setSectionEnabled, setHomepageText, setHomepageImage } = useHomepageStore()
  const fields = homepageSectionsSchema[sectionKey]
  const enabled = state.sections[sectionKey]
  const meta = homepageSectionMeta[sectionKey]

  const renderField = (field: SchemaField) => {
    if (field.kind === 'image') {
      const value = state.images[field.key] ?? field.defaultUrl
      return (
        <ImagePicker
          key={field.key}
          label={t(field.labelKey)}
          value={value}
          onChange={(url) => setHomepageImage(field.key, url)}
          size="medium"
        />
      )
    }
    const value = state.texts[lang]?.[field.key] ?? ''
    return (
      <TextField
        key={`${field.key}-${lang}`}
        label={t(field.labelKey)}
        value={value}
        onChange={(e) => setHomepageText(lang, field.key, e.target.value)}
        multiline={field.kind === 'textarea'}
        minRows={field.kind === 'textarea' ? 3 : undefined}
      />
    )
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          bgcolor: brand.white,
          border: `1px solid ${brand.border}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: brand.graphite, mb: 0.5 }}>
              {t(`admin.content.sections.${sectionKey}`)}
            </Typography>
            <Typography sx={{ color: brand.textSecondary, fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t(`admin.homepage.sectionHelp.${sectionKey}`)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              component="a"
              href={meta.href}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              startIcon={<OpenInNewRounded />}
              sx={{ minHeight: 40, px: 1.75 }}
            >
              {t('admin.homepage.viewOnSite')}
            </Button>
            <FormControlLabel
              control={<Switch checked={enabled} onChange={(e) => setSectionEnabled(sectionKey, e.target.checked)} />}
              label={enabled ? t('admin.homepage.visible') : t('admin.homepage.hidden')}
            />
          </Stack>
        </Stack>
      </Box>

      {groupFields(fields).map((group) => (
        <AdminFieldGroup key={group.id} title={t(`admin.homepage.groups.${group.id}`)}>
          {clusterFields(group.fields).map((cluster, index) => {
            if (!cluster.id || cluster.fields.length === 1) {
              return (
                <Box key={cluster.id ?? `${group.id}-${index}`}>
                  <Stack spacing={1.75}>{cluster.fields.map((field) => renderField(field))}</Stack>
                </Box>
              )
            }
            return (
              <Box
                key={cluster.id}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: brand.surface,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <Grid container spacing={1.5}>
                  {cluster.fields.map((field) => (
                    <Grid key={field.key} size={{ xs: 12, sm: field.kind === 'textarea' || field.kind === 'image' ? 12 : 6 }}>
                      {renderField(field)}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )
          })}
        </AdminFieldGroup>
      ))}
    </Stack>
  )
}
