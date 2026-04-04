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
          'flex-shrink-0 px-3.5 py-1.5 text-xs font-medium transition',
        )}
        style={{
          borderRadius: 'var(--radius-full)',
          backgroundColor: active === 'all' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
          color: active === 'all' ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
        }}
      >
        全部
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className="flex-shrink-0 px-3.5 py-1.5 text-xs font-medium transition"
          style={{
            borderRadius: 'var(--radius-full)',
            backgroundColor: active === cat.key ? 'var(--color-primary)' : 'var(--color-primary-light)',
            color: active === cat.key ? 'var(--color-text-inverse)' : 'var(--color-primary)',
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
