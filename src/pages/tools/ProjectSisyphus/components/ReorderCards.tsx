import { useState } from 'react'
import { cn } from '@/utils/cn'

interface ReorderCardsProps {
  words: string[]
  onSubmit: (ordered: string) => void
  disabled?: boolean
}

export function ReorderCards({ words, onSubmit, disabled }: ReorderCardsProps) {
  const [ordered, setOrdered] = useState<string[]>([...words])

  const moveWord = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= ordered.length) return
    const next = [...ordered]
    ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
    setOrdered(next)
  }

  const moveToEnd = (fromIndex: number, direction: 'left' | 'right') => {
    const next = [...ordered]
    const [item] = next.splice(fromIndex, 1)
    if (direction === 'left') {
      next.unshift(item)
    } else {
      next.push(item)
    }
    setOrdered(next)
  }

  const handleSubmit = () => {
    onSubmit(ordered.join(' '))
  }

  return (
    <div className="px-4 py-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs text-gray-400 mb-3">点击箭头调整单词顺序</p>

        {/* 卡片列表 */}
        <div className="flex flex-col gap-2">
          {ordered.map((word, idx) => (
            <div key={`${word}-${idx}`} className="flex items-center gap-1.5">
              {/* 左移按钮 */}
              <button
                onClick={() => moveWord(idx, 'left')}
                disabled={disabled || idx === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
                </svg>
              </button>

              {/* 序号 + 单词卡片 */}
              <div
                className={cn(
                  'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition',
                  'bg-gray-50 border-gray-200 text-sm font-medium text-gray-700',
                )}
              >
                <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
                <span>{word}</span>
              </div>

              {/* 右移按钮 */}
              <button
                onClick={() => moveWord(idx, 'right')}
                disabled={disabled || idx === ordered.length - 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                </svg>
              </button>

              {/* 快速移到首尾 */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveToEnd(idx, 'left')}
                  disabled={disabled || idx === 0}
                  className="text-[9px] text-gray-300 hover:text-gray-500 transition disabled:opacity-20"
                  title="移到最前"
                >
                  ⤒
                </button>
                <button
                  onClick={() => moveToEnd(idx, 'right')}
                  disabled={disabled || idx === ordered.length - 1}
                  className="text-[9px] text-gray-300 hover:text-gray-500 transition disabled:opacity-20"
                  title="移到最后"
                >
                  ⤓
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 提交 */}
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400"
        >
          提交排序
        </button>
      </div>
    </div>
  )
}
