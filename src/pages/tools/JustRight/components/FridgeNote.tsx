// 冰箱贴留言组件
import { useState, useRef, useEffect } from 'react'
import { Edit3 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FridgeNoteProps {
  content: string
  author?: string
  onChange?: (content: string) => void
  readOnly?: boolean
}

// 温馨的便签颜色
const noteColors = [
  'from-amber-50 to-yellow-100',
  'from-pink-50 to-rose-100',
  'from-sky-50 to-blue-100',
  'from-mint-50 to-emerald-100',
  'from-violet-50 to-purple-100',
]

export function FridgeNote({ content, author, onChange, readOnly }: FridgeNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const colorIndex = Math.abs((author || '').charCodeAt(0) || 0) % noteColors.length

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (onChange && value !== content) {
      onChange(value)
    }
  }

  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl bg-gradient-to-br shadow-md transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300',
        noteColors[colorIndex]
      )}
    >
      {/* 图钉装饰 */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md" />
      </div>

      {/* 内容区域 */}
      {isEditing && !readOnly ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="写点什么..."
          className="w-full min-h-[80px] bg-transparent text-stone-700 placeholder-stone-400 resize-none focus:outline-none text-sm leading-relaxed"
        />
      ) : (
        <div
          onClick={() => !readOnly && setIsEditing(true)}
          className={cn(
            'min-h-[60px] text-stone-700 text-sm leading-relaxed whitespace-pre-wrap',
            !readOnly && 'cursor-pointer hover:bg-white/20 rounded-lg p-1 -m-1'
          )}
        >
          {content || (
            <span className="text-stone-400 flex items-center gap-1">
              <Edit3 size={14} />
              点击写留言...
            </span>
          )}
        </div>
      )}

      {/* 作者 */}
      {author && (
        <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs text-stone-500">
          <span>💌 {author}</span>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-full hover:bg-black/5"
            >
              <Edit3 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// 冰箱贴容器 - 模拟冰箱门效果
export function FridgeBoard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-6 shadow-inner">
      {/* 冰箱纹理 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_51%,transparent_52%)] bg-[length:20px_20px]" />
      </div>

      {/* 标题 */}
      <div className="relative flex items-center gap-2 mb-4">
        <span className="text-xl">🧊</span>
        <h3 className="font-medium text-stone-600">冰箱贴留言</h3>
      </div>

      {/* 便签区域 */}
      <div className="relative grid gap-4">{children}</div>
    </div>
  )
}
