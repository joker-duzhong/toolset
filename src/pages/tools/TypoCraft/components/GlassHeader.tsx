// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 毛玻璃吸顶导航栏
// ────────────────────────────────────────────────

import { ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface GlassHeaderProps {
  rightSlot?: React.ReactNode
  className?: string
}

export function GlassHeader({ rightSlot, className }: GlassHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between px-4 h-12',
        'bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl',
        'border-b border-white/30 dark:border-zinc-800/40',
        className,
      )}
    >
      {/* 左侧：返回 */}
      <button
        onClick={() => navigate(-1)}
        className="active:scale-[0.92] transition-transform duration-150 p-1.5 -ml-1.5 rounded-xl hover:bg-black/5"
      >
        <ArrowLeft className="size-5 text-zinc-600 dark:text-zinc-300" />
      </button>

      {/* 中间：Logo & 标题 */}
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-4 text-violet-500" />
        <span className="font-semibold text-sm tracking-tight text-zinc-800 dark:text-zinc-100">
          言图
        </span>
      </div>

      {/* 右侧：自定义插槽 */}
      <div className="flex items-center gap-2">
        {rightSlot ?? <div className="w-8" />}
      </div>
    </header>
  )
}
