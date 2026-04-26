// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 类型定义
// ────────────────────────────────────────────────

/** 资产生成状态 */
export type AssetStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED'

/** 项目 (App 系列插图的基础风格项目) */
export interface TypoProject {
  id: string
  project_name: string
  scene_desc: string
  base_style_prompt: string
}

/** 广场 Feed 条目 */
export interface AssetFeedItem {
  id: string
  image_url: string
  user_prompt: string
  tags: string[] | null
}

/** 资产状态轮询结果 */
export interface AssetStatusOut {
  id: string
  status: AssetStatus
  image_url: string | null
  final_ai_prompt: string
}

/** 分页数据 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/** 海报生成入参 */
export interface GeneratePosterPayload {
  prompt: string
  aspect_ratio?: string
}

/** App 插图生成入参 */
export interface GenerateIllustrationPayload {
  project_id: string
  scene_prompt: string
  aspect_ratio?: string
}

/** 创建项目入参 */
export interface CreateProjectPayload {
  project_name: string
  scene_desc: string
}

/** 资产状态更新入参 */
export interface AssetStatusUpdatePayload {
  status?: string
  is_public?: boolean
}

/** 本地乐观卡片 (PENDING 态占位) */
export interface OptimisticAsset {
  id: string
  status: AssetStatus
  prompt: string
  aspect_ratio: string
  image_url: string | null
  createdAt: number
}
