// 情侣绑定视图 - 邀请绑定流程
import { useState, useEffect } from 'react'
import { coupleApi } from '../services/api'
import { InvitePoster } from '../components/InvitePoster'

interface CoupleBindViewProps {
  onBindSuccess: () => void
}

export function CoupleBindView({ onBindSuccess }: CoupleBindViewProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showPoster, setShowPoster] = useState(false)

  // 从 URL 参数中自动填充邀请码
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const codeFromUrl = params.get('invite_code')
    if (codeFromUrl && mode === 'choose') {
      setInputCode(codeFromUrl.toUpperCase())
      setMode('join')
    }
  }, [])

  // 创建情侣关系
  const handleCreate = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await coupleApi.create()

      // 检查 code 是否为 2xx（成功）
      if (!String(res.code).startsWith('2')) {
        setError(res.message || '创建失败，请稍后重试')
        return
      }

      // 获取邀请码
      if (res.data?.invite_code) {
        setInviteCode(res.data.invite_code)
        setMode('create')
      } else {
        setError('创建失败，未获取邀请码')
      }
    } catch (err) {
      console.error('Failed to create couple:', err)
      setError('创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 复制邀请码
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // 通过邀请码加入
  const handleJoin = async () => {
    if (!inputCode.trim()) {
      setError('请输入邀请码')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await coupleApi.join(inputCode.trim())
      if (!String(res.code).startsWith('2')) {
        setError(res.message || '邀请码无效或已过期')
        return
      }
      // 绑定成功，刷新数据
      onBindSuccess()
    } catch (err) {
      console.error('Failed to join couple:', err)
      setError('邀请码无效或已过期')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 to-amber-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💕</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">恰好</h1>
          <p className="text-stone-500 text-sm">情侣专属温馨小工具</p>
        </div>

        {mode === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-medium shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '创建中...' : '发起邀请'}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <span className="relative bg-gradient-to-b from-rose-50 to-amber-50/50 px-4 text-sm text-stone-400">
                或者
              </span>
            </div>

            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-white text-stone-700 rounded-2xl font-medium border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all active:scale-[0.98]"
            >
              输入邀请码
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-100">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">💌</div>
              <h2 className="text-lg font-semibold text-stone-800">你的专属邀请码</h2>
              <p className="text-stone-500 text-sm mt-1">分享给 Ta，扫码或输入后即可绑定</p>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-4 mb-4">
              <div className="text-center">
                <span className="text-3xl font-mono font-bold text-rose-600 tracking-widest">
                  {inviteCode}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowPoster(true)}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
              >
                📱 生成邀请海报
              </button>

              <button
                onClick={handleCopyCode}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  copySuccess
                    ? 'bg-green-100 text-green-600'
                    : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                }`}
              >
                {copySuccess ? '✓ 已复制' : '📋 复制邀请码'}
              </button>
            </div>

            <p className="text-center text-stone-400 text-xs mt-4">
              等待对方绑定中，绑定后自动进入
            </p>

            {/* 返回按钮 */}
            <button
              onClick={() => {
                setMode('choose')
                setInviteCode('')
              }}
              className="w-full mt-4 py-2 text-stone-500 text-sm hover:text-stone-700"
            >
              返回
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-100">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔑</div>
              <h2 className="text-lg font-semibold text-stone-800">输入邀请码</h2>
              <p className="text-stone-500 text-sm mt-1">输入对方的邀请码完成绑定</p>
            </div>

            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="请输入邀请码"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-xl font-mono tracking-wider focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              maxLength={8}
            />

            {error && (
              <p className="text-red-500 text-sm text-center mt-3">{error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={loading || !inputCode.trim()}
              className="w-full mt-4 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '绑定中...' : '绑定'}
            </button>

            {/* 返回按钮 */}
            <button
              onClick={() => {
                setMode('choose')
                setInputCode('')
                setError(null)
              }}
              className="w-full mt-4 py-2 text-stone-500 text-sm hover:text-stone-700"
            >
              返回
            </button>
          </div>
        )}

        {/* 错误提示（选择模式） */}
        {mode === 'choose' && error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>

      {/* 海报弹窗 - 在选择模式和加入模式时也可以显示 */}
      {showPoster && <InvitePoster inviteCode={inviteCode} onClose={() => setShowPoster(false)} />}
    </div>
  )
}

export default CoupleBindView
