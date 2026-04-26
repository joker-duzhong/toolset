// ────────────────────────────────────────────────
// 言图 (TypoCraft) - Feed 广场数据 Hook
// ────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { AssetFeedItem } from '../types'
import { FEED_PAGE_SIZE } from '../constants'

export function useFeed() {
  const [data, setData] = useState<AssetFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadPage = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await api.fetchFeed(p, FEED_PAGE_SIZE)
      if (String(res.code).startsWith('2') && res.data) {
        const items = res.data.items
        if (append) {
          setData(prev => [...prev, ...items])
        } else {
          setData(items)
        }
        setHasMore(p < res.data.total_pages)
      } else {
        setError(res.message || '获取广场数据失败')
      }
    } catch {
      setError('网络连接失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const next = page + 1
      setPage(next)
      loadPage(next, true)
    }
  }, [hasMore, loadingMore, page, loadPage])

  const refresh = useCallback(() => {
    setPage(1)
    loadPage(1)
  }, [loadPage])

  return { data, loading, loadingMore, error, hasMore, loadMore, refresh }
}
