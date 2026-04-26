// ────────────────────────────────────────────────
// 言图 (TypoCraft) - 生成任务状态机 Hook
// ────────────────────────────────────────────────
// 核心职责：提交生成 → 乐观占位 → 轮询状态 → 最终展示
// ────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react'
import * as api from '../services/api'
import type { OptimisticAsset, AssetStatus, GeneratePosterPayload, GenerateIllustrationPayload } from '../types'
import { POLL_INTERVAL } from '../constants'

/** 生成并管理本地乐观卡片的状态机 */
export function useGenerateEngine() {
  const [pendingAssets, setPendingAssets] = useState<OptimisticAsset[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  // 清理所有轮询定时器
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(timer => clearInterval(timer))
      timers.clear()
    }
  }, [])

  /** 启动轮询 */
  const startPolling = useCallback((assetId: string) => {
    if (timersRef.current.has(assetId)) return

    const timer = setInterval(async () => {
      try {
        const res = await api.pollAssetStatus(assetId)
        if (!String(res.code).startsWith('2') || !res.data) return

        const { status, image_url } = res.data

        if (status === 'SUCCESS' || status === 'FAILED' || status === 'REJECTED') {
          // 终态：停止轮询并更新卡片
          clearInterval(timer)
          timersRef.current.delete(assetId)

          setPendingAssets(prev =>
            prev.map(a =>
              a.id === assetId
                ? { ...a, status: status as AssetStatus, image_url: image_url ?? null }
                : a,
            ),
          )
        }
      } catch {
        // 静默忽略单次轮询失败
      }
    }, POLL_INTERVAL)

    timersRef.current.set(assetId, timer)
  }, [])

  /** 提交海报生成任务 */
  const submitPoster = useCallback(async (payload: GeneratePosterPayload) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // 乐观占位
    const optimistic: OptimisticAsset = {
      id: tempId,
      status: 'PENDING',
      prompt: payload.prompt,
      aspect_ratio: payload.aspect_ratio ?? '1:1',
      image_url: null,
      createdAt: Date.now(),
    }
    setPendingAssets(prev => [optimistic, ...prev])

    try {
      const res = await api.generatePoster(payload)
      if (String(res.code).startsWith('2') && res.data?.task_id) {
        // 用真实 ID 替换临时 ID
        const realId = res.data.task_id
        setPendingAssets(prev =>
          prev.map(a => (a.id === tempId ? { ...a, id: realId } : a)),
        )
        startPolling(realId)
        return { success: true }
      }
      // 提交失败，标记卡片
      setPendingAssets(prev =>
        prev.map(a => (a.id === tempId ? { ...a, status: 'FAILED' as AssetStatus } : a)),
      )
      return { success: false, message: res.message || '提交失败' }
    } catch {
      setPendingAssets(prev =>
        prev.map(a => (a.id === tempId ? { ...a, status: 'FAILED' as AssetStatus } : a)),
      )
      return { success: false, message: '网络连接失败' }
    }
  }, [startPolling])

  /** 提交 App 插图生成任务 */
  const submitIllustration = useCallback(async (payload: GenerateIllustrationPayload) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const optimistic: OptimisticAsset = {
      id: tempId,
      status: 'PENDING',
      prompt: payload.scene_prompt,
      aspect_ratio: payload.aspect_ratio ?? '1:1',
      image_url: null,
      createdAt: Date.now(),
    }
    setPendingAssets(prev => [optimistic, ...prev])

    try {
      const res = await api.generateIllustration(payload)
      if (String(res.code).startsWith('2') && res.data?.task_id) {
        const realId = res.data.task_id
        setPendingAssets(prev =>
          prev.map(a => (a.id === tempId ? { ...a, id: realId } : a)),
        )
        startPolling(realId)
        return { success: true }
      }
      setPendingAssets(prev =>
        prev.map(a => (a.id === tempId ? { ...a, status: 'FAILED' as AssetStatus } : a)),
      )
      return { success: false, message: res.message || '提交失败' }
    } catch {
      setPendingAssets(prev =>
        prev.map(a => (a.id === tempId ? { ...a, status: 'FAILED' as AssetStatus } : a)),
      )
      return { success: false, message: '网络连接失败' }
    }
  }, [startPolling])

  /** 移除一张本地卡片 */
  const removePending = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearInterval(timer)
      timersRef.current.delete(id)
    }
    setPendingAssets(prev => prev.filter(a => a.id !== id))
  }, [])

  return { pendingAssets, submitPoster, submitIllustration, removePending }
}
