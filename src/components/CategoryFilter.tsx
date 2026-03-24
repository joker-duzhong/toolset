import { CATEGORIES } from '@/config/tools'
import { cn } from '@/utils/cn'
import type { ToolCategory } from '@/types/tool'

type ActiveCategory = ToolCategory | 'all'

interface CategoryFilterProps {
  active: ActiveCategory
  onChange: (category: ActiveCategory) => void
  className?: string
}

export function CategoryFilter({ active, onChange, className }: CategoryFilterProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 no-scrollbar', className)}>
      {/* 全部 */}
      <button
        onClick={() => onChange('all')}
        className={cn(
          'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition',
          active === 'all'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
        )}
      >
        全部
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={cn(
            'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition',
            active === cat.key
              ? 'bg-indigo-600 text-white shadow-sm'
              : `${cat.color} ${cat.textColor} hover:opacity-80`,
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
