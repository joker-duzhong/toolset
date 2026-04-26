// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 项目管理 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { TypoProject, CreateProjectPayload } from '../types'

export function useProjects() {
  const [data, setData] = useState<TypoProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getProjects()
      if (String(res.code).startsWith('2') && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取项目失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (payload: CreateProjectPayload) => {
    const res = await api.createProject(payload)
    if (String(res.code).startsWith('2') && res.data) {
      setData(prev => [res.data!, ...prev])
      return { success: true, data: res.data }
    }
    return { success: false, message: res.message || '创建项目失败' }
  }, [])

  return { data, loading, error, refresh, create }
}
