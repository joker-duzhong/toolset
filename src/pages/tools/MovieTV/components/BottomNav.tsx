// ────────────────────────────────────────────────
// 影视大全 - 底部导航栏组件
// ────────────────────────────────────────────────

import { Home, Search, Grid3X3, User } from 'lucide-react'

export type TabKey = 'home' | 'category' | 'search' | 'mine'

interface BottomNavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'category', label: '分类', icon: Grid3X3 },
  { key: 'search', label: '搜索', icon: Search },
  { key: 'mine', label: '我的', icon: User },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-100 flex items-center justify-around px-2 py-1.5 safe-area-bottom">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
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
