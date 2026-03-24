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
  const IconComponent = (Icons as any)[tool.icon] as React.FC<{ className?: string }> | undefined

  const handleClick = () => {
    if (!tool.disabled) navigate(tool.path)
  }

  return (
    <button
      onClick={handleClick}
      disabled={tool.disabled}
      className={cn(
        'relative flex flex-col items-start gap-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-left',
        'active:scale-95 transition-transform duration-150',
        tool.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-indigo-200 hover:shadow-md cursor-pointer',
        className,
      )}
    >
      {/* 角标 */}
      {tool.isNew && !tool.disabled && (
        <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-full leading-none">
          NEW
        </span>
      )}
      {tool.isHot && !tool.disabled && !tool.isNew && (
        <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-full leading-none">
          HOT
        </span>
      )}
      {tool.disabled && (
        <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-gray-400 px-1.5 py-0.5 rounded-full leading-none">
          即将上线
        </span>
      )}

      {/* 图标 */}
      <div className={cn('flex items-center justify-center size-10 rounded-xl', catInfo.color)}>
        {IconComponent ? (
          <IconComponent className={cn('size-5', catInfo.textColor)} />
        ) : (
          <span className={cn('text-lg', catInfo.textColor)}>🔧</span>
        )}
      </div>

      {/* 名称 & 描述 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{tool.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* 分类标签 */}
      <span
        className={cn(
          'text-[10px] font-medium px-2 py-0.5 rounded-full',
          catInfo.color,
          catInfo.textColor,
        )}
      >
        {catInfo.label}
      </span>
    </button>
  )
}
