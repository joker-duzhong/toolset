// ────────────────────────────────────────────────
// Trade Copilot - 交易日记卡片组件
// ────────────────────────────────────────────────

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Journal } from '../types'

interface JournalCardProps {
  journal: Journal
  onClick: (journal: Journal) => void
}

export function JournalCard({ journal, onClick }: JournalCardProps) {
  const { record_date, execution_score, notes } = journal

  const truncated =
    notes && notes.length > 50
      ? notes.slice(0, 50) + '...'
      : notes ?? ''

  return (
    <motion.button
      onClick={() => onClick(journal)}
      className="w-full text-left bg-amber-500/10 backdrop-blur-xl rounded-2xl border border-amber-200/50 shadow-lg p-4 transition active:scale-[0.98]"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header: date + execution score */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-800">{record_date}</span>
        <div className="flex items-center gap-1">
          <Star
            className="size-3.5 text-amber-400"
            fill="currentColor"
          />
          <span className="text-xs font-semibold text-amber-600">{execution_score}/10</span>
        </div>
      </div>

      {/* Preview text */}
      {truncated && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {truncated}
        </p>
      )}
    </motion.button>
  )
}
