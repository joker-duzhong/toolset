// ────────────────────────────────────────────────
// Trade Copilot - 空状态占位组件
// ────────────────────────────────────────────────

import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: typeof Inbox
  title?: string
  description?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title = '暂无数据',
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="size-8 text-gray-300" />
      </div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      {description && (
        <p className="text-gray-400 text-xs mt-1 max-w-[240px]">{description}</p>
      )}
    </div>
  )
}
