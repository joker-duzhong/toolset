// ────────────────────────────────────────────────
// 言图 (TypoCraft) - API 服务层
// ────────────────────────────────────────────────

import { apiClient } from '@/utils/apiClient'
import { API_BASE, APP_KEY } from '../constants'
import type {
  TypoProject,
  AssetFeedItem,
  AssetStatusOut,
  PaginatedData,
  GeneratePosterPayload,
  GenerateIllustrationPayload,
  CreateProjectPayload,
  AssetStatusUpdatePayload,
} from '../types'

/** 统一注入 app header */
function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('app', APP_KEY)
  return { ...init, headers }
}

// ── 1. 广场 Feed ────────────────────────────────

export async function fetchFeed(page = 1, pageSize = 20) {
  return apiClient<PaginatedData<AssetFeedItem>>(
    `${API_BASE}/feed?page=${page}&page_size=${pageSize}`,
    withAppHeader(),
  )
}

// ── 2. 项目管理 ─────────────────────────────────

export async function getProjects() {
  return apiClient<TypoProject[]>(`${API_BASE}/projects`, withAppHeader())
}

export async function createProject(data: CreateProjectPayload) {
  return apiClient<TypoProject>(API_BASE + '/projects', withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

// ── 3. 生成任务 ─────────────────────────────────

export async function generatePoster(data: GeneratePosterPayload) {
  return apiClient<{ task_id: string }>(API_BASE + '/generate/poster', withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

export async function generateIllustration(data: GenerateIllustrationPayload) {
  return apiClient<{ task_id: string }>(API_BASE + '/generate/illustration', withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  }))
}

// ── 4. 状态轮询 ─────────────────────────────────

export async function pollAssetStatus(assetId: string) {
  return apiClient<AssetStatusOut>(`${API_BASE}/assets/${assetId}/status`, withAppHeader())
}

// ── 5. 资产状态更新 ─────────────────────────────

export async function updateAssetStatus(assetId: string, data: AssetStatusUpdatePayload) {
  return apiClient<AssetStatusOut>(`${API_BASE}/assets/${assetId}`, withAppHeader({
    method: 'PATCH',
    body: JSON.stringify(data),
  }))
}
