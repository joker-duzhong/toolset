// ────────────────────────────────────────────────
// Trade Copilot - 底部导航栏
// ────────────────────────────────────────────────

import { TABS, type TabKey } from '../constants'

interface BottomNavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-100 flex items-center justify-around px-1 py-1.5"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition active:scale-[0.97] ${
            active === key
              ? 'text-indigo-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Icon className={`size-5 ${active === key ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
