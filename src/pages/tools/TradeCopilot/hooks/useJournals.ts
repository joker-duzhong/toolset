// ────────────────────────────────────────────────
// Trade Copilot - 交易日记 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { Journal, CreateJournalRequest, UpdateJournalRequest } from '../types'

export function useJournals() {
  const [data, setData] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getJournals()
      if (res.code === 200 && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取日记失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (req: CreateJournalRequest) => {
    const res = await api.createJournal(req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '创建日记失败' }
  }, [refresh])

  const update = useCallback(async (id: number, req: UpdateJournalRequest) => {
    const res = await api.updateJournal(id, req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '更新日记失败' }
  }, [refresh])

  return { data, loading, error, refresh, create, update }
}
