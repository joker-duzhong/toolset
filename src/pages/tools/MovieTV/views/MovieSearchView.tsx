// ────────────────────────────────────────────────
// 影视大全 - 搜索视图
// ────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { MovieSearchBar } from '../components/MovieSearchBar'
import { MovieGrid } from '../components/MovieGrid'
import { LoadingSpinner, SearchEmpty } from '../components/LoadingState'
import { searchMovies } from '../services/api'
import type { MovieItem } from '../types'

interface MovieSearchViewProps {
  onItemClick: (item: MovieItem) => void
}

const HOT_KEYWORDS = ['流浪地球', '三体', '灌篮高手', '繁花', '狂飙', '奥本海默', '铃芽之旅', '消失的她']

export function MovieSearchView({ onItemClick }: MovieSearchViewProps) {
  const [results, setResults] = useState<MovieItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [query, setQuery] = useState('')

  const [error, setError] = useState('')

  const doSearch = useCallback(async (q: string) => {
    setQuery(q)
    setError('')
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchMovies(q)
      setResults(data.items)
    } catch (e) {
      setResults([])
      setError(e instanceof Error ? e.message : '搜索失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 pb-4">
      <MovieSearchBar onSearch={doSearch} autoFocus initialValue={query} />

      {/* 未搜索时显示热门搜索 */}
      {!searched && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🔥 热门搜索</h3>
          <div className="flex flex-wrap gap-2">
            {HOT_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => doSearch(kw)}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {loading && <LoadingSpinner text="搜索中..." />}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={() => doSearch(query)} className="text-indigo-600 text-sm font-medium">重试</button>
        </div>
      )}
      {!loading && !error && searched && results.length === 0 && <SearchEmpty />}
      {!loading && !error && results.length > 0 && (
        <MovieGrid
          title={`搜索结果 (${results.length})`}
          items={results}
          onItemClick={onItemClick}
        />
      )}
    </div>
  )
}
