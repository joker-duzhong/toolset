import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { isWeChatBrowser } from '@/utils/wechat'
import { WECHAT_APP_ID } from '@/utils/apiClient'
import { PhoneLoginForm } from './PhoneLoginForm'
import { PasswordLoginForm } from './PasswordLoginForm'

interface AuthModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone' | 'password' | null>(null)
  const isWechat = isWeChatBrowser()

  useEffect(() => {
    // 当选择微信登陆时，触发重定向
    if (loginMethod === 'wechat') {
      try {
        const redirectUri = window.location.origin + window.location.pathname + window.location.search
        const appid = WECHAT_APP_ID
        const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${encodeURIComponent(appid)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`
        window.location.href = authUrl
      } catch (err) {
        console.error('Failed to initiate WeChat login:', err)
        setLoginMethod(null)
      }
    }
  }, [loginMethod])

  const handlePhoneLoginSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-end z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal Bottom Sheet */}
      <div
        className="w-full rounded-t-2xl p-6 space-y-4 relative"
        style={{
          backgroundColor: 'var(--color-bg-base)',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:opacity-60"
        >
          <X size={24} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        {/* Header */}
        <div className="pr-10">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Login Required
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            Please log in to access this feature
          </p>
        </div>

        {/* Login Method Selection or Form */}
        {loginMethod === null ? (
          <div className="space-y-3">
            {isWechat && (
              <button
                onClick={() => setLoginMethod('wechat')}
                className="w-full py-3 px-4 rounded-lg font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: '#09B83E',
                  color: 'white',
                }}
              >
                <span>🔗</span>
                <span>WeChat Login</span>
              </button>
            )}

            <button
              onClick={() => setLoginMethod('phone')}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              Phone Number Login
            </button>

            <button
              onClick={() => setLoginMethod('password')}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              Username & Password
            </button>
          </div>
        ) : loginMethod === 'wechat' ? (
          <div className="space-y-4">
            <div className="text-center space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
              <p>Redirecting to WeChat...</p>
            </div>
            <button
              onClick={() => setLoginMethod(null)}
              className="w-full py-2 px-4 rounded text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              Back
            </button>
          </div>
        ) : loginMethod === 'phone' ? (
          <div className="space-y-4">
            <PhoneLoginForm onSuccess={handlePhoneLoginSuccess} />
            <button
              onClick={() => setLoginMethod(null)}
              className="w-full py-2 px-4 rounded text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <PasswordLoginForm onSuccess={handlePhoneLoginSuccess} />
            <button
              onClick={() => setLoginMethod(null)}
              className="w-full py-2 px-4 rounded text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
