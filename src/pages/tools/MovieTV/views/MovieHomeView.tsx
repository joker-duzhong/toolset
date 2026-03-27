// ────────────────────────────────────────────────
// 影视大全 - 首页视图
// ────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { BannerSlider } from '../components/BannerSlider'
import { HorizontalList } from '../components/HorizontalList'
import { MovieGrid } from '../components/MovieGrid'
import { LoadingSpinner } from '../components/LoadingState'
import { fetchHomeSections } from '../services/api'
import type { MovieItem, HomeSection } from '../types'

interface MovieHomeViewProps {
  onItemClick: (item: MovieItem) => void
  onNavigateSearch: () => void
}

export function MovieHomeView({ onItemClick, onNavigateSearch }: MovieHomeViewProps) {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchHomeSections()
      .then(setSections)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="加载精彩内容中..." />
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <p className="text-sm mb-2">加载失败: {error}</p>
      <button onClick={() => window.location.reload()} className="text-indigo-600 text-sm font-medium">重试</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 lg:gap-6 pb-4">
      {/* 搜索入口 */}
      <button
        onClick={onNavigateSearch}
        className="flex items-center gap-2 px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl bg-gray-100 text-sm lg:text-base text-gray-400 hover:bg-gray-200 transition text-left max-w-2xl"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        搜索电影、电视剧、动漫...
      </button>

      {/* 渲染各板块 */}
      {sections.map(section => {
        if (section.type === 'banner') {
          return <BannerSlider key={section.id} items={section.items} onItemClick={onItemClick} />
        }
        if (section.type === 'grid') {
          return <MovieGrid key={section.id} title={section.title} items={section.items} onItemClick={onItemClick} />
        }
        return (
          <HorizontalList
            key={section.id}
            title={section.title}
            items={section.items}
            onItemClick={onItemClick}
          />
        )
      })}
    </div>
  )
}
