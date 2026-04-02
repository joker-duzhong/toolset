import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { User, AuthStatus } from '@/types/auth'
import { isWeChatBrowser } from '@/utils/wechat'
import { getStoredTokens, setStoredTokens, clearStoredTokens } from '@/utils/storage'
import { apiClient, API_BASE, WECHAT_APP_ID } from '@/utils/apiClient'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: 'checking',
  logout: () => {},
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
      if (res.data) {
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

    // 非微信浏览器直接跳过登录
    if (!isWeChatBrowser()) {
      setStatus('unauthenticated')
      return
    }

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    const init = async () => {
      // 优先检查已有 token
      const tokens = getStoredTokens()
      if (tokens) {
        const ok = await fetchUser()
        if (ok) return
        // token 无效，继续走 code 或重新授权
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
        // code 无效或已使用过，清理 URL 防止死循环，直接允许无登录使用
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

  return (
    <AuthContext.Provider value={{ user, status, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
