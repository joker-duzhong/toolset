// ────────────────────────────────────────────────
// 影视大全 - 加载与空状态组件
// ────────────────────────────────────────────────

import { Loader2, Film, SearchX } from 'lucide-react'

export function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="size-8 animate-spin text-indigo-400 mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export function EmptyState({
  icon: Icon = Film,
  title = '暂无内容',
  description = '换个关键词试试吧',
}: {
  icon?: typeof Film
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Icon className="size-12 mb-3 text-gray-300" />
      <p className="text-base font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  )
}

export function SearchEmpty() {
  return (
    <EmptyState
      icon={SearchX}
      title="没有找到相关影视"
      description="试试其他关键词，如电影名、演员名、类型等"
    />
  )
}
