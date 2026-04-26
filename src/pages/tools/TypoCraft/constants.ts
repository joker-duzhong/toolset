// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 常量配置
// ────────────────────────────────────────────────

/** 应用标识 (注入 Header) */
export const APP_KEY = 'typo_craft'

/** API 基础路径 */
export const API_BASE = '/typo-craft'

/** 轮询间隔 (ms) */
export const POLL_INTERVAL = 3000

/** Feed 分页大小 */
export const FEED_PAGE_SIZE = 20

/** 宽高比选项 */
export const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
] as const

/** 创作模式 Tab */
export const CREATION_TABS = [
  { key: 'poster', label: '海报生成' },
  { key: 'illustration', label: 'App 插图' },
] as const

export type CreationTabKey = (typeof CREATION_TABS)[number]['key']

/** 主页 Tab */
export const MAIN_TABS = [
  { key: 'feed', label: '广场' },
  { key: 'gallery', label: '我的图库' },
] as const

export type MainTabKey = (typeof MAIN_TABS)[number]['key']
