import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SaveRounded from '@mui/icons-material/SaveRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { emailTemplatesApi } from '../../api'
import type { ApiEmailTemplateDetail, ApiEmailTemplateSummary } from '../../api/types'
import { brand } from '../../theme'

export default function AdminEmailsPage() {
  const { t } = useTranslation()
  const [list, setList] = useState<ApiEmailTemplateSummary[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [detail, setDetail] = useState<ApiEmailTemplateDetail | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [sampleJson, setSampleJson] = useState('{}')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewSubject, setPreviewSubject] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const items = await emailTemplatesApi.list()
      setList(items)
      if (!selectedKey && items[0]) setSelectedKey(items[0].key)
    } finally {
      setLoading(false)
    }
  }, [selectedKey])

  useEffect(() => {
    void loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  useEffect(() => {
    if (!selectedKey) return
    void (async () => {
      setMessage(null)
      const item = await emailTemplatesApi.get(selectedKey)
      setDetail(item)
      setName(item.name)
      setDescription(item.description)
      setSubject(item.subject)
      setHtmlBody(item.htmlBody)
      setSampleJson(JSON.stringify(item.sampleData, null, 2))
      const preview = await emailTemplatesApi.preview(selectedKey, item.sampleData)
      setPreviewSubject(preview.subject)
      setPreviewHtml(preview.html)
    })()
  }, [selectedKey])

  const sampleData = useMemo(() => {
    try {
      return JSON.parse(sampleJson) as Record<string, string>
    } catch {
      return null
    }
  }, [sampleJson])

  const refreshPreview = async () => {
    if (!selectedKey || !sampleData) {
      setMessage({ type: 'error', text: t('admin.emails.invalidSampleJson') })
      return
    }
    const preview = await emailTemplatesApi.preview(selectedKey, sampleData)
    setPreviewSubject(preview.subject)
    setPreviewHtml(preview.html)
  }

  const handleSave = async () => {
    if (!selectedKey || !sampleData) {
      setMessage({ type: 'error', text: t('admin.emails.invalidSampleJson') })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const updated = await emailTemplatesApi.update(selectedKey, {
        name,
        description,
        subject,
        htmlBody,
        sampleData,
      })
      setDetail(updated)
      await loadList()
      await refreshPreview()
      setMessage({ type: 'success', text: t('admin.emails.saved') })
    } catch {
      setMessage({ type: 'error', text: t('admin.emails.saveFailed') })
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!selectedKey || !sampleData) {
      setMessage({ type: 'error', text: t('admin.emails.invalidSampleJson') })
      return
    }
    if (!testEmail.trim().includes('@')) {
      setMessage({ type: 'error', text: t('admin.emails.testEmailRequired') })
      return
    }
    setMessage(null)
    try {
      const result = await emailTemplatesApi.sendTest(selectedKey, testEmail.trim(), sampleData)
      setMessage({ type: 'success', text: result.message })
    } catch {
      setMessage({ type: 'error', text: t('admin.emails.testFailed') })
    }
  }

  return (
    <>
      <AdminPageHeader title={t('admin.emails.title')} subtitle={t('admin.emails.subtitle')} />

      {message && (
        <Alert severity={message.type} sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${brand.border}` }}>
              <Typography sx={{ fontWeight: 700, color: brand.graphite }}>{t('admin.emails.templates')}</Typography>
            </Box>
            <List dense disablePadding>
              {list.map((item) => (
                <ListItemButton
                  key={item.key}
                  selected={item.key === selectedKey}
                  onClick={() => setSelectedKey(item.key)}
                  sx={{
                    '&.Mui-selected': { bgcolor: brand.plantGreenMuted },
                    '&.Mui-selected:hover': { bgcolor: brand.plantGreenMuted },
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={item.key}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItemButton>
              ))}
              {!loading && list.length === 0 && (
                <Typography sx={{ p: 2, color: brand.textSecondary, fontSize: '0.9rem' }}>
                  {t('admin.emails.empty')}
                </Typography>
              )}
            </List>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {detail && (
            <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, p: 2.5 }}>
              <Stack spacing={2}>
                <TextField label={t('admin.emails.name')} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
                <TextField
                  label={t('admin.emails.description')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t('admin.emails.subject')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  fullWidth
                  size="small"
                  helperText={t('admin.emails.variablesHint')}
                />
                <TextField
                  label={t('admin.emails.htmlBody')}
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  fullWidth
                  multiline
                  minRows={12}
                  size="small"
                  InputProps={{ sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.82rem' } }}
                />
                <TextField
                  label={t('admin.emails.sampleData')}
                  value={sampleJson}
                  onChange={(e) => setSampleJson(e.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  size="small"
                  InputProps={{ sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.82rem' } }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button variant="contained" startIcon={<SaveRounded />} onClick={() => void handleSave()} disabled={saving}>
                    {t('admin.emails.save')}
                  </Button>
                  <Button variant="outlined" onClick={() => void refreshPreview()}>
                    {t('admin.emails.refreshPreview')}
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                  <TextField
                    label={t('admin.emails.testEmail')}
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button variant="outlined" startIcon={<SendRounded />} onClick={() => void handleSendTest()} sx={{ whiteSpace: 'nowrap' }}>
                    {t('admin.emails.sendTest')}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ bgcolor: brand.white, borderRadius: '20px', border: `1px solid ${brand.border}`, overflow: 'hidden', height: '100%' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${brand.border}` }}>
              <Typography sx={{ fontWeight: 700, color: brand.graphite }}>{t('admin.emails.preview')}</Typography>
              {previewSubject && (
                <Typography sx={{ color: brand.textSecondary, fontSize: '0.85rem', mt: 0.5 }}>{previewSubject}</Typography>
              )}
            </Box>
            <Box
              component="iframe"
              title="email-preview"
              srcDoc={previewHtml}
              sx={{ width: '100%', height: 640, border: 0, bgcolor: brand.surface, display: 'block' }}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  )
}
