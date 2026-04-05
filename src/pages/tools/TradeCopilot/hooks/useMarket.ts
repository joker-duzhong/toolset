// ────────────────────────────────────────────────
// Trade Copilot - 大盘行情 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { MarketStatus, Thermometer } from '../types'

export function useMarketStatus() {
  const [data, setData] = useState<MarketStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getMarketStatus()
      if (String(res.code).startsWith('2') && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取大盘状态失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  return { data, loading, error, refresh }
}

export function useMarketThermometer() {
  const [data, setData] = useState<Thermometer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getMarketThermometer()
      if (String(res.code).startsWith('2') && res.data) {
        setData(res.data)
      } else {
        setError(res.message || '获取市场温度计失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  return { data, loading, error, refresh }
}
