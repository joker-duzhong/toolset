// ────────────────────────────────────────────────
// 言图 (TypoCraft) - AI 思考态占位卡片
// ────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { OptimisticAsset } from '../types'

interface GeneratingSkeletonProps {
  asset: OptimisticAsset
  onRemove?: (id: string) => void
}

export function GeneratingSkeleton({ asset, onRemove }: GeneratingSkeletonProps) {
  const isFailed = asset.status === 'FAILED' || asset.status === 'REJECTED'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl',
        'border border-white/40 dark:border-zinc-800/50 shadow-sm',
        isFailed && 'border-red-200 dark:border-red-900/50',
      )}
    >
      {/* 流光动画背景 */}
      <div className="aspect-square relative overflow-hidden">
        {isFailed ? (
          // 失败态
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900/30 flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-2xl">😔</span>
            <p className="text-xs text-red-400 dark:text-red-300 text-center">生成失败，请重试</p>
            {onRemove && (
              <button
                onClick={() => onRemove(asset.id)}
                className="text-xs text-red-500 underline underline-offset-2 active:scale-95 transition-transform"
              >
                关闭
              </button>
            )}
          </div>
        ) : (
          // PENDING 态：流光呼吸
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-100 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-sky-900/30">
            {/* 呼吸光晕 */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 40%, rgba(139,92,246,0.15) 0%, transparent 60%)',
                  'radial-gradient(circle at 70% 60%, rgba(99,102,241,0.2) 0%, transparent 60%)',
                  'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.15) 0%, transparent 60%)',
                  'radial-gradient(circle at 30% 40%, rgba(139,92,246,0.15) 0%, transparent 60%)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* 流光条 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.4) 37%, transparent 63%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
            {/* 中间文字 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
              <p className="text-xs text-violet-500/80 dark:text-violet-300/80 font-medium">
                AI 正在构思画面细节...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示词 */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">
          {asset.prompt}
        </p>
      </div>
    </motion.div>
  )
}
