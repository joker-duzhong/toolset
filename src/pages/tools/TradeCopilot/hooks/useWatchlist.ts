// ────────────────────────────────────────────────
// Trade Copilot - 观察池 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import * as api from '../services/api'
import type { WatchlistItem, CreateWatchlistRequest, UpdateWatchlistRequest } from '../types'

export function useWatchlist() {
  const [data, setData] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getWatchlist()
      if (res.code === 200 && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取观察池失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const add = useCallback(async (req: CreateWatchlistRequest) => {
    const res = await api.addToWatchlist(req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '新增观察失败' }
  }, [refresh])

  const update = useCallback(async (id: number, req: UpdateWatchlistRequest) => {
    const res = await api.updateWatchlist(id, req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '更新观察失败' }
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    const res = await api.deleteWatchlist(id)
    if (res.code === 200) {
      setData(prev => prev.filter(w => w.id !== id))
      return { success: true }
    }
    return { success: false, message: res.message || '删除观察失败' }
  }, [])

  return { data, loading, error, refresh, add, update, remove }
}

/** ST 黑名单（带缓存） */
export function useStList() {
  const [stCodes, setStCodes] = useState<string[]>([])
  const fetched = useRef(false)

  const refresh = useCallback(async () => {
    try {
      const res = await api.getStList()
      if (res.code === 200 && res.data) {
        setStCodes(res.data.stocks)
        fetched.current = true
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (!fetched.current) refresh()
  }, [refresh])

  const isSt = useCallback((code: string) => stCodes.includes(code), [stCodes])

  return { stCodes, isSt, refresh }
}
