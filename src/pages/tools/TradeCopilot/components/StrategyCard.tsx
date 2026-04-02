// ────────────────────────────────────────────────
// Trade Copilot - 策略卡片组件
// ────────────────────────────────────────────────

import { Pencil, Archive } from 'lucide-react'
import type { Strategy } from '../types'

interface StrategyCardProps {
  strategy: Strategy
  onEdit: (strategy: Strategy) => void
  onDeprecate: (id: number) => void
}

export function StrategyCard({ strategy, onEdit, onDeprecate }: StrategyCardProps) {
  const { id, name, take_profit_drawdown_pct, stop_loss_pct, description, is_deleted } = strategy

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 transition active:scale-[0.98] ${
        is_deleted ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Header: name + status tag */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-base font-bold text-gray-900 truncate flex-1 min-w-0">
          {name}
        </p>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            is_deleted
              ? 'bg-gray-100 text-gray-500'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {is_deleted ? '已废弃' : '生效中'}
        </span>
      </div>

      {/* Take profit drawdown */}
      <div className="mb-2">
        <p className="text-xs text-gray-400 mb-1">止盈回撤比例</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
          {take_profit_drawdown_pct}%
        </span>
      </div>

      {/* Stop loss */}
      <div className="mb-2">
        <p className="text-xs text-gray-400 mb-1">止损比例</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-500">
          -{Math.abs(stop_loss_pct)}%
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          适用范围: {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
        <button
          onClick={() => onEdit(strategy)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 active:scale-[0.97] transition"
        >
          <Pencil className="size-3.5" />
          编辑
        </button>
        {!is_deleted && (
          <button
            onClick={() => onDeprecate(id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 active:scale-[0.97] transition"
          >
            <Archive className="size-3.5" />
            废弃
          </button>
        )}
      </div>
    </div>
  )
}
