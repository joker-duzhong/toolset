// TODO 项组件
import { useState } from 'react'
import { Check, Trash2, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { TodoItem } from '../types'

interface TodoItemProps {
  item: TodoItem
  onToggle: (id: number, status: 'pending' | 'completed') => void
  onDelete: (id: number) => void
  showConfetti?: () => void
}

export function TodoItemCard({ item, onToggle, onDelete, showConfetti }: TodoItemProps) {
  const [isChecking, setIsChecking] = useState(false)
  const isCompleted = item.status === 'completed'

  const handleCheck = () => {
    if (!isCompleted) {
      setIsChecking(true)
      setTimeout(() => {
        onToggle(item.id, 'completed')
        showConfetti?.()
        setIsChecking(false)
      }, 300)
    } else {
      onToggle(item.id, 'pending')
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-stone-100 transition-all duration-300',
        isCompleted && 'bg-stone-50 border-stone-200',
        isChecking && 'scale-105 bg-amber-50 border-amber-200'
      )}
    >
      {/* 复选框 */}
      <button
        onClick={handleCheck}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
          isCompleted
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-white'
            : 'border-stone-300 hover:border-amber-400'
        )}
      >
        {isCompleted && <Check size={14} strokeWidth={3} />}
        {isChecking && <Sparkles size={14} className="text-amber-600 animate-pulse" />}
      </button>

      {/* 内容 */}
      <span
        className={cn(
          'flex-1 text-stone-700 transition-all duration-300',
          isCompleted && 'line-through text-stone-400'
        )}
      >
        {item.content}
      </span>

      {/* 删除按钮 */}
      <button
        onClick={() => onDelete(item.id)}
        className="p-2 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

// TODO 添加输入框
interface TodoInputProps {
  onAdd: (content: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="添加新任务..."
        className="flex-1 px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
      >
        添加
      </button>
    </form>
  )
}
