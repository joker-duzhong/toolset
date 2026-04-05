import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { User, AuthStatus } from '@/types/auth'
import { isWeChatBrowser } from '@/utils/wechat'
import { getStoredTokens, setStoredTokens, clearStoredTokens } from '@/utils/storage'
import { apiClient, API_BASE, WECHAT_APP_ID } from '@/utils/apiClient'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  logout: () => void
  phoneLogin: (phone: string, code: string) => Promise<boolean>
  sendPhoneCode: (phone: string) => Promise<{ success: boolean; countdown?: number; message?: string }>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: 'checking',
  logout: () => {},
  phoneLogin: async () => false,
  sendPhoneCode: async () => ({ success: false }),
})

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const initialized = useRef(false)

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient<User>('/auth/me')
      if (res.data && String(res.code).startsWith('2')) {
        setUser(res.data)
        setStatus('authenticated')
        return true
      }
    } catch {
      // ignore
    }
    return false
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    const init = async () => {
      // 优先检查已有 token
      const tokens = getStoredTokens()
      if (tokens) {
        const ok = await fetchUser()
        if (ok) return
        // token 无效，继续处理
      }

      // 非微信浏览器跳过微信登录，直接允许使用
      if (!isWeChatBrowser()) {
        setStatus('unauthenticated')
        return
      }

      // 处理微信回调的 code
      if (code) {
        try {
          const res = await fetch(`${API_BASE}/auth/wechat/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, appid: WECHAT_APP_ID }),
          })
          const json = await res.json()
          if (json.data) {
            setStoredTokens(json.data)
            // 清理 URL 中的 code 和 state 参数
            params.delete('code')
            params.delete('state')
            const cleanUrl = params.toString()
              ? `${window.location.pathname}?${params.toString()}`
              : window.location.pathname
            window.history.replaceState({}, '', cleanUrl)

            await fetchUser()
            return
          }
        } catch {
          // code 换 token 失败
        }
        // code 无效或已使用过，清理 URL 防止死循环
        params.delete('code')
        params.delete('state')
        const cleanUrl = params.toString()
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
        setStatus('unauthenticated')
        return
      }

      // 无有效 token 且无 code → 获取微信授权 URL 并重定向
      try {
        const redirectUri = window.location.origin + window.location.pathname
        const appid = WECHAT_APP_ID
        const res = await fetch(
          `${API_BASE}/auth/wechat/url?appid=${encodeURIComponent(appid)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=snsapi_base`,
        )
        const json = await res.json()
        if (json.data?.auth_url) {
          window.location.href = json.data.auth_url
          return // 重定向中，不更新状态
        }
      } catch {
        // 获取授权 URL 失败
      }

      // 所有尝试失败，允许无登录使用
      setStatus('unauthenticated')
    }

    init()
  }, [fetchUser])

  const logout = useCallback(() => {
    clearStoredTokens()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const phoneLogin = useCallback(async (phone: string, code: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/phone/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      const json = await res.json()
      if (json.data && String(json.code).startsWith('2')) {
        setStoredTokens(json.data)
        const ok = await fetchUser()
        return ok
      }
      return false
    } catch {
      return false
    }
  }, [fetchUser])

  const sendPhoneCode = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/phone/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const json = await res.json()
      if (json.data && String(json.code).startsWith('2')) {
        return {
          success: true,
          countdown: json.data.countdown,
          message: json.message,
        }
      }
      return {
        success: false,
        message: json.message || '发送验证码失败',
      }
    } catch (err) {
      return {
        success: false,
        message: '网络错误，请重试',
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, logout, phoneLogin, sendPhoneCode }}>
      {children}
    </AuthContext.Provider>
  )
}
