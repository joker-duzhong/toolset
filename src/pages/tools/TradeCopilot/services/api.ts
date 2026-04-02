// ────────────────────────────────────────────────
// Trade Copilot - API 服务层
// ────────────────────────────────────────────────
// 所有请求统一携带 app 标识符 (X-App header)
// ────────────────────────────────────────────────

import { apiClient } from '@/utils/apiClient'
import type {
  MarketStatus,
  Thermometer,
  StListResponse,
  Position,
  CreatePositionRequest,
  UpdatePositionRequest,
  Transaction,
  CreateTransactionRequest,
  WatchlistItem,
  CreateWatchlistRequest,
  UpdateWatchlistRequest,
  Journal,
  CreateJournalRequest,
  UpdateJournalRequest,
  Strategy,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  CapitalSettings,
  UpdateCapitalRequest,
} from '../types'

const BASE = '/trade-copilot'
const APP_KEY = 'hope_trade_copilot'

/** 统一注入 app header */
function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('X-App', APP_KEY)
  return { ...init, headers }
}

// ── 1. 大盘 & 风控 ──────────────────────────────

export async function getMarketStatus() {
  return apiClient<MarketStatus>(`${BASE}/market/status`, withAppHeader())
}

export async function getMarketThermometer() {
  return apiClient<Thermometer>(`${BASE}/market/thermometer`, withAppHeader())
}

export async function getStList() {
  return apiClient<StListResponse>(`${BASE}/market/st-list`, withAppHeader())
}

// ── 2. 持仓 ──────────────────────────────────────

export async function getPositions(status?: string) {
  const query = status ? `?status=${status}` : ''
  return apiClient<Position[]>(`${BASE}/positions${query}`, withAppHeader())
}

export async function createPosition(data: CreatePositionRequest) {
  return apiClient<Position>(`${BASE}/positions`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

export async function updatePosition(id: number, data: UpdatePositionRequest) {
  return apiClient<Position>(`${BASE}/positions/${id}`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }))
}

export async function deletePosition(id: number) {
  return apiClient<null>(`${BASE}/positions/${id}`, withAppHeader({
    method: 'DELETE',
  }))
}

// ── 3. 交易流水 ──────────────────────────────────

export async function getTransactions(positionId: number) {
  return apiClient<Transaction[]>(`${BASE}/positions/${positionId}/transactions`, withAppHeader())
}

export async function createTransaction(positionId: number, data: CreateTransactionRequest) {
  return apiClient<Transaction>(`${BASE}/positions/${positionId}/transactions`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

// ── 4. 观察池 ────────────────────────────────────

export async function getWatchlist() {
  return apiClient<WatchlistItem[]>(`${BASE}/watchlist`, withAppHeader())
}

export async function addToWatchlist(data: CreateWatchlistRequest) {
  return apiClient<WatchlistItem>(`${BASE}/watchlist`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

export async function updateWatchlist(id: number, data: UpdateWatchlistRequest) {
  return apiClient<WatchlistItem>(`${BASE}/watchlist/${id}`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }))
}

export async function deleteWatchlist(id: number) {
  return apiClient<null>(`${BASE}/watchlist/${id}`, withAppHeader({
    method: 'DELETE',
  }))
}

// ── 5. 交易日记 ──────────────────────────────────

export async function getJournals() {
  return apiClient<Journal[]>(`${BASE}/journals`, withAppHeader())
}

export async function createJournal(data: CreateJournalRequest) {
  return apiClient<Journal>(`${BASE}/journals`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

export async function updateJournal(id: number, data: UpdateJournalRequest) {
  return apiClient<Journal>(`${BASE}/journals/${id}`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }))
}

// ── 6. 资金设置 ──────────────────────────────────

export async function getCapital() {
  return apiClient<CapitalSettings>(`${BASE}/settings/capital`, withAppHeader())
}

export async function updateCapital(data: UpdateCapitalRequest) {
  return apiClient<CapitalSettings>(`${BASE}/settings/capital`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }))
}

// ── 7. 策略 ──────────────────────────────────────

export async function getStrategies() {
  return apiClient<Strategy[]>(`${BASE}/strategies`, withAppHeader())
}

export async function createStrategy(data: CreateStrategyRequest) {
  return apiClient<Strategy>(`${BASE}/strategies`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

export async function updateStrategy(id: number, data: UpdateStrategyRequest) {
  return apiClient<Strategy>(`${BASE}/strategies/${id}`, withAppHeader({
    method: 'PUT',
    body: JSON.stringify(data),
  }))
}

export async function deleteStrategy(id: number) {
  return apiClient<null>(`${BASE}/strategies/${id}`, withAppHeader({
    method: 'DELETE',
  }))
}

// ── 8. 飞书测试 ──────────────────────────────────

export async function feishuTest(title: string, msg: string) {
  return apiClient<null>(`${BASE}/feishu-test?title=${encodeURIComponent(title)}&msg=${encodeURIComponent(msg)}`, withAppHeader({
    method: 'POST',
  }))
}
