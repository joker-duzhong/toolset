// ────────────────────────────────────────────────
// Trade Copilot - 交易流水列表组件
// ────────────────────────────────────────────────

import type { Transaction } from '../types'
import {
  TRANSACTION_ACTION_LABELS,
  TRANSACTION_ACTION_COLORS,
} from '../constants'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
}

/** Skeleton row for loading state */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-12 h-5 bg-gray-100 rounded" />
      <div className="w-10 h-5 bg-gray-100 rounded-full" />
      <div className="flex-1" />
      <div className="w-16 h-5 bg-gray-100 rounded" />
      <div className="w-12 h-5 bg-gray-100 rounded" />
    </div>
  )
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  if (loading) {
    return (
      <div className="divide-y divide-gray-50">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        暂无交易流水
      </div>
    )
  }

  // Sort by date descending
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.transaction_time).getTime() - new Date(a.transaction_time).getTime(),
  )

  return (
    <div className="divide-y divide-gray-50">
      {sorted.map((tx) => {
        const amount = tx.price * tx.quantity
        const dateStr = tx.transaction_time.slice(0, 10)
        const isBuy = tx.action === 'buy'

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-4 py-3 text-sm"
          >
            {/* Date */}
            <span className="text-gray-400 text-xs shrink-0 w-[72px]">
              {dateStr}
            </span>

            {/* Action badge */}
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                isBuy
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              {TRANSACTION_ACTION_LABELS[tx.action]}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price */}
            <span className={`${TRANSACTION_ACTION_COLORS[tx.action]} font-medium`}>
              {tx.price.toFixed(2)}
            </span>

            {/* Quantity */}
            <span className="text-gray-500 w-14 text-right">
              {tx.quantity.toLocaleString()}
            </span>

            {/* Amount */}
            <span className="text-gray-900 font-medium w-20 text-right">
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
