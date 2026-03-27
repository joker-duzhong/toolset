// ────────────────────────────────────────────────
// 影视大全 - 浏览器本地存储服务
// ────────────────────────────────────────────────
// 使用 localStorage 缓存收藏和观看历史
// 自动控制缓存大小，超出上限时淘汰旧数据

import type { MovieItem, MovieCategory } from '../types'

// ── 存储 Key ──
const FAVORITES_KEY = 'movie-tv-favorites'
const HISTORY_KEY = 'movie-tv-history'

// ── 容量上限 ──
const MAX_FAVORITES = 200
const MAX_HISTORY = 500

// ── 轻量存储结构（只保留必要字段，节省空间） ──

export interface FavoriteItem {
  id: string
  title: string
  poster: string
  rating: number
  year: string
  category: MovieCategory
  genres: string[]
  addedAt: number // 收藏时间戳
}

export interface HistoryItem {
  id: string
  title: string
  poster: string
  rating: number
  year: string
  category: MovieCategory
  genres: string[]
  watchedAt: number   // 观看时间戳
  episodeId?: string
  episodeName?: string
}

// ── 通用读写 ──

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch (e) {
    // 存储满了 → 裁剪到 80% 再重试
    console.warn('[MovieTV Storage] 写入失败，尝试裁剪...', e)
    const trimmed = list.slice(0, Math.floor(list.length * 0.8))
    try {
      localStorage.setItem(key, JSON.stringify(trimmed))
    } catch {
      /* 放弃 */
    }
  }
}

// ── 收藏 ──────────────────────────────────────

export function getFavorites(): FavoriteItem[] {
  return readList<FavoriteItem>(FAVORITES_KEY)
}

export function addFavorite(movie: MovieItem): FavoriteItem[] {
  const list = getFavorites().filter(f => f.id !== movie.id)
  const item: FavoriteItem = {
    id: movie.id,
    title: movie.title,
    poster: movie.poster,
    rating: movie.rating,
    year: movie.year,
    category: movie.category,
    genres: movie.genres.slice(0, 3),
    addedAt: Date.now(),
  }
  list.unshift(item)
  if (list.length > MAX_FAVORITES) list.length = MAX_FAVORITES
  writeList(FAVORITES_KEY, list)
  return list
}

export function removeFavorite(movieId: string): FavoriteItem[] {
  const list = getFavorites().filter(f => f.id !== movieId)
  writeList(FAVORITES_KEY, list)
  return list
}

export function isFavorite(movieId: string): boolean {
  return getFavorites().some(f => f.id === movieId)
}

export function clearFavorites(): void {
  localStorage.removeItem(FAVORITES_KEY)
}

// ── 观看历史 ──────────────────────────────────

export function getHistory(): HistoryItem[] {
  return readList<HistoryItem>(HISTORY_KEY)
}

export function addHistory(
  movie: MovieItem,
  episodeId?: string,
  episodeName?: string,
): HistoryItem[] {
  // 去重：同一影片 + 同一集 → 更新时间戳
  const list = getHistory().filter(
    h => !(h.id === movie.id && h.episodeId === episodeId),
  )
  const item: HistoryItem = {
    id: movie.id,
    title: movie.title,
    poster: movie.poster,
    rating: movie.rating,
    year: movie.year,
    category: movie.category,
    genres: movie.genres.slice(0, 3),
    watchedAt: Date.now(),
    episodeId,
    episodeName,
  }
  list.unshift(item)
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY
  writeList(HISTORY_KEY, list)
  return list
}

export function removeHistory(movieId: string, episodeId?: string): HistoryItem[] {
  const list = getHistory().filter(
    h => !(h.id === movieId && h.episodeId === episodeId),
  )
  writeList(HISTORY_KEY, list)
  return list
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

// ── 存储容量统计 ──────────────────────────────

export function getStorageSize(): { favorites: number; history: number; total: number } {
  const favStr = localStorage.getItem(FAVORITES_KEY) || ''
  const hisStr = localStorage.getItem(HISTORY_KEY) || ''
  const favKB = Math.round((new Blob([favStr]).size / 1024) * 10) / 10
  const hisKB = Math.round((new Blob([hisStr]).size / 1024) * 10) / 10
  return {
    favorites: favKB,
    history: hisKB,
    total: Math.round((favKB + hisKB) * 10) / 10,
  }
}
