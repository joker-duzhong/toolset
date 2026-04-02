// ────────────────────────────────────────────────
// Trade Copilot - 执行力评分组件 (1-10)
// ────────────────────────────────────────────────

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function StarRating({ value, onChange, max = 10 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const filled = starValue <= value
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            className="p-1 -m-1 transition hover:scale-110 active:scale-95"
          >
            <Star
              className={`size-4 ${
                filled ? 'text-amber-400' : 'text-gray-300'
              }`}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={filled ? 0 : 1.5}
            />
          </button>
        )
      })}
      <span className="ml-2 text-sm font-semibold text-amber-600">{value}/10</span>
    </div>
  )
}
