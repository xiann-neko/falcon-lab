import { NavLink } from 'react-router-dom'
import type { NavItem } from './nav-items'

interface Props {
  items: NavItem[]
}

// All 7 nav items appear in the tab bar — spec requires "same pages, larger touch targets" on iPad
export default function TabBar({ items }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-brand-border flex items-center justify-around px-1 h-16 z-50">
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-0 transition-colors ${
              isActive ? 'text-brand-accent' : 'text-brand-muted'
            }`
          }
        >
          <span className="text-xl leading-none" aria-hidden="true">{item.emoji}</span>
          <span className="text-[10px] font-medium truncate max-w-[56px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
