// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 主入口页面
// ────────────────────────────────────────────────
// 页面骨架：GlassHeader + Tab 切换(广场/我的) + FAB + CreationBottomSheet
// ────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ImagePlus, FolderOpen } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useFeed } from './hooks/useFeed'
import { useGenerateEngine } from './hooks/useGenerateEngine'
import { useProjects } from './hooks/useProjects'
import { GlassHeader } from './components/GlassHeader'
import { MasonryFeed } from './components/MasonryFeed'
import { GeneratingSkeleton } from './components/GeneratingSkeleton'
import { CreationBottomSheet } from './components/CreationBottomSheet'
import { MyGalleryView } from './components/MyGalleryView'
import { MAIN_TABS, type MainTabKey } from './constants'
import { fabVariants } from './utils/animations'
import type { GeneratePosterPayload, GenerateIllustrationPayload } from './types'

export function TypoCraftPage() {
  const [activeTab, setActiveTab] = useState<MainTabKey>('feed')
  const [sheetOpen, setSheetOpen] = useState(false)

  const feed = useFeed()
  const engine = useGenerateEngine()
  const projects = useProjects()

  const handleSubmitPoster = useCallback(
    async (payload: GeneratePosterPayload) => engine.submitPoster(payload),
    [engine],
  )

  const handleSubmitIllustration = useCallback(
    async (payload: GenerateIllustrationPayload) => engine.submitIllustration(payload),
    [engine],
  )

  const hasPendingItems = engine.pendingAssets.length > 0

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-zinc-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-950">
      {/* 毛玻璃吸顶导航 */}
      <GlassHeader
        rightSlot={
          <button
            onClick={() => setSheetOpen(true)}
            className="p-1.5 rounded-xl hover:bg-black/5 active:scale-90 transition-all"
          >
            <FolderOpen className="size-4.5 text-zinc-500 dark:text-zinc-400" />
          </button>
        }
      />

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 space-y-4">
          {/* Tab 切换 */}
          <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
            {MAIN_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                  'active:scale-[0.97]',
                  activeTab === t.key
                    ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-400 dark:text-zinc-500',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 乐观渲染：生成中的卡片 */}
          <AnimatePresence>
            {hasPendingItems && activeTab === 'feed' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {engine.pendingAssets.map(asset => (
                  <GeneratingSkeleton
                    key={asset.id}
                    asset={asset}
                    onRemove={engine.removePending}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab 内容 */}
          {activeTab === 'feed' ? (
            <MasonryFeed
              data={feed.data}
              loading={feed.loading}
              loadingMore={feed.loadingMore}
              hasMore={feed.hasMore}
              onLoadMore={feed.loadMore}
            />
          ) : (
            <MyGalleryView />
          )}
        </div>
      </main>

      {/* 悬浮创作按钮 (FAB) */}
      <motion.button
        variants={fabVariants}
        initial="hidden"
        animate="visible"
        onClick={() => setSheetOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-violet-500 to-indigo-500',
          'text-white shadow-xl shadow-violet-300/40 dark:shadow-violet-900/40',
          'flex items-center justify-center',
          'active:scale-[0.9] transition-transform duration-150',
        )}
      >
        <Plus className="size-6" />
      </motion.button>

      {/* 创作抽屉 */}
      <CreationBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmitPoster={handleSubmitPoster}
        onSubmitIllustration={handleSubmitIllustration}
        projects={projects.data}
      />
    </div>
  )
}
