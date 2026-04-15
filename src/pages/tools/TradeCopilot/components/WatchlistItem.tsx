// ────────────────────────────────────────────────
// Trade Copilot - 观察池卡片组件
// ────────────────────────────────────────────────

import { Pencil, Trash2, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import type { WatchlistItem as WatchlistItemType } from '../types'

interface WatchlistItemProps {
  item: WatchlistItemType
  onEdit: (item: WatchlistItemType) => void
  onDelete: (id: number) => void
  onQuickBuy: (item: WatchlistItemType) => void
}

export function WatchlistItem({ item, onEdit, onDelete, onQuickBuy }: WatchlistItemProps) {
  const { name, symbol, reason, created_at } = item

  return (
    <motion.div
      className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-4 transition active:scale-[0.98]"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-base font-bold text-gray-900 truncate">
              {name}
            </p>
            <span className="text-xs text-gray-400 shrink-0">{symbol}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(created_at).toLocaleDateString('zh-CN')}
          </p>
          {reason && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{reason}</p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onQuickBuy(item)}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
            title="快速买入"
          >
            <ShoppingCart className="size-4" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition"
            title="编辑"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            title="删除"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
