// ────────────────────────────────────────────────
// 影视大全 - 分类标签栏组件
// ────────────────────────────────────────────────

import type { CategoryTab } from '../types'

const TABS: CategoryTab[] = [
  { key: 'all', label: '推荐' },
  { key: 'movie', label: '电影' },
  { key: 'tv', label: '电视剧' },
  { key: 'anime', label: '动漫' },
  { key: 'variety', label: '综艺' },
  { key: 'documentary', label: '纪录片' },
]

interface CategoryTabsProps {
  active: string
  onChange: (key: string) => void
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-1 lg:gap-2 overflow-x-auto scrollbar-hide py-1" style={{ scrollbarWidth: 'none' }}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-shrink-0 px-4 py-1.5 lg:px-5 lg:py-2 rounded-full text-sm lg:text-base font-medium transition-all ${
            active === tab.key
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
