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
      <Search
        className="absolute left-3 size-4 pointer-events-none"
        style={{ color: 'var(--color-text-tertiary)' }}
      />
      <input
        type="search"
        value={localValue}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 text-sm outline-none transition"
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-primary)',
        }}
        // 自定义placeholder样式
        onFocus={(e) => {
          e.target.style.backgroundColor = 'var(--color-bg-base)'
          e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = 'var(--color-bg-tertiary)'
          e.target.style.boxShadow = 'none'
        }}
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
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('')
            commit('')
          }}
          className="absolute right-3 transition"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label="清空搜索"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
