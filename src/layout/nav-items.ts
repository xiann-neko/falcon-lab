export interface NavItem {
  path:  string
  label: string
  emoji: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/',          label: 'Dashboard',   emoji: '📊' },
  { path: '/siem',      label: 'SIEM',        emoji: '📡' },
  { path: '/soar',      label: 'SOAR',        emoji: '⚡' },
  { path: '/ltr',       label: 'LTR',         emoji: '🗄️' },
  { path: '/charlotte', label: 'Charlotte AI', emoji: '🤖' },
  { path: '/platform',  label: 'Platform',    emoji: '🔧' },
  { path: '/tutor',     label: 'Tutor',       emoji: '🧠' },
]
