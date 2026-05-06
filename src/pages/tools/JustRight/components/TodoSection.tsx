import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TodoItem } from '../types'
import { cn } from '@/utils/cn'

interface TodoSectionProps {
  todos: TodoItem[]
  onAdd: (content: string) => void
  onToggle: (id: string, status: 'pending' | 'completed') => void
  onDelete?: (id: string) => void
}

export function TodoSection({ todos, onAdd, onToggle }: TodoSectionProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  // 排序：未完成在前，已完成在后
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.status === b.status) return 0
    return a.status === 'pending' ? -1 : 1
  })

  return (
    <div className="space-y-5">
      {/* 待办输入框 */}
      <div className="relative flex items-center bg-white rounded-full p-1.5 shadow-[0_2px_10px_rgba(255,171,132,0.05)] border border-[#FFF0E6]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="输入待办，回车或点击添加"
          className="flex-1 bg-transparent px-4 py-2 text-[15px] text-[#4A4036] placeholder:text-[#D4C9C1] outline-none"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center w-10 h-10 mr-1 rounded-full text-[#FFAB84] hover:bg-[#FFF0E6] transition-colors"
        >
          {/* 还原设计图的加号 SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 待办列表容器 (白底大卡片) */}
      <div className="bg-white rounded-[2rem] p-2 shadow-[0_4px_20px_rgba(255,171,132,0.04)] border border-[#FFF0E6]/50">
        <div className="flex flex-col">
          <AnimatePresence>
            {sortedTodos.map((todo) => {
              const isCompleted = todo.status === 'completed'
              return (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center justify-between p-4 border-b border-[#FFF9F5] last:border-0"
                >
                  <button
                    onClick={() => onToggle(todo.id, isCompleted ? 'pending' : 'completed')}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {/* SVG Checkbox 完美还原 */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="11" cy="11" r="11" fill="#FFAB84"/>
                          <path d="M7 11.5L9.5 14L15 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="20" height="20" rx="5" stroke="#DCD3CC" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>
                    
                    <span className={cn(
                      "text-[15px] transition-colors",
                      isCompleted ? "text-[#BFAEA3] line-through decoration-[#EADCD3]" : "text-[#4A4036]"
                    )}>
                      {todo.content}
                    </span>
                  </button>

                  {/* 还原设计图右侧的头像占位 - 这里你可以替换成实际的头像 img */}
                  <div className="w-7 h-7 rounded-full bg-[#FFF0E6] border-2 border-white flex-shrink-0 overflow-hidden ml-3 shadow-sm flex items-center justify-center text-[10px] text-[#FFAB84]">
                    Ta
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {todos.length === 0 && (
             <div className="py-10 text-center text-[#D4C9C1] text-sm">
                开启今天的第一件待办吧 ✨
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
