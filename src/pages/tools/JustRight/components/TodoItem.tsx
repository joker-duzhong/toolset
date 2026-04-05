import { useState } from 'react'
import { Check, Trash2, Sparkles, Plus, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { TodoItem } from '../types'

// --- TodoItemCard: 每一行任务 ---
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
      // 模拟一点延迟，增强勾选的“分量感”
      setTimeout(() => {
        onToggle(item.id, 'completed')
        showConfetti?.()
        setIsChecking(false)
      }, 400)
    } else {
      onToggle(item.id, 'pending')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-[1.25rem] transition-all duration-300',
        'bg-white border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-100',
        isCompleted && 'bg-stone-50/80 border-transparent shadow-none'
      )}
    >
      {/* 自定义复选框 */}
      <button
        onClick={handleCheck}
        disabled={isChecking}
        className={cn(
          'relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden',
          isCompleted 
            ? 'bg-amber-400 text-white rotate-[360deg]' 
            : 'bg-stone-50 border-2 border-stone-200 hover:border-amber-300 text-transparent'
        )}
      >
        <AnimatePresence mode="wait">
          {isChecking ? (
            <motion.div
              key="checking"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Sparkles size={14} className="text-amber-500 animate-spin" />
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              <Check size={16} strokeWidth={4} />
            </motion.div>
          ) : (
            <Circle size={12} className="text-stone-300 group-hover:text-amber-300" />
          )}
        </AnimatePresence>
      </button>

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'block text-[15px] font-medium transition-all duration-500 truncate',
            isCompleted 
              ? 'text-stone-400 line-through decoration-stone-300/80 decoration-2' 
              : 'text-stone-700'
          )}
        >
          {item.content}
        </span>
        {isCompleted && (
          <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider">
            Completed
          </span>
        )}
      </div>

      {/* 删除按钮 - 默认半透明，Hover显现 */}
      <button
        onClick={() => onDelete(item.id)}
        className="p-2 text-stone-300 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all duration-200"
      >
        <Trash2 size={18} />
      </button>
    </motion.div>
  )
}

// --- TodoInput: 添加输入框 ---
interface TodoInputProps {
  onAdd: (content: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative flex items-center p-1.5 transition-all duration-500 bg-white border rounded-[1.5rem]",
        isFocused 
          ? "border-amber-300 shadow-lg shadow-amber-100/50 ring-4 ring-amber-50/50" 
          : "border-stone-200 shadow-sm"
      )}
    >
      <div className="pl-4 text-amber-400">
        <Plus size={20} strokeWidth={3} />
      </div>
      
      <input
        type="text"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setValue(e.target.value)}
        placeholder="写下你要做的小事..."
        className="flex-1 px-3 py-3 bg-transparent text-stone-700 placeholder:text-stone-300 outline-none font-medium"
      />
      
      <button
        type="submit"
        disabled={!value.trim()}
        className={cn(
          "px-6 py-3 rounded-[1.1rem] font-bold text-sm transition-all duration-300",
          value.trim() 
            ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md hover:scale-105 active:scale-95" 
            : "bg-stone-100 text-stone-400"
        )}
      >
        添加
      </button>
    </form>
  )
}
