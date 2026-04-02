// ────────────────────────────────────────────────
// Trade Copilot - 类型定义
// ────────────────────────────────────────────────
// 对齐 OpenAPI: https://api.lxyy.fun/docs
// ────────────────────────────────────────────────

// ── 大盘 & 风控 ──────────────────────────────────

/** 大盘红绿灯状态 */
export interface MarketStatus {
  sh_status: 'red' | 'green'
  sz_status: 'red' | 'green'
  sh_reason: string
  sz_reason: string
}

/** 市场温度计 */
export interface Thermometer {
  score: number
  temperature: string
  total_stocks: number
  up_count: number
  down_count: number
  flat_count: number
  median_pct_change: number
  limit_up_count: number
  limit_down_count: number
  top_sectors: SectorItem[]
}

/** 领涨板块 */
export interface SectorItem {
  sector_name: string
  pct_change: number
}

/** ST 黑名单响应 */
export interface StListResponse {
  count: number
  stocks: string[]
  update_time: string
}

// ── 持仓 ──────────────────────────────────────

/** 持仓状态 */
export type PositionStatus = 'holding' | 'closed'

/** 持仓记录 */
export interface Position {
  id: number
  symbol: string
  name: string
  buy_date: string
  cost_price: number
  quantity: number
  status: PositionStatus
  high_water_mark?: number
  strategy_id?: number
  user_id: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

/** 新增持仓请求 */
export interface CreatePositionRequest {
  symbol: string
  name: string
  buy_date: string
  cost_price: number
  quantity: number
}

/** 更新持仓请求 */
export interface UpdatePositionRequest {
  status?: PositionStatus
  [key: string]: unknown
}

// ── 交易流水 ──────────────────────────────────

/** 交易方向 */
export type TransactionAction = 'buy' | 'sell'

/** 交易流水 */
export interface Transaction {
  id: number
  position_id: number
  action: TransactionAction
  price: number
  quantity: number
  fee?: number
  transaction_time: string
  created_at: string
}

/** 新增交易流水请求 */
export interface CreateTransactionRequest {
  action: TransactionAction
  price: number
  quantity: number
  fee?: number
  transaction_time?: string
}

// ── 观察池 ────────────────────────────────────

/** 观察池条目 */
export interface WatchlistItem {
  id: number
  symbol: string
  name: string
  reason: string
  monitor_status?: string
  created_at: string
  updated_at: string
}

/** 新增观察请求 */
export interface CreateWatchlistRequest {
  symbol: string
  name: string
  reason?: string
}

/** 更新观察请求 */
export interface UpdateWatchlistRequest {
  reason?: string
  [key: string]: unknown
}

// ── 交易日记 ──────────────────────────────────

/** 交易日记 */
export interface Journal {
  id: number
  record_date: string
  execution_score: number
  notes: string
  mistakes_made: string
  emotions: string
  created_at: string
  updated_at: string
}

/** 创建日记请求 */
export interface CreateJournalRequest {
  record_date: string
  execution_score: number
  notes?: string
  mistakes_made?: string
  emotions?: string
}

/** 更新日记请求 */
export interface UpdateJournalRequest {
  record_date?: string
  execution_score?: number
  notes?: string
  mistakes_made?: string
  emotions?: string
}

// ── 策略 ──────────────────────────────────────

/** 策略 */
export interface Strategy {
  id: number
  name: string
  take_profit_drawdown_pct: number
  stop_loss_pct: number
  description: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

/** 创建策略请求 */
export interface CreateStrategyRequest {
  name: string
  take_profit_drawdown_pct: number
  stop_loss_pct: number
  description?: string
}

/** 更新策略请求 */
export interface UpdateStrategyRequest {
  name?: string
  take_profit_drawdown_pct?: number
  stop_loss_pct?: number
  description?: string
}

// ── 资金设置 ──────────────────────────────────

/** 资金设置 */
export interface CapitalSettings {
  total_capital: number
  commission_rate: number
  min_commission: number
  stamp_duty_rate: number
}

/** 更新资金设置请求 */
export interface UpdateCapitalRequest {
  total_capital: number
}
