import { NavLink } from 'react-router-dom'
import type { NavItem } from './nav-items'

interface Props {
  items: NavItem[]
}

export default function Sidebar({ items }: Props) {
  return (
    <nav className="hidden md:flex flex-col w-56 min-h-screen bg-brand-surface border-r border-brand-border py-6 px-4 gap-1 flex-shrink-0">
      {/* Brand wordmark */}
      <div className="mb-6 px-2">
        <span className="text-brand-accent font-bold text-xl tracking-tight">
          Falcon Lab
        </span>
      </div>

      {/* Main nav items */}
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-accent text-white'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-border'
            }`
          }
        >
          <span aria-hidden="true">{item.emoji}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      {/* Settings at the bottom */}
      <div className="mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-accent text-white'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-border'
            }`
          }
        >
          <span aria-hidden="true">⚙️</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  )
}
