import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PasswordLoginFormProps {
  onSuccess?: () => void
}

export function PasswordLoginForm({ onSuccess }: PasswordLoginFormProps) {
  const { passwordLogin } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = useCallback(async () => {
    if (!username.trim()) {
      setError('Please enter username')
      return
    }

    if (!password.trim()) {
      setError('Please enter password')
      return
    }

    setLoading(true)
    setError('')

    const result = await passwordLogin(username, password)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.message || 'Login failed')
    }

    setLoading(false)
  }, [username, password, passwordLogin, onSuccess])

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError('')
          }}
          placeholder="Enter your username"
          className="w-full px-3 py-2 rounded border"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderColor: 'var(--color-border-light)',
            color: 'var(--color-text-primary)',
          }}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          placeholder="Enter your password"
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
        onClick={handleLogin}
        disabled={loading || !username.trim() || !password.trim()}
        className="w-full py-2 px-4 rounded font-medium transition-opacity disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
        }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  )
}
