import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PhoneLoginFormProps {
  onSuccess?: () => void
}

export function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const { phoneLogin, sendPhoneCode } = useAuth()

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    if (!phone.trim()) {
      setError('Please enter phone number')
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('Invalid phone number')
      return
    }

    setLoading(true)
    setError('')

    const result = await sendPhoneCode(phone)

    if (result.success) {
      setStep('code')
      setCountdown(result.countdown ?? 60)
    } else {
      setError(result.message || 'Failed to send code')
    }

    setLoading(false)
  }, [phone, sendPhoneCode])

  // 验证码登陆
  const handleLogin = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter verification code')
      return
    }

    setLoading(true)
    setError('')

    const success = await phoneLogin(phone, code)

    if (success) {
      onSuccess?.()
    } else {
      setError('Login failed. Please check your code.')
    }

    setLoading(false)
  }, [phone, code, phoneLogin, onSuccess])

  // 返回到手机号输入
  const handleBack = () => {
    setStep('phone')
    setCode('')
    setError('')
  }

  return (
    <div className="w-full space-y-4">
      {step === 'phone' ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setError('')
              }}
              placeholder="1xxxxxxxxxx"
              maxLength={11}
              className="w-full px-3 py-2 rounded border"
              style={{
                backgroundColor: 'var(--color-bg-base)',
                borderColor: 'var(--color-border-light)',
                color: 'var(--color-text-primary)',
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSendCode}
            disabled={loading || !phone.trim()}
            className="w-full py-2 px-4 rounded font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </>
      ) : (
        <>
          <div className="text-center mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-sm">Verification code sent to {phone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-3 py-2 rounded border text-center text-lg tracking-widest"
              style={{
                backgroundColor: 'var(--color-bg-base)',
                borderColor: 'var(--color-border-light)',
                color: 'var(--color-text-primary)',
              }}
              disabled={loading || countdown > 0}
            />
          </div>

          {error && (
            <div className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !code.trim()}
            className="w-full py-2 px-4 rounded font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSendCode}
              disabled={loading || countdown > 0}
              className="flex-1 py-2 px-3 rounded border text-sm transition-opacity disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border-light)',
                color: 'var(--color-primary)',
              }}
            >
              {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
            </button>

            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded border text-sm transition-opacity disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border-light)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  )
}
