// JustRight 类型定义 - 对齐后端 API

import type { StorageInfo } from "@/common/api/storage"

// ============ 通用类型 ============
export interface User {
  uid: string
  nickname: string
  avatar?: string
}

export interface Couple {
  id: string
  user1_id: string
  user2_id: string | null
  invite_code: string
  status: 'active' | 'inactive' | 'pending'
  anniversary_date?: string
  created_at: string
  updated_at: string
}

// ============ 模块一：清单与备忘 ============
export interface TodoItem {
  id: string
  couple_id: string
  creator_uid: string
  content: string
  status: 'pending' | 'completed'
  completed_at?: string
  completed_by?: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Memo {
  id: string
  couple_id: string
  creator_uid: string
  content: string
  resources?: StorageInfo[] | null
  likes?: string[] | null
  comments?: MomentComment[] | null
  is_pinned?: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface MomentComment {
  id?: string
  comment_id?: string
  uid: string
  content: string
  created_at: string
}

export interface MomentEditorValue {
  content: string
  resources: StorageInfo[]
}

export interface MomentViewData extends Memo {
  comments: MomentComment[]
  comments_count: number
  likes_count: number
  liked_by_me: boolean
}

// ============ 模块二：Ta的说明书 ============
export interface DietPreferences {
  allergies?: string | string[]
  favorites?: string | string[]
  dislikes?: string | string[]
  restrictions?: string | string[]
}

export interface EmotionalGuide {
  when_sad?: string
  when_angry?: string
  when_stressed?: string
  love_languages?: string | string[]
  comfort_items?: string | string[]
}

export interface ExtraInfo {
  hobbies?: string | string[]
  birthday?: string
  avatar?: string
  gender?: string
  motto?: string
  phone?: string
  nickname?: string
  zodiac?: string
  mbti?: string
  height_weight?: string
  underwear_size?: string
  notes?: string
  [key: string]: unknown
}

export interface UserManual {
  uid: string
  // 尺码档案
  shoe_size?: string
  clothes_size?: string
  pants_size?: string
  ring_size?: string
  // 饮食偏好
  diet_preferences?: DietPreferences
  // 情绪指南
  emotional_guide?: EmotionalGuide
  // 其他信息
  extra_info?: ExtraInfo
  created_at: string
  updated_at: string
}

// ============ 模块三：日常决策与礼物池 ============
export interface RouletteOption {
  id: number
  couple_id: number
  title: string
  category: 'food' | 'place' | 'other'
  weight: number
  color?: string
  created_at: string
}

export interface WishlistItem {
  id: string
  couple_id: string
  creator_uid: string
  title: string
  url?: string | null
  price?: number | null
  image_url?: string | null
  status: 'unclaimed' | 'claimed' | 'fulfilled'
  claimer_uid?: string | null
  claimed_at?: string
  fulfilled_note?: string | null
  fulfilled_resource_ids?: string[] | null
  fulfilled_at?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type WishlistStatus = WishlistItem['status']

export interface WishlistItemPayload {
  title: string
  url?: string | null
  price?: number | null
  image_url?: string | null
}

export type WishlistItemUpdatePayload = Partial<WishlistItemPayload>

export interface WishlistFulfillPayload {
  note?: string | null
  resource_ids?: string[] | null
}

// ============ 模块四：纪念日与首页互动 ============
export interface Anniversary {
  id: string
  couple_id: string
  title: string
  target_date: string
  repeat_type: 'yearly' | 'monthly' | 'once'
  is_lunar: boolean
  icon?: string | null
  // 旧版前端曾使用 type/description，后端当前 schema 不返回这两个字段。
  type?: 'countup' | 'countdown'
  description?: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface AnniversaryPayload {
  title: string
  target_date: string
  is_lunar?: boolean
  repeat_type?: 'yearly' | 'monthly' | 'once'
  icon?: string | null
}

export interface UserState {
  uid: string
  mood?: 'happy' | 'sad' | 'angry' | 'tired' | 'sick' | 'love' | 'period' | 'forgive'
  note?: string | null
  mood_note?: string | null
  updated_at?: string
}

export interface CoupleState {
  id?: string
  couple_id: string
  fridge_note?: string | null
  fridge_note_by?: string | null
  fridge_note_at?: string | null
  user1: UserState
  user2: UserState | null
  created_at?: string
  updated_at: string
}

// ============ 首页聚合数据 ============
export interface UpcomingAnniversary {
  anniversary: Anniversary
  days_until: number
  is_countdown?: boolean
  display_text?: string
}

export interface HomeStats {
  completed_todos: number
  total_memos: number
  fulfilled_wishes: number
  mood_logs_count: number
}

export interface HomeData {
  couple: Couple
  together_days: number
  upcoming_anniversaries: UpcomingAnniversary[]
  state: CoupleState
  manuals: {
    mine: UserManual
    ta: UserManual
  }
  stats: HomeStats
  pending_todos?: number
  upcoming_wishes?: number
}

// ============ Tab 类型 ============
export type MainTab = 'home' | 'moments' | 'lists' | 'us'

// 旧 Tab 值映射（用于兼容性）
export type LegacyTab = 'list' | 'manual' | 'wish'

export type ListSubTab = 'todo' | 'memo'

// ============ API 响应类型 ============
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
