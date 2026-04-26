// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 瀑布流画廊
// ────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { AssetFeedItem } from '../types'
import { AssetCard } from './AssetCard'
import { masonryContainerVariants } from '../utils/animations'

interface MasonryFeedProps {
  data: AssetFeedItem[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  className?: string
}

export function MasonryFeed({
  data,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  className,
}: MasonryFeedProps) {
  if (loading) {
    return <FeedSkeleton />
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">广场暂无作品，快来创作第一张吧</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        variants={masonryContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.map((asset, idx) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            // 周期性给部分卡片更宽的 span，营造 Bento 错落感
            span={idx % 7 === 0 ? 'wide' : idx % 11 === 0 ? 'tall' : 'normal'}
          />
        ))}
      </motion.div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium',
              'bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl',
              'border border-white/40 dark:border-zinc-700/50',
              'text-zinc-600 dark:text-zinc-300',
              'active:scale-[0.96] transition-all duration-200',
              'hover:bg-white/80 dark:hover:bg-zinc-800/80',
              'disabled:opacity-50',
            )}
          >
            {loadingMore && <Loader2 className="size-3.5 animate-spin" />}
            {loadingMore ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  )
}

/** 首次加载骨架屏 */
function FeedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-2xl overflow-hidden',
            'bg-white/40 dark:bg-zinc-900/40',
            i % 7 === 0 ? 'col-span-2' : '',
          )}
        >
          <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
          <div className="px-3 py-2.5 space-y-1.5">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
