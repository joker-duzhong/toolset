// 清单与备忘视图
import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { TodoItemCard, TodoInput } from '../components/TodoItem'
import { MemoCard, MemoCreateModal, MemoGrid } from '../components/MemoCard'
import type { TodoItem, Memo, ListSubTab } from '../types'

interface ListViewProps {
  todos: TodoItem[]
  memos: Memo[]
  onAddTodo: (content: string) => void
  onToggleTodo: (id: number, status: 'pending' | 'completed') => void
  onDeleteTodo: (id: number) => void
  onAddMemo: (content: string, images: string[]) => void
  onDeleteMemo: (id: number) => void
}

// 简单的撒花效果
function useConfetti() {
  const showConfetti = useCallback(() => {
    // 使用 canvas-confetti 或简单的 CSS 动画
    // 这里用简单的震动反馈代替
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  }, [])

  return showConfetti
}

export function ListView({
  todos,
  memos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onAddMemo,
  onDeleteMemo,
}: ListViewProps) {
  const [activeTab, setActiveTab] = useState<ListSubTab>('todo')
  const [showMemoModal, setShowMemoModal] = useState(false)
  const showConfetti = useConfetti()

  const pendingTodos = todos.filter((t) => t.status === 'pending')
  const completedTodos = todos.filter((t) => t.status === 'completed')

  return (
    <div className="min-h-full pb-6">
      {/* 顶部 Tab 切换 */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-amber-50 to-transparent pt-2 pb-4 px-4">
        <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('todo')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === 'todo'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
                : 'text-stone-500'
            )}
          >
            <span>📋</span>
            待办清单
            {pendingTodos.length > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === 'todo'
                    ? 'bg-white/30'
                    : 'bg-amber-100 text-amber-600'
                )}
              >
                {pendingTodos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === 'memo'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                : 'text-stone-500'
            )}
          >
            <span>📝</span>
            备忘录
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4">
        {activeTab === 'todo' ? (
          <TodoSection
            pendingTodos={pendingTodos}
            completedTodos={completedTodos}
            onAdd={onAddTodo}
            onToggle={onToggleTodo}
            onDelete={onDeleteTodo}
            showConfetti={showConfetti}
          />
        ) : (
          <MemoSection
            memos={memos}
            onAdd={() => setShowMemoModal(true)}
            onDelete={onDeleteMemo}
          />
        )}
      </div>

      {/* 备忘录创建弹窗 */}
      <MemoCreateModal
        open={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        onSubmit={onAddMemo}
      />
    </div>
  )
}

// TODO 部分
interface TodoSectionProps {
  pendingTodos: TodoItem[]
  completedTodos: TodoItem[]
  onAdd: (content: string) => void
  onToggle: (id: number, status: 'pending' | 'completed') => void
  onDelete: (id: number) => void
  showConfetti: () => void
}

function TodoSection({
  pendingTodos,
  completedTodos,
  onAdd,
  onToggle,
  onDelete,
  showConfetti,
}: TodoSectionProps) {
  return (
    <div className="space-y-4">
      {/* 添加输入框 */}
      <TodoInput onAdd={onAdd} />

      {/* 待办事项 */}
      {pendingTodos.length > 0 && (
        <section>
          <h3 className="text-sm text-stone-500 mb-2 flex items-center gap-2">
            <span>⏳</span> 待完成
          </h3>
          <div className="space-y-2">
            {pendingTodos.map((todo) => (
              <TodoItemCard
                key={todo.id}
                item={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                showConfetti={showConfetti}
              />
            ))}
          </div>
        </section>
      )}

      {/* 已完成 */}
      {completedTodos.length > 0 && (
        <section>
          <h3 className="text-sm text-stone-500 mb-2 flex items-center gap-2">
            <span>✅</span> 已完成
          </h3>
          <div className="space-y-2">
            {completedTodos.map((todo) => (
              <TodoItemCard
                key={todo.id}
                item={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                showConfetti={showConfetti}
              />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {pendingTodos.length === 0 && completedTodos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-stone-400">暂无待办事项</p>
          <p className="text-sm text-stone-300 mt-1">添加一个吧～</p>
        </div>
      )}
    </div>
  )
}

// 备忘录部分
interface MemoSectionProps {
  memos: Memo[]
  onAdd: () => void
  onDelete: (id: number) => void
}

function MemoSection({ memos, onAdd, onDelete }: MemoSectionProps) {
  return (
    <div>
      {/* 添加按钮 */}
      <button
        onClick={onAdd}
        className="w-full p-4 bg-white rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-pink-300 hover:text-pink-400 transition-colors mb-4"
      >
        <span className="text-lg mr-2">📝</span>
        写个备忘...
      </button>

      {/* 备忘录列表 */}
      {memos.length > 0 ? (
        <MemoGrid>
          {memos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} onDelete={onDelete} />
          ))}
        </MemoGrid>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📔</div>
          <p className="text-stone-400">暂无备忘录</p>
          <p className="text-sm text-stone-300 mt-1">记录一些美好瞬间吧～</p>
        </div>
      )}
    </div>
  )
}
