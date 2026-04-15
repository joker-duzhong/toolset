import { useState } from 'react'
interface GoalSettingViewProps {
  onSubmit: (goal: string) => void
  loading: boolean
  nodesTotal: number
}

export function GoalSettingView({ onSubmit, loading, nodesTotal }: GoalSettingViewProps) {
  const [goal, setGoal] = useState('')

  const handleSubmit = () => {
    if (!goal.trim() || goal.trim().length < 2) return
    onSubmit(goal.trim())
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">&#x1F9E0;</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">西西弗斯认知引擎</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            告诉我你想学什么，<br />
            我会拆解成知识节点，通过生存场景逼你掌握
          </p>
        </div>

        {/* 如果已有知识节点 */}
        {nodesTotal > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium mb-1">已有 {nodesTotal} 个知识节点</p>
            <p className="text-xs text-indigo-400">设定新目标会追加节点，不会覆盖已有的</p>
          </div>
        )}

        {/* 输入框 */}
        <div className="space-y-3">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="例如：我想在出国旅行时能流利应对各种场景"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none border border-transparent focus:border-indigo-200 transition"
          />

          <p className="text-xs text-gray-400 text-right">{goal.length}/500</p>

          <button
            onClick={handleSubmit}
            disabled={loading || goal.trim().length < 2}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'AI 正在解构目标...' : '开始学习之旅'}
          </button>
        </div>
      </div>
    </div>
  )
}
