// ────────────────────────────────────────────────
// 影视大全 - PC 端导航组件（水平 / 垂直布局）
// ────────────────────────────────────────────────

import { Home, Search, Grid3X3, User } from 'lucide-react'
import type { TabKey } from './BottomNav'

interface SideNavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
  layout?: 'horizontal' | 'vertical'
}

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'category', label: '分类', icon: Grid3X3 },
  { key: 'search', label: '搜索', icon: Search },
  { key: 'mine', label: '我的', icon: User },
]

export function SideNav({ active, onChange, layout = 'horizontal' }: SideNavProps) {
  if (layout === 'horizontal') {
    return (
      <nav className="flex items-center gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              active === key
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
    )
  }

  // vertical layout (侧边栏模式)
  return (
    <nav className="flex flex-col gap-1 p-3">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
            active === key
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <Icon className="size-5" />
          {label}
        </button>
      ))}
    </nav>
  )
}
