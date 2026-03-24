import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = '搜索工具…',
  className,
}: SearchBarProps) {
  // 本地显示值，给输入法合成期间提供缓冲，避免拼音字母写入搜索结果
  const [localValue, setLocalValue] = useState(value)
  const isComposing = useRef(false)

  // 外部清空时同步本地值（例如点击"清空筛选"）
  useEffect(() => {
    if (value === '') setLocalValue('')
  }, [value])

  const commit = (val: string) => {
    onChange(val)
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 size-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={localValue}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 rounded-xl bg-gray-100 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
        // 输入法合成开始（拼音打字期间）
        onCompositionStart={() => {
          isComposing.current = true
        }}
        // 输入法合成结束（选字完成）→ 立即提交
        onCompositionEnd={(e) => {
          isComposing.current = false
          const val = (e.target as HTMLInputElement).value
          setLocalValue(val)
          commit(val)
        }}
        // 普通字符实时更新本地值；非合成状态下直接提交
        onChange={(e) => {
          setLocalValue(e.target.value)
          if (!isComposing.current) {
            commit(e.target.value)
          }
        }}
        // 回车确认
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isComposing.current) {
            commit(localValue)
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        // 失焦时提交（切换 Tab / 点击其他区域）
        onBlur={() => {
          if (!isComposing.current) {
            commit(localValue)
          }
        }}
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('')
            commit('')
          }}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
          aria-label="清空搜索"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
