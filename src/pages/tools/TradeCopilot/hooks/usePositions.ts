// ────────────────────────────────────────────────
// Trade Copilot - 持仓管理 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { Position, CreatePositionRequest, UpdatePositionRequest, Transaction, CreateTransactionRequest } from '../types'

export function usePositions(status?: string) {
  const [data, setData] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getPositions(status)
      if (res.code === 200 && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取持仓失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { refresh() }, [refresh])

  const createPosition = useCallback(async (req: CreatePositionRequest) => {
    const res = await api.createPosition(req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '新增持仓失败' }
  }, [refresh])

  const updatePosition = useCallback(async (id: number, req: UpdatePositionRequest) => {
    const res = await api.updatePosition(id, req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '更新持仓失败' }
  }, [refresh])

  const removePosition = useCallback(async (id: number) => {
    const res = await api.deletePosition(id)
    if (res.code === 200) {
      setData(prev => prev.filter(p => p.id !== id))
      return { success: true }
    }
    return { success: false, message: res.message || '删除持仓失败' }
  }, [])

  return { data, loading, error, refresh, createPosition, updatePosition, removePosition }
}

export function useTransactions(positionId: number | null) {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!positionId) return
    setLoading(true)
    try {
      const res = await api.getTransactions(positionId)
      if (res.code === 200 && res.data) {
        setData(res.data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [positionId])

  useEffect(() => { refresh() }, [refresh])

  const createTransaction = useCallback(async (req: CreateTransactionRequest) => {
    if (!positionId) return { success: false, message: '无持仓 ID' }
    const res = await api.createTransaction(positionId, req)
    if (res.code === 200) {
      await refresh()
      return { success: true }
    }
    return { success: false, message: res.message || '添加流水失败' }
  }, [positionId, refresh])

  return { data, loading, refresh, createTransaction }
}
