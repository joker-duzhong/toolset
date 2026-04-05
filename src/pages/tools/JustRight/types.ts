// JustRight 类型定义 - 对齐后端 API

// ============ 通用类型 ============
export interface User {
  uid: number
  nickname: string
  avatar?: string
}

export interface Couple {
  id: number
  user1_id: number
  user2_id: number
  invite_code: string
  status: 'active' | 'inactive' | 'pending'
  anniversary_date?: string
  created_at: string
  updated_at: string
}

// ============ 模块一：清单与备忘 ============
export interface TodoItem {
  id: number
  couple_id: number
  creator_uid: number
  content: string
  status: 'pending' | 'completed'
  completed_at?: string
  completed_by?: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Memo {
  id: number
  couple_id: number
  creator_uid: number
  content: string
  image_urls: string[]
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// ============ 模块二：Ta的说明书 ============
export interface DietPreferences {
  allergies?: string[]
  favorites?: string[]
  dislikes?: string[]
  restrictions?: string[]
}

export interface EmotionalGuide {
  when_sad?: string
  when_angry?: string
  when_stressed?: string
  love_languages?: string[]
  comfort_items?: string[]
}

export interface ExtraInfo {
  hobbies?: string[]
  birthday?: string
  zodiac?: string
  mbti?: string
  [key: string]: unknown
}

export interface UserManual {
  uid: number
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
  id: number
  couple_id: number
  creator_uid: number
  title: string
  url?: string
  price?: number
  image_url?: string
  description?: string
  status: 'unclaimed' | 'claimed' | 'fulfilled'
  claimer_uid?: number
  claimed_at?: string
  fulfilled_at?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// ============ 模块四：纪念日与首页互动 ============
export interface Anniversary {
  id: number
  couple_id: number
  title: string
  target_date: string
  type: 'countup' | 'countdown'
  repeat_type: 'yearly' | 'monthly' | 'once'
  is_lunar: boolean
  icon?: string
  description?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface UserState {
  uid: number
  mood?: 'happy' | 'sad' | 'angry' | 'tired' | 'sick' | 'love' | 'period'
  mood_note?: string
  white_flag: {
    raised: boolean
    raised_at?: string
  }
  updated_at: string
}

export interface CoupleState {
  couple_id: number
  fridge_note?: string
  user1: UserState
  user2: UserState
  updated_at: string
}

// ============ 首页聚合数据 ============
export interface UpcomingAnniversary {
  anniversary: Anniversary
  days_until: number
}

export interface HomeData {
  couple: Couple
  together_days: number
  upcoming_anniversaries: UpcomingAnniversary[]
  state: CoupleState
  manuals: {
    mine: UserManual
    partner: UserManual
  }
  pending_todos: number
  upcoming_wishes: number
}

// ============ Tab 类型 ============
export type MainTab = 'home' | 'list' | 'manual' | 'wish'

export type ListSubTab = 'todo' | 'memo'

// ============ API 响应类型 ============
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
