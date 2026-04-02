// ────────────────────────────────────────────────
// Trade Copilot - 持仓卡片组件
// ────────────────────────────────────────────────

import type { Position } from '../types'
import { POSITION_STATUS_LABELS, POSITION_STATUS_COLORS } from '../constants'

interface PositionCardProps {
  position: Position
  onClick: (id: number) => void
}

export function PositionCard({ position, onClick }: PositionCardProps) {
  const {
    id,
    symbol,
    name,
    buy_date,
    cost_price,
    quantity,
    status,
  } = position

  return (
    <button
      onClick={() => onClick(id)}
      className="w-full text-left bg-white rounded-xl shadow-sm p-4 transition active:scale-[0.98]"
    >
      {/* Header: name + status tag */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">
            {name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{symbol}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${POSITION_STATUS_COLORS[status]}`}
        >
          {POSITION_STATUS_LABELS[status]}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-400 text-xs">成本价</p>
          <p className="text-gray-900 font-medium mt-0.5">
            {cost_price.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">数量</p>
          <p className="text-gray-900 font-medium mt-0.5">
            {quantity.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">买入日期</p>
          <p className="text-gray-900 font-medium mt-0.5">{buy_date}</p>
        </div>
      </div>
    </button>
  )
}
