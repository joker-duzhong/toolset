// ────────────────────────────────────────────────
// 影视大全 - 横向滚动列表组件
// ────────────────────────────────────────────────

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MovieCard } from './MovieCard'
import type { MovieItem } from '../types'

interface HorizontalListProps {
  title: string
  items: MovieItem[]
  onItemClick: (item: MovieItem) => void
  onSeeAll?: () => void
}

export function HorizontalList({ title, items, onItemClick, onSeeAll }: HorizontalListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.offsetWidth * 0.7
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (items.length === 0) return null

  return (
    <section className="py-2">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="size-7 lg:size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <ChevronLeft className="size-4 lg:size-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="size-7 lg:size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <ChevronRight className="size-4 lg:size-5" />
          </button>
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs text-indigo-600 hover:text-indigo-500 ml-1 font-medium"
            >
              更多 →
            </button>
          )}
        </div>
      </div>

      {/* 横向滚动 */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map(item => (
          <MovieCard key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>
    </section>
  )
}
