import type { AuthTokens } from '@/types/auth'

const KEYS = {
  accessToken: 'auth_access_token',
  refreshToken: 'auth_refresh_token',
  tokenType: 'auth_token_type',
} as const

export function getStoredTokens(): { accessToken: string; refreshToken: string; tokenType: string } | null {
  const accessToken = localStorage.getItem(KEYS.accessToken)
  const refreshToken = localStorage.getItem(KEYS.refreshToken)
  const tokenType = localStorage.getItem(KEYS.tokenType)
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken, tokenType: tokenType ?? 'bearer' }
}

export function setStoredTokens(tokens: AuthTokens): void {
  localStorage.setItem(KEYS.accessToken, tokens.access_token)
  localStorage.setItem(KEYS.refreshToken, tokens.refresh_token)
  localStorage.setItem(KEYS.tokenType, tokens.token_type)
}

export function clearStoredTokens(): void {
  localStorage.removeItem(KEYS.accessToken)
  localStorage.removeItem(KEYS.refreshToken)
  localStorage.removeItem(KEYS.tokenType)
}
