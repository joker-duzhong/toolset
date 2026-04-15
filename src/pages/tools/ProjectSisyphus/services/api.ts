import { apiClient } from '@/utils/apiClient'
import type {
  ApiResponse,
  PaginatedResponse,
  SetGoalRequest,
  SetGoalResponse,
  StartSessionResponse,
  ChatRequest,
  ChatResponse,
  ChallengeRequest,
  ChallengeResponse,
  KnowledgeNode,
  LearningSession,
  SessionDetailResponse,
  SessionStatusFilter,
} from '../types'

const BASE = '/sisyphus'
const APP_KEY = 'hope_project_sisyphus'

function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('app', APP_KEY)
  return { ...init, headers }
}

/** 设定学习目标 */
export async function setGoal(data: SetGoalRequest) {
  return apiClient<SetGoalResponse>(`${BASE}/set-goal`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  })) as Promise<ApiResponse<SetGoalResponse>>
}

/** 开始学习会话 */
export async function startSession() {
  return apiClient<StartSessionResponse>(`${BASE}/start-session`, withAppHeader({
    method: 'POST',
  })) as Promise<ApiResponse<StartSessionResponse>>
}

/** 核心对话循环 */
export async function chat(data: ChatRequest) {
  return apiClient<ChatResponse>(`${BASE}/chat`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  })) as Promise<ApiResponse<ChatResponse>>
}

/** 用户挑战（我不服） */
export async function challenge(data: ChallengeRequest) {
  return apiClient<ChallengeResponse>(`${BASE}/challenge`, withAppHeader({
    method: 'POST',
    body: JSON.stringify(data),
  })) as Promise<ApiResponse<ChallengeResponse>>
}

/** 获取知识节点列表（分页） */
export async function listNodes(params?: { page?: number; page_size?: number }) {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.page_size) query.set('page_size', String(params.page_size))
  const qs = query.toString()
  return apiClient<PaginatedResponse<KnowledgeNode>>(`${BASE}/nodes${qs ? `?${qs}` : ''}`, withAppHeader()) as Promise<PaginatedResponse<KnowledgeNode>>
}

/** 获取学习会话列表（分页） */
export async function listSessions(params?: { status?: SessionStatusFilter; page?: number; page_size?: number }) {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.page) query.set('page', String(params.page))
  if (params?.page_size) query.set('page_size', String(params.page_size))
  const qs = query.toString()
  return apiClient<PaginatedResponse<LearningSession>>(`${BASE}/sessions${qs ? `?${qs}` : ''}`, withAppHeader()) as Promise<PaginatedResponse<LearningSession>>
}

/** 获取活跃会话列表 */
export async function listActiveSessions() {
  return apiClient<LearningSession[]>(`${BASE}/active-sessions`, withAppHeader()) as Promise<ApiResponse<LearningSession[]>>
}

/** 获取会话详情 */
export async function getSessionDetail(sessionId: string) {
  return apiClient<SessionDetailResponse>(`${BASE}/sessions/${sessionId}`, withAppHeader()) as Promise<ApiResponse<SessionDetailResponse>>
}

/** 放弃活跃会话 */
export async function abandonSession(sessionId: string) {
  return apiClient<LearningSession>(`${BASE}/sessions/${sessionId}/abandon`, withAppHeader({
    method: 'POST',
  })) as Promise<ApiResponse<LearningSession>>
}
