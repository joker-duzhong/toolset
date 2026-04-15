import { useState } from 'react'

interface ChallengeDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  loading?: boolean
}

export function ChallengeDialog({ open, onClose, onSubmit, loading }: ChallengeDialogProps) {
  const [reason, setReason] = useState('')

  if (!open) return null

  const handleSubmit = () => {
    if (!reason.trim()) return
    onSubmit(reason.trim())
    setReason('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">我不服，请裁判！</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-3">说明你的理由，独立裁判将重新审视这场判定</p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="我觉得我的答案才是对的，因为..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none border border-gray-200"
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !reason.trim()}
          className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400"
        >
          {loading ? '裁判裁决中...' : '提交挑战'}
        </button>
      </div>
    </div>
  )
}
