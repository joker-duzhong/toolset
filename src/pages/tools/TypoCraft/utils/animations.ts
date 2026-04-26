// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 共享动效
// ────────────────────────────────────────────────

import type { Variants } from 'framer-motion'

/** 瀑布流容器错落入场 */
export const masonryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

/** 单张卡片上滑 + 淡入 */
export const cardVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/** 底部抽屉滑入 */
export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

/** FAB 弹跳入场 */
export const fabVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', damping: 15, stiffness: 200, delay: 0.3 },
  },
}

/** 遮罩淡入淡出 */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

/** 流光呼吸动画关键帧 (用于 GeneratingSkeleton) */
export const shimmerGradient = {
  background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.3) 37%, transparent 63%)',
  backgroundSize: '200% 100%',
}
