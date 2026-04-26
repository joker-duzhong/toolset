// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 创作抽屉 (Bottom Sheet)
// ────────────────────────────────────────────────

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImagePlus, Layers } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { CREATION_TABS, ASPECT_RATIOS, type CreationTabKey } from '../constants'
import type { GeneratePosterPayload, GenerateIllustrationPayload } from '../types'
import { sheetVariants, overlayVariants } from '../utils/animations'

interface CreationBottomSheetProps {
  open: boolean
  onClose: () => void
  onSubmitPoster: (payload: GeneratePosterPayload) => Promise<{ success: boolean; message?: string }>
  onSubmitIllustration: (payload: GenerateIllustrationPayload) => Promise<{ success: boolean; message?: string }>
  projects: { id: string; project_name: string }[]
}

export function CreationBottomSheet({
  open,
  onClose,
  onSubmitPoster,
  onSubmitIllustration,
  projects,
}: CreationBottomSheetProps) {
  const [tab, setTab] = useState<CreationTabKey>('poster')
  const [submitting, setSubmitting] = useState(false)
  const { status } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // ── 海报表单 ──
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')

  // ── 插图表单 ──
  const [projectId, setProjectId] = useState('')
  const [scenePrompt, setScenePrompt] = useState('')
  const [illAspectRatio, setIllAspectRatio] = useState('1:1')

  const handleSubmit = async () => {
    if (status !== 'authenticated') {
      setShowAuthModal(true)
      return
    }

    setSubmitting(true)
    try {
      let result: { success: boolean; message?: string }
      if (tab === 'poster') {
        if (!prompt.trim()) return
        result = await onSubmitPoster({ prompt: prompt.trim(), aspect_ratio: aspectRatio })
      } else {
        if (!projectId || !scenePrompt.trim()) return
        result = await onSubmitIllustration({
          project_id: projectId,
          scene_prompt: scenePrompt.trim(),
          aspect_ratio: illAspectRatio,
        })
      }
      if (result.success) {
        // 重置表单
        setPrompt('')
        setScenePrompt('')
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) onClose()
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* 遮罩 */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClose}
            />

            {/* 抽屉主体 */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) handleClose()
              }}
            >
              <div
                className={cn(
                  'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl',
                  'rounded-t-3xl border-t border-white/30 dark:border-zinc-800/40',
                  'shadow-[0_-8px_30px_rgba(0,0,0,0.08)]',
                )}
              >
                {/* 抓手 */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                </div>

                {/* 顶部栏 */}
                <div className="flex items-center justify-between px-5 py-2">
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
                    创作
                  </h3>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all"
                  >
                    <X className="size-4.5 text-zinc-400" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-5 mb-4">
                  {CREATION_TABS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200',
                        'active:scale-[0.96]',
                        tab === t.key
                          ? 'bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40'
                          : 'bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400',
                      )}
                    >
                      {t.key === 'poster' ? <ImagePlus className="size-3.5" /> : <Layers className="size-3.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* 表单内容 */}
                <div className="px-5 pb-8 space-y-4">
                  {tab === 'poster' ? (
                    <>
                      {/* 海报描述 */}
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                          海报描述
                        </label>
                        <textarea
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                          placeholder="描述你想要的海报画面..."
                          rows={3}
                          maxLength={500}
                          className={cn(
                            'w-full rounded-xl px-4 py-3 text-sm resize-none',
                            'bg-black/5 dark:bg-white/5 border-transparent',
                            'text-zinc-800 dark:text-zinc-100',
                            'focus:bg-white/50 dark:focus:bg-white/10 focus:ring-2 focus:ring-violet-500/30',
                            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                            'transition-all duration-200 outline-none',
                          )}
                        />
                      </div>

                      {/* 宽高比 */}
                      <RatioPicker value={aspectRatio} onChange={setAspectRatio} />
                    </>
                  ) : (
                    <>
                      {/* 项目选择 */}
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                          关联项目
                        </label>
                        {projects.length > 0 ? (
                          <select
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className={cn(
                              'w-full rounded-xl px-4 py-2.5 text-sm',
                              'bg-black/5 dark:bg-white/5 border-transparent',
                              'text-zinc-800 dark:text-zinc-100',
                              'focus:bg-white/50 dark:focus:bg-white/10 focus:ring-2 focus:ring-violet-500/30',
                              'transition-all duration-200 outline-none appearance-none',
                            )}
                          >
                            <option value="">选择项目...</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.project_name}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            暂无项目，请先创建一个 App 视觉项目
                          </p>
                        )}
                      </div>

                      {/* 场景描述 */}
                      <div>
                        <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                          页面描述
                        </label>
                        <textarea
                          value={scenePrompt}
                          onChange={e => setScenePrompt(e.target.value)}
                          placeholder="描述你想要的 App 页面插图..."
                          rows={3}
                          maxLength={500}
                          className={cn(
                            'w-full rounded-xl px-4 py-3 text-sm resize-none',
                            'bg-black/5 dark:bg-white/5 border-transparent',
                            'text-zinc-800 dark:text-zinc-100',
                            'focus:bg-white/50 dark:focus:bg-white/10 focus:ring-2 focus:ring-violet-500/30',
                            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                            'transition-all duration-200 outline-none',
                          )}
                        />
                      </div>

                      {/* 宽高比 */}
                      <RatioPicker value={illAspectRatio} onChange={setIllAspectRatio} />
                    </>
                  )}

                  {/* 提交按钮 */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || (tab === 'poster' ? !prompt.trim() : !projectId || !scenePrompt.trim())}
                    className={cn(
                      'w-full py-3 rounded-2xl text-sm font-semibold',
                      'bg-gradient-to-r from-violet-500 to-indigo-500',
                      'text-white shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30',
                      'active:scale-[0.97] transition-all duration-200',
                      'disabled:opacity-50 disabled:active:scale-100',
                    )}
                  >
                    {submitting ? '提交中...' : '开始生成'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 登录弹窗 (AuthModal 没有 isOpen prop，必须条件渲染) */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}

/** 宽高比选择器 */
function RatioPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
        宽高比
      </label>
      <div className="flex flex-wrap gap-2">
        {ASPECT_RATIOS.map(r => (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
              'active:scale-[0.95]',
              value === r.value
                ? 'bg-violet-500 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
