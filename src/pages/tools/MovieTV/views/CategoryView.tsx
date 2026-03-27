// ────────────────────────────────────────────────
// 影视大全 - 分类浏览视图
// ────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { CategoryTabs } from '../components/CategoryTabs'
import { MovieGrid } from '../components/MovieGrid'
import { LoadingSpinner, EmptyState } from '../components/LoadingState'
import { fetchByCategory, fetchHomeSections } from '../services/api'
import type { MovieItem, MovieCategory } from '../types'

interface CategoryViewProps {
  onItemClick: (item: MovieItem) => void
}

export function CategoryView({ onItemClick }: CategoryViewProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [items, setItems] = useState<MovieItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async (cat: string) => {
    setLoading(true)
    setError('')
    try {
      if (cat === 'all') {
        const sections = await fetchHomeSections()
        const all = sections.flatMap(s => s.items)
        // 去重
        const seen = new Set<string>()
        setItems(all.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true }))
      } else {
        const data = await fetchByCategory(cat as MovieCategory)
        setItems(data.items)
      }
    } catch (e) {
      setItems([])
      setError(e instanceof Error ? e.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(activeTab)
  }, [activeTab, loadData])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <CategoryTabs active={activeTab} onChange={handleTabChange} />

      {loading && <LoadingSpinner />}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={() => loadData(activeTab)} className="text-indigo-600 text-sm font-medium">重试</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && <EmptyState title="暂无内容" description="该分类下还没有影视内容" />}
      {!loading && !error && items.length > 0 && (
        <MovieGrid items={items} onItemClick={onItemClick} />
      )}
    </div>
  )
}
