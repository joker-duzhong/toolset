// ────────────────────────────────────────────────
// 影视大全 - 影视卡片组件
// ────────────────────────────────────────────────

import { Star } from 'lucide-react'
import type { MovieItem } from '../types'

interface MovieCardProps {
  item: MovieItem
  onClick: (item: MovieItem) => void
  size?: 'sm' | 'md' | 'lg'
}

export function MovieCard({ item, onClick, size = 'md' }: MovieCardProps) {
  const sizeClasses = {
    sm: 'w-24 sm:w-28 lg:w-32',
    md: 'w-28 sm:w-36 lg:w-40',
    lg: 'w-full',
  }

  return (
    <button
      onClick={() => onClick(item)}
      className={`${sizeClasses[size]} flex-shrink-0 group text-left`}
    >
      {/* 海报 */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 mb-2">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* 评分角标 */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/60 text-xs text-yellow-400 font-semibold">
          <Star className="size-3 fill-yellow-400" />
          {item.rating}
        </div>
        {/* 状态标签 */}
        {item.status && (
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent text-right">
            <span className="text-[10px] text-white">{item.status}</span>
          </div>
        )}
        {/* hover 遮罩 */}
        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors flex items-center justify-center">
          <div className="size-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
            <svg className="size-5 text-indigo-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 标题 */}
      <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
        {item.title}
      </h3>
      <p className="text-xs text-gray-400 mt-0.5">
        {item.year} · {item.genres.slice(0, 2).join(' / ')}
      </p>
    </button>
  )
}
