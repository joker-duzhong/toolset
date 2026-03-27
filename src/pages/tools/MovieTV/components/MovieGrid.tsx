// ────────────────────────────────────────────────
// 影视大全 - 网格列表组件
// ────────────────────────────────────────────────

import { MovieCard } from './MovieCard'
import type { MovieItem } from '../types'

interface MovieGridProps {
  title?: string
  items: MovieItem[]
  onItemClick: (item: MovieItem) => void
}

export function MovieGrid({ title, items, onItemClick }: MovieGridProps) {
  if (items.length === 0) return null

  return (
    <section className="py-2">
      {title && (
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 px-1">{title}</h2>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
        {items.map(item => (
          <div key={item.id} className="w-full">
            <MovieCard item={item} onClick={onItemClick} size="lg" />
          </div>
        ))}
      </div>
    </section>
  )
}
