import DashboardRounded from '@mui/icons-material/DashboardRounded'
import YardRounded from '@mui/icons-material/YardRounded'
import SpaRounded from '@mui/icons-material/SpaRounded'
import ScienceRounded from '@mui/icons-material/ScienceRounded'
import CategoryRounded from '@mui/icons-material/CategoryRounded'
import ShoppingBagRounded from '@mui/icons-material/ShoppingBagRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import ArticleRounded from '@mui/icons-material/ArticleRounded'
import MailRounded from '@mui/icons-material/MailRounded'
import SettingsRounded from '@mui/icons-material/SettingsRounded'
import type { SvgIconComponent } from '@mui/icons-material'

export type AdminNavItem = {
  path: string
  labelKey: string
  icon: SvgIconComponent
  group?: 'catalog'
}

export const adminNavItems: AdminNavItem[] = [
  { path: '/admin', labelKey: 'admin.nav.dashboard', icon: DashboardRounded },
  { path: '/admin/gardens', labelKey: 'admin.nav.gardens', icon: YardRounded, group: 'catalog' },
  { path: '/admin/pods', labelKey: 'admin.nav.pods', icon: SpaRounded, group: 'catalog' },
  { path: '/admin/consumables', labelKey: 'admin.nav.consumables', icon: ScienceRounded, group: 'catalog' },
  { path: '/admin/accessories', labelKey: 'admin.nav.accessories', icon: CategoryRounded, group: 'catalog' },
  { path: '/admin/orders', labelKey: 'admin.nav.orders', icon: ShoppingBagRounded },
  { path: '/admin/customers', labelKey: 'admin.nav.customers', icon: PeopleRounded },
  { path: '/admin/content', labelKey: 'admin.nav.content', icon: ArticleRounded },
  { path: '/admin/newsletter', labelKey: 'admin.nav.newsletter', icon: MailRounded },
  { path: '/admin/settings', labelKey: 'admin.nav.settings', icon: SettingsRounded },
]

export const adminCatalogItems = adminNavItems.filter((item) => item.group === 'catalog')
