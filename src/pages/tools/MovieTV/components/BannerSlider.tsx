// ────────────────────────────────────────────────
// 影视大全 - Banner 轮播组件
// ────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { Star, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MovieItem } from '../types'

interface BannerSliderProps {
  items: MovieItem[]
  onItemClick: (item: MovieItem) => void
}

export function BannerSlider({ items, onItemClick }: BannerSliderProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent(i => (i + 1) % items.length)
  }, [items.length])

  const prev = useCallback(() => {
    setCurrent(i => (i - 1 + items.length) % items.length)
  }, [items.length])

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  if (items.length === 0) return null

  const item = items[current]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900" style={{ aspectRatio: '16/8' }}>
      {/* 背景图 */}
      <div className="absolute inset-0 transition-all duration-700">
        <img
          src={item.backdrop || item.poster}
          alt={item.title}
          className="w-full h-full object-cover opacity-60"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />
      </div>

      {/* 内容 */}
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-8 lg:p-12">
        <div className="max-w-lg lg:max-w-2xl">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-1">{item.title}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
            <span className="flex items-center gap-1">
              <Star className="size-4 text-yellow-400 fill-yellow-400" />
              {item.rating}
            </span>
            <span>{item.year}</span>
            {item.genres.slice(0, 2).map(g => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-xs">{g}</span>
            ))}
          </div>
          <p className="text-sm lg:text-base text-gray-400 line-clamp-2 mb-4 hidden sm:block">{item.overview}</p>
          <button
            onClick={() => onItemClick(item)}
            className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm lg:text-base font-semibold transition active:scale-95"
          >
            <Play className="size-4 lg:size-5 fill-white" />
            查看详情
          </button>
        </div>
      </div>

      {/* 导航按钮 */}
      <button
        onClick={prev}
        className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 size-8 lg:size-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronLeft className="size-5 lg:size-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 size-8 lg:size-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronRight className="size-5 lg:size-6" />
      </button>

      {/* 指示器 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all ${
              i === current ? 'w-6 bg-indigo-500' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
