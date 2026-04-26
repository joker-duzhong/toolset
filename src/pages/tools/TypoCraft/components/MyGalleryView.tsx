// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 我的图库 (占位视图)
// ────────────────────────────────────────────────
// 后端接口待补足，目前仅展示 UI 骨架
// ────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'

export function MyGalleryView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-4">
        <ImageOff className="size-7 text-violet-300 dark:text-violet-500" />
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
        我的图库
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-[240px]">
        即将上线，敬请期待
      </p>
    </motion.div>
  )
}
