export interface User {
  id: number
  nickname: string | null
  avatar: string | null
  openid: string | null
  phone: string | null
  source: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'
