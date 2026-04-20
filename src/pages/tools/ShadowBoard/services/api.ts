import { apiClient, API_BASE } from '@/utils/apiClient';
import { getStoredTokens } from '@/utils/storage';
import type {
  BoardSession,
  SessionListResponse,
  SessionMessagesResponse,
  ChatRequest,
  ChatResponse,
} from '../types';

const BASE = '/shadow-board';
const APP_KEY = 'hope_shadow_board';

function withAppHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('app', APP_KEY);
  return { ...init, headers };
}

// 获取全量会话列表
export async function getSessions() {
  return apiClient<SessionListResponse>(`${BASE}/history`, withAppHeader());
}

// 抛出新想法或追载消息
export async function speakInBoard(data: ChatRequest) {
  return apiClient<ChatResponse>(
    `${BASE}/chat`,
    withAppHeader({
      method: 'POST',
      body: JSON.stringify(data),
    })
  );
}

// 获取某一会话全量消息记录
export async function getSessionHistory(sessionId: string) {
  return apiClient<SessionMessagesResponse>(
    `${BASE}/messages?session_id=${sessionId}`,
    withAppHeader()
  );
}

// 获取会话当前状态
export async function getSessionStatus(sessionId: string) {
  return apiClient<BoardSession>(
    `${BASE}/status?session_id=${sessionId}`,
    withAppHeader()
  );
}

// 重试失败的任务
export async function retrySession(sessionId: string) {
  return apiClient<{ message: string }>(
    `${BASE}/retry?session_id=${sessionId}`,
    withAppHeader({
      method: 'POST',
    })
  );
}

// 创建并返回自定义原生 Fetch Stream 以支持携带 Token 与 App header
export async function createSSERequest(sessionId: string, signal?: AbortSignal) {
  const tokens = getStoredTokens();
  const headers = new Headers();
  headers.set('app', APP_KEY);
  headers.set('Accept', 'text/event-stream');

  if (tokens) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  const response = await fetch(`${API_BASE}${BASE}/stream?session_id=${sessionId}`, {
    method: 'GET',
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`SSE Connection failed: ${response.status}`);
  }

  return response.body;
}
