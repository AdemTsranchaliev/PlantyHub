import DashboardRounded from '@mui/icons-material/DashboardRounded'
import YardRounded from '@mui/icons-material/YardRounded'
import SpaRounded from '@mui/icons-material/SpaRounded'
import ScienceRounded from '@mui/icons-material/ScienceRounded'
import CategoryRounded from '@mui/icons-material/CategoryRounded'
import ShoppingBagRounded from '@mui/icons-material/ShoppingBagRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import ArticleRounded from '@mui/icons-material/ArticleRounded'
import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded'
import MailRounded from '@mui/icons-material/MailRounded'
import EmailRounded from '@mui/icons-material/EmailRounded'
import SettingsRounded from '@mui/icons-material/SettingsRounded'
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded'
import PercentRounded from '@mui/icons-material/PercentRounded'
import AssessmentRounded from '@mui/icons-material/AssessmentRounded'
import type { SvgIconComponent } from '@mui/icons-material'

export type AdminNavItem = {
  path: string
  labelKey: string
  icon: SvgIconComponent
}

export type AdminNavGroup = {
  id: string
  labelKey?: string
  items: AdminNavItem[]
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: 'overview',
    items: [{ path: '/admin', labelKey: 'admin.nav.dashboard', icon: DashboardRounded }],
  },
  {
    id: 'catalog',
    labelKey: 'admin.nav.groups.catalog',
    items: [
      { path: '/admin/gardens', labelKey: 'admin.nav.gardens', icon: YardRounded },
      { path: '/admin/pods', labelKey: 'admin.nav.pods', icon: SpaRounded },
      { path: '/admin/consumables', labelKey: 'admin.nav.consumables', icon: ScienceRounded },
      { path: '/admin/accessories', labelKey: 'admin.nav.accessories', icon: CategoryRounded },
    ],
  },
  {
    id: 'sales',
    labelKey: 'admin.nav.groups.sales',
    items: [
      { path: '/admin/orders', labelKey: 'admin.nav.orders', icon: ShoppingBagRounded },
      { path: '/admin/customers', labelKey: 'admin.nav.customers', icon: PeopleRounded },
      { path: '/admin/couriers', labelKey: 'admin.nav.couriers', icon: LocalShippingRounded },
      { path: '/admin/vat', labelKey: 'admin.nav.vat', icon: PercentRounded },
      { path: '/admin/reports', labelKey: 'admin.nav.reports', icon: AssessmentRounded },
    ],
  },
  {
    id: 'content',
    labelKey: 'admin.nav.groups.content',
    items: [
      { path: '/admin/content', labelKey: 'admin.nav.content', icon: ArticleRounded },
      { path: '/admin/media', labelKey: 'admin.nav.media', icon: PhotoLibraryRounded },
      { path: '/admin/emails', labelKey: 'admin.nav.emails', icon: EmailRounded },
      { path: '/admin/newsletter', labelKey: 'admin.nav.newsletter', icon: MailRounded },
    ],
  },
  {
    id: 'system',
    labelKey: 'admin.nav.groups.system',
    items: [{ path: '/admin/settings', labelKey: 'admin.nav.settings', icon: SettingsRounded }],
  },
]

export const adminNavItems = adminNavGroups.flatMap((group) => group.items)
export const adminCatalogItems = adminNavGroups.find((group) => group.id === 'catalog')?.items ?? []
