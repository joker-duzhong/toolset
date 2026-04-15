// 白旗求和按钮组件
import { useState } from 'react'
import { Flag } from 'lucide-react'

interface WhiteFlagButtonProps {
  raised: boolean
  onRaise: () => void
  onLower: () => void
}

export function WhiteFlagButton({ raised, onRaise, onLower }: WhiteFlagButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (raised) {
    return (
      <button
        onClick={onLower}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
      >
        <Flag size={18} className="text-stone-400" />
        <span className="text-sm">收起白旗</span>
      </button>
    )
  }

  return (
    <div className="relative z-20">
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-stone-100 to-stone-200 rounded-full shadow-md text-stone-600 hover:from-stone-200 hover:to-stone-300 transition-all"
      >
        <Flag size={18} />
        <span className="text-sm">举白旗</span>
      </button>

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed bottom-auto right-auto bg-white rounded-2xl p-4 shadow-lg border border-stone-100 w-48 z-50" style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <p className="text-sm text-stone-600 mb-3 text-center">
            🏳️ 确认举白旗求和？
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 py-2 text-sm text-stone-500 bg-stone-100 rounded-xl"
            >
              取消
            </button>
            <button
              onClick={() => {
                onRaise()
                setShowConfirm(false)
              }}
              className="flex-1 px-3 py-2 text-sm text-white bg-amber-500 rounded-xl"
            >
              确认
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 白旗动画 - 对方收到白旗时展示
export function WhiteFlagAnimation({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center animate-bounce-in">
        {/* 小狗送花动画 - 使用 emoji 代替 */}
        <div className="text-6xl mb-4 animate-float">🐕💐</div>

        <h2 className="text-xl font-bold text-stone-800 mb-2">
          Ta 举白旗啦！
        </h2>
        <p className="text-stone-500 mb-6">
          原谅 Ta 了吧～
        </p>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          接受求和 🤝
        </button>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
