// ────────────────────────────────────────────────
// Trade Copilot - 策略管理 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { Strategy, CreateStrategyRequest, UpdateStrategyRequest, CapitalSettings } from '../types'

export function useStrategies() {
  const [data, setData] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getStrategies()
      if (res.code === 200 && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取策略失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (req: CreateStrategyRequest) => {
    const res = await api.createStrategy(req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '创建策略失败' }
  }, [refresh])

  const update = useCallback(async (id: number, req: UpdateStrategyRequest) => {
    const res = await api.updateStrategy(id, req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '更新策略失败' }
  }, [refresh])

  const deprecate = useCallback(async (id: number) => {
    const res = await api.deleteStrategy(id)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '废弃策略失败' }
  }, [refresh])

  return { data, loading, error, refresh, create, update, deprecate }
}

export function useCapital() {
  const [data, setData] = useState<CapitalSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getCapital()
      if (res.code === 200 && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取资金设置失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const save = useCallback(async (totalCapital: number) => {
    const res = await api.updateCapital({ total_capital: totalCapital })
    if (res.code === 200 && res.data) {
      setData(res.data)
      return { success: true }
    }
    return { success: false, message: res.message || '更新资金设置失败' }
  }, [])

  return { data, loading, error, refresh, save }
}
