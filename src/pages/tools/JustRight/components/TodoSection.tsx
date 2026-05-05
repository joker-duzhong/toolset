// 待办区域组件
import { AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { TodoItem } from '../types'
import { TodoItemCard, TodoInput } from './TodoItem'

interface TodoSectionProps {
  todos: TodoItem[]
  onAdd: (content: string) => void
  onToggle: (id: string, status: 'pending' | 'completed') => void
  onDelete: (id: string) => void
}

export function TodoSection({ todos, onAdd, onToggle, onDelete }: TodoSectionProps) {
  const pendingTodos = todos.filter((t) => t.status === 'pending')
  const completedTodos = todos.filter((t) => t.status === 'completed')

  return (
    <div className="space-y-6">
      {/* 输入框 */}
      <TodoInput onAdd={onAdd} />

      {/* 待办列表 */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-lg">✨</span>
          <h3 className="text-sm font-bold text-stone-700">待办事项</h3>
          <span className="text-xs text-stone-400">({pendingTodos.length})</span>
        </div>

        {pendingTodos.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-stone-100">
            <CheckCircle2 size={32} className="mx-auto text-stone-300 mb-2" />
            <p className="text-stone-400 text-sm">暂无待办事项</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {pendingTodos.map((todo) => (
                <TodoItemCard
                  key={todo.id}
                  item={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 已完成列表 */}
      {completedTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <h3 className="text-sm font-bold text-stone-700">已完成</h3>
            <span className="text-xs text-stone-400">({completedTodos.length})</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {completedTodos.map((todo) => (
                <TodoItemCard
                  key={todo.id}
                  item={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
