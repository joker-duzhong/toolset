// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 资产卡片
// ────────────────────────────────────────────────

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { AssetFeedItem } from '../types'
import { cardVariants } from '../utils/animations'

interface AssetCardProps {
  asset: AssetFeedItem
  className?: string
  span?: 'normal' | 'wide' | 'tall'
}

export function AssetCard({ asset, className, span = 'normal' }: AssetCardProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer',
        'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl',
        'border border-white/40 dark:border-zinc-800/50 shadow-sm',
        'active:scale-[0.97] transition-transform duration-200 ease-out',
        span === 'wide' && 'col-span-2',
        span === 'tall' && 'row-span-2',
        className,
      )}
    >
      {/* 图片容器 */}
      <div className="relative overflow-hidden aspect-square">
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
        )}
        <img
          src={asset.image_url}
          alt={asset.user_prompt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            'w-full h-full object-cover',
            'group-hover:scale-105 transition-transform duration-500 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-500',
          )}
        />
      </div>

      {/* 底部信息条 */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {asset.user_prompt}
        </p>
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {asset.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-500 dark:text-violet-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
