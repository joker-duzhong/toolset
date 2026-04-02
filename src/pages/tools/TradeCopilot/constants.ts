// ────────────────────────────────────────────────
// Trade Copilot - 常量配置
// ────────────────────────────────────────────────

import { Gauge, Briefcase, Eye, Target, BookOpen } from 'lucide-react'
import type { PositionStatus, TransactionAction } from './types'

// ── Tab 配置 ──────────────────────────────────
export type TabKey = 'dashboard' | 'positions' | 'watchlist' | 'strategies' | 'journals'

export const TABS: { key: TabKey; label: string; icon: typeof Gauge }[] = [
  { key: 'dashboard', label: '驾驶舱', icon: Gauge },
  { key: 'positions', label: '持仓', icon: Briefcase },
  { key: 'watchlist', label: '观察', icon: Eye },
  { key: 'strategies', label: '策略', icon: Target },
  { key: 'journals', label: '日记', icon: BookOpen },
]

// ── 市场温度映射 ──────────────────────────────
export const TEMPERATURE_LABELS: Record<string, string> = {
  freeze: '冰点',
  divergence: '分歧',
  recovery: '回暖',
  climax: '高潮',
  overheating: '过热',
}

export const TEMPERATURE_COLORS: Record<string, string> = {
  freeze: 'bg-blue-100 text-blue-700',
  divergence: 'bg-yellow-100 text-yellow-700',
  recovery: 'bg-green-100 text-green-700',
  climax: 'bg-orange-100 text-orange-700',
  overheating: 'bg-red-100 text-red-700',
}

// ── 持仓状态 ──────────────────────────────────
export const POSITION_STATUS_LABELS: Record<PositionStatus, string> = {
  holding: '持有中',
  closed: '已清仓',
}

export const POSITION_STATUS_COLORS: Record<PositionStatus, string> = {
  holding: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-600',
}

// ── 交易方向 ──────────────────────────────────
export const TRANSACTION_ACTION_LABELS: Record<TransactionAction, string> = {
  buy: '买入',
  sell: '卖出',
}

export const TRANSACTION_ACTION_COLORS: Record<TransactionAction, string> = {
  buy: 'text-red-600',
  sell: 'text-green-600',
}
