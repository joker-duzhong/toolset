// ────────────────────────────────────────────────
// 影视大全 - 搜索栏组件
// ────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface MovieSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
  initialValue?: string
}

export function MovieSearchBar({
  onSearch,
  placeholder = '搜索电影、电视剧、动漫...',
  autoFocus = false,
  initialValue = '',
}: MovieSearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleChange = (v: string) => {
    setValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(v), 400)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 lg:size-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl bg-gray-100 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 text-sm lg:text-base outline-none transition placeholder:text-gray-400"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center transition"
        >
          <X className="size-3" />
        </button>
      )}
    </form>
  )
}
