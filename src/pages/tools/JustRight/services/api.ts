// ────────────────────────────────────────────────
// JustRight - API 服务层
// ────────────────────────────────────────────────
// 所有请求统一携带 app 标识符 (X-App header)
// ────────────────────────────────────────────────

import { apiClient } from '@/utils/apiClient'
import type {
  TodoItem,
  Memo,
  UserManual,
  RouletteOption,
  WishlistItem,
  Anniversary,
  CoupleState,
  HomeData,
  Couple,
  PaginatedResponse,
  UserState,
} from '../types'

const BASE = '/just-right'
const APP_KEY = 'hope_just_right'

/** 统一注入 app header */
function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('app', APP_KEY)
  return { ...init, headers }
}

// ============ 情侣关系 API ============
export const coupleApi = {
  create: () =>
    apiClient<Couple>(`${BASE}/couple`, withAppHeader({ method: 'POST' })),

  join: (inviteCode: string) =>
    apiClient<Couple>(`${BASE}/couple/join?invite_code=${inviteCode}`, withAppHeader({ method: 'POST' })),

  get: () =>
    apiClient<Couple>(`${BASE}/couple`, withAppHeader()),

  update: (data: { anniversary_date?: string }) =>
    apiClient<Couple>(`${BASE}/couple`, withAppHeader({
      method: 'PUT',
      body: JSON.stringify(data),
    })),

  leave: () =>
    apiClient<void>(`${BASE}/couple/leave`, withAppHeader({ method: 'POST' })),
}

// ============ 首页数据 ============
export const homeApi = {
  get: () => apiClient<HomeData>(`${BASE}/home`, withAppHeader()),
}

// ============ TODO API ============
export const todoApi = {
  list: (status?: 'pending' | 'completed') =>
    apiClient<TodoItem[]>(`${BASE}/todos${status ? `?status=${status}` : ''}`, withAppHeader()),

  create: (content: string) =>
    apiClient<TodoItem>(`${BASE}/todos`, withAppHeader({
      method: 'POST',
      body: JSON.stringify({ content }),
    })),

  updateStatus: (id: number, status: 'pending' | 'completed') =>
    apiClient<TodoItem>(`${BASE}/todos/${id}/status`, withAppHeader({
      method: 'PUT',
      body: JSON.stringify({ status }),
    })),

  delete: (id: number) =>
    apiClient<void>(`${BASE}/todos/${id}`, withAppHeader({ method: 'DELETE' })),
}

// ============ 备忘录 API ============
export const memoApi = {
  list: (page = 1, pageSize = 20) =>
    apiClient<PaginatedResponse<Memo>>(`${BASE}/memos?page=${page}&page_size=${pageSize}`, withAppHeader()),

  create: (content: string, imageUrls: string[] = []) =>
    apiClient<Memo>(`${BASE}/memos`, withAppHeader({
      method: 'POST',
      body: JSON.stringify({ content, image_urls: imageUrls }),
    })),

  delete: (id: number) =>
    apiClient<void>(`${BASE}/memos/${id}`, withAppHeader({ method: 'DELETE' })),
}

// ============ 图片上传 API ============
// TODO: 后期接入 OSS 后实现
export const uploadApi = {
  /** 暂未实现，后期接入 OSS */
  image: async (_file: File): Promise<string> => {
    // 预留接口，暂不实现
    throw new Error('图片上传功能暂未开放')
  },
}

// ============ 说明书 API ============
export const manualApi = {
  get: () => apiClient<{ mine: UserManual; partner: UserManual }>(`${BASE}/manual`, withAppHeader()),

  update: (data: Partial<UserManual>) =>
    apiClient<UserManual>(`${BASE}/manual`, withAppHeader({
      method: 'PUT',
      body: JSON.stringify(data),
    })),
}

// ============ 转盘 API ============
export const rouletteApi = {
  list: (category?: 'food' | 'place' | 'other') =>
    apiClient<RouletteOption[]>(`${BASE}/roulette${category ? `?category=${category}` : ''}`, withAppHeader()),

  add: (title: string, category: 'food' | 'place' | 'other', weight = 1, color?: string) =>
    apiClient<RouletteOption>(`${BASE}/roulette`, withAppHeader({
      method: 'POST',
      body: JSON.stringify({ title, category, weight, color }),
    })),

  delete: (id: number) =>
    apiClient<void>(`${BASE}/roulette/${id}`, withAppHeader({ method: 'DELETE' })),
}

// ============ 心愿单 API ============
export const wishlistApi = {
  list: () => apiClient<WishlistItem[]>(`${BASE}/wishlist`, withAppHeader()),

  add: (item: { title: string; url?: string; price?: number; image_url?: string; description?: string; couple_id: number; creator_uid: number }) =>
    apiClient<WishlistItem>(`${BASE}/wishlist`, withAppHeader({
      method: 'POST',
      body: JSON.stringify(item),
    })),

  claim: (id: number) =>
    apiClient<WishlistItem>(`${BASE}/wishlist/${id}/claim`, withAppHeader({ method: 'PUT' })),

  fulfill: (id: number) =>
    apiClient<WishlistItem>(`${BASE}/wishlist/${id}/fulfill`, withAppHeader({ method: 'PUT' })),

  delete: (id: number) =>
    apiClient<void>(`${BASE}/wishlist/${id}`, withAppHeader({ method: 'DELETE' })),
}

// ============ 纪念日 API ============
export const anniversaryApi = {
  list: () => apiClient<Anniversary[]>(`${BASE}/anniversaries`, withAppHeader()),

  add: (data: Omit<Anniversary, 'id' | 'couple_id' | 'is_deleted' | 'created_at' | 'updated_at'>) =>
    apiClient<Anniversary>(`${BASE}/anniversaries`, withAppHeader({
      method: 'POST',
      body: JSON.stringify(data),
    })),

  update: (id: number, data: Partial<Omit<Anniversary, 'id' | 'couple_id' | 'is_deleted' | 'created_at' | 'updated_at'>>) =>
    apiClient<Anniversary>(`${BASE}/anniversaries/${id}`, withAppHeader({
      method: 'PUT',
      body: JSON.stringify(data),
    })),

  delete: (id: number) =>
    apiClient<void>(`${BASE}/anniversaries/${id}`, withAppHeader({ method: 'DELETE' })),
}

// ============ 情侣状态 API ============
export const coupleStateApi = {
  get: () => apiClient<CoupleState>(`${BASE}/state`, withAppHeader()),

  updateMood: (mood: UserState['mood'], moodNote?: string) =>
    apiClient<UserState>(`${BASE}/state/mood`, withAppHeader({
      method: 'PUT',
      body: JSON.stringify({ mood, mood_note: moodNote }),
    })),

  updateFridgeNote: (note: string) =>
    apiClient<CoupleState>(`${BASE}/state/fridge-note`, withAppHeader({
      method: 'PUT',
      body: JSON.stringify({ fridge_note: note }),
    })),

  raiseWhiteFlag: () =>
    apiClient<void>(`${BASE}/state/white-flag/raise`, withAppHeader({ method: 'POST' })),

  lowerWhiteFlag: () =>
    apiClient<void>(`${BASE}/state/white-flag/lower`, withAppHeader({ method: 'POST' })),
}
