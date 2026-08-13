import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import { NAV_ITEMS } from './nav-items'
import DashboardPage    from '../pages/DashboardPage'
import SiemPage         from '../pages/SiemPage'
import SoarPage         from '../pages/SoarPage'
import LtrPage          from '../pages/LtrPage'
import CharlotteAiPage  from '../pages/CharlotteAiPage'
import PlatformPage     from '../pages/PlatformPage'
import TutorPage        from '../pages/TutorPage'
import SettingsPage     from '../pages/SettingsPage'

// Re-export for consumers that need the nav config (e.g. tests)
export { NAV_ITEMS } from './nav-items'
export type { NavItem } from './nav-items'

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text">
      {/* Desktop persistent sidebar */}
      <Sidebar items={NAV_ITEMS} />

      {/* Main content — bottom padding on mobile so tab bar doesn't overlap */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <Routes>
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/siem/*"      element={<SiemPage />} />
          <Route path="/soar/*"      element={<SoarPage />} />
          <Route path="/ltr/*"       element={<LtrPage />} />
          <Route path="/charlotte/*" element={<CharlotteAiPage />} />
          <Route path="/platform/*"  element={<PlatformPage />} />
          <Route path="/tutor"       element={<TutorPage />} />
          <Route path="/settings"    element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Mobile/iPad bottom tab bar */}
      <TabBar items={NAV_ITEMS} />
    </div>
  )
}
