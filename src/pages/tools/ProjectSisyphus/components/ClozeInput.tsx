import { useState } from 'react'

interface ClozeInputProps {
  /** 原始模板，例如 "I ___ never ___ there." */
  template: string
  onSubmit: (filled: string) => void
  disabled?: boolean
}

/**
 * 解析模板字符串，把 ___ 或下划线连续部分识别为填空位
 * 返回分段数组，交替为 { type: 'text' } 和 { type: 'blank', index }
 */
function parseTemplate(template: string) {
  const parts: ({ type: 'text'; value: string } | { type: 'blank'; index: number })[] = []
  const regex = /(_{2,})/g
  let lastIndex = 0
  let blankIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: template.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'blank', index: blankIndex++ })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < template.length) {
    parts.push({ type: 'text', value: template.slice(lastIndex) })
  }
  return { parts, blankCount: blankIndex }
}

export function ClozeInput({ template, onSubmit, disabled }: ClozeInputProps) {
  const { parts, blankCount } = parseTemplate(template)
  const [values, setValues] = useState<string[]>(() => Array(blankCount).fill(''))

  const handleChange = (idx: number, val: string) => {
    setValues((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  const handleSubmit = () => {
    // 将填空值拼入模板
    let filled = ''
    let blankIdx = 0
    for (const part of parts) {
      if (part.type === 'text') {
        filled += part.value
      } else {
        filled += values[blankIdx] || '___'
        blankIdx++
      }
    }
    onSubmit(filled.trim())
  }

  const allFilled = values.every((v) => v.trim() !== '')

  return (
    <div className="px-4 py-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* 填空区域 */}
        <div className="text-sm leading-loose flex flex-wrap items-center gap-0.5">
          {parts.map((part, i) => {
            if (part.type === 'text') {
              return (
                <span key={i} className="text-gray-700">
                  {part.value}
                </span>
              )
            }
            return (
              <input
                key={i}
                type="text"
                value={values[part.index]}
                onChange={(e) => handleChange(part.index, e.target.value)}
                disabled={disabled}
                className="inline-block w-20 h-7 text-center text-sm border-b-2 border-indigo-400 bg-indigo-50 outline-none focus:border-indigo-600 transition rounded-t"
                placeholder="___"
              />
            )
          })}
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={disabled || !allFilled}
          className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition disabled:bg-gray-200 disabled:text-gray-400"
        >
          提交答案
        </button>
      </div>
    </div>
  )
}
