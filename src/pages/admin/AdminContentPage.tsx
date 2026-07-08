import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import HomepageSectionEditor from '../../components/admin/HomepageSectionEditor'
import { homepageSectionOrder } from '../../admin/homepageSchema'
import { useHomepageStore } from '../../hooks/useHomepage'

export default function AdminContentPage() {
  const { t } = useTranslation()
  const { resetHomepageState: reset } = useHomepageStore()

  return (
    <>
      <AdminPageHeader
        title={t('admin.homepage.title')}
        subtitle={t('admin.homepage.subtitle')}
        action={
          <Button variant="outlined" onClick={() => reset()}>
            {t('admin.homepage.reset')}
          </Button>
        }
      />

      <Stack spacing={0}>
        {homepageSectionOrder.map((sectionKey) => (
          <HomepageSectionEditor key={sectionKey} sectionKey={sectionKey} />
        ))}
      </Stack>
    </>
  )
}
