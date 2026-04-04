import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { cn } from '@/utils/cn'
import { getCategoryInfo } from '@/config/tools'
import type { ToolItem } from '@/types/tool'

interface ToolCardProps {
  tool: ToolItem
  className?: string
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const navigate = useNavigate()
  const catInfo = getCategoryInfo(tool.category)

  // 动态获取 lucide-react 图标
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[tool.icon] as React.FC<{ className?: string; style?: React.CSSProperties }> | undefined

  const handleClick = () => {
    if (!tool.disabled) navigate(tool.path)
  }

  return (
    <button
      onClick={handleClick}
      disabled={tool.disabled}
      className={cn(
        'relative flex flex-col items-start gap-2 p-4 text-left',
        'active:scale-[0.98] transition-transform duration-150',
        tool.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-bg-base)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-light)',
      }}
    >
      {/* 角标 */}
      {tool.isNew && !tool.disabled && (
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)'
          }}
        >
          NEW
        </span>
      )}
      {tool.isHot && !tool.disabled && !tool.isNew && (
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
          style={{
            backgroundColor: '#EF5350',
            color: 'var(--color-text-inverse)'
          }}
        >
          HOT
        </span>
      )}
      {tool.disabled && (
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
          style={{
            backgroundColor: 'var(--color-text-tertiary)',
            color: 'var(--color-text-inverse)'
          }}
        >
          即将上线
        </span>
      )}

      {/* 图标 */}
      <div
        className={cn('flex items-center justify-center size-10')}
        style={{
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-light)'
        }}
      >
        {IconComponent ? (
          <IconComponent
            className="size-5"
            style={{ color: 'var(--color-primary)' }}
          />
        ) : (
          <span className="text-lg" style={{ color: 'var(--color-primary)' }}>🔧</span>
        )}
      </div>

      {/* 名称 & 描述 */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {tool.name}
        </p>
        <p
          className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {tool.description}
        </p>
      </div>

      {/* 分类标签 */}
      <span
        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)'
        }}
      >
        {catInfo.label}
      </span>
    </button>
  )
}
