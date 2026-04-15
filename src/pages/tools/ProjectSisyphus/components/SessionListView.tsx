import type { LearningSession } from '../types'

interface SessionListViewProps {
  sessions: LearningSession[]
  onResume: (session: LearningSession) => void
  onAbandon: (session: LearningSession) => void
  onStartNew: () => void
  loading: boolean
}

export function SessionListView({ sessions, onResume, onAbandon, onStartNew, loading }: SessionListViewProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">&#x1F9E0;</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">西西弗斯认知引擎</h1>
            <p className="text-sm text-gray-500">选择一个会话继续学习</p>
          </div>

          {/* 新建会话 */}
          <button
            onClick={onStartNew}
            disabled={loading}
            className="w-full mb-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
            )}
            {loading ? '正在创建...' : '开始新会话'}
          </button>

          {/* 活跃会话列表 */}
          {sessions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">进行中的会话</h3>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {session.scenario_description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(session.created_at).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      进行中
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => onResume(session)}
                      disabled={loading}
                      className="flex-1 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium active:scale-95 transition disabled:opacity-50"
                    >
                      继续
                    </button>
                    <button
                      onClick={() => onAbandon(session)}
                      disabled={loading}
                      className="py-2 px-3 rounded-lg bg-gray-50 text-gray-400 text-xs font-medium active:scale-95 transition hover:text-red-500 disabled:opacity-50"
                    >
                      放弃
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">暂无进行中的会话</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
