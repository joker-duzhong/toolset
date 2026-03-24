import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

// ── 转换函数 ────────────────────────────────────
const toUpperCase = (s: string) => s.toUpperCase()
const toLowerCase = (s: string) => s.toLowerCase()
const toTitleCase = (s: string) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
const toCamelCase = (s: string) =>
  s
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase())
const toPascalCase = (s: string) =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (c) => c.toUpperCase())
const toSnakeCase = (s: string) =>
  s
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .replace(/^_/, '')
    .toLowerCase()
const toKebabCase = (s: string) =>
  s
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase()
const toConstantCase = (s: string) => toSnakeCase(s).toUpperCase()

const CONVERSIONS = [
  { id: 'upper', label: 'UPPER CASE', fn: toUpperCase },
  { id: 'lower', label: 'lower case', fn: toLowerCase },
  { id: 'title', label: 'Title Case', fn: toTitleCase },
  { id: 'camel', label: 'camelCase', fn: toCamelCase },
  { id: 'pascal', label: 'PascalCase', fn: toPascalCase },
  { id: 'snake', label: 'snake_case', fn: toSnakeCase },
  { id: 'kebab', label: 'kebab-case', fn: toKebabCase },
  { id: 'constant', label: 'CONSTANT_CASE', fn: toConstantCase },
]

export function CaseConverterPage() {
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="大小写转换" subtitle="多种命名风格互转" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入任意文字或变量名…"
          rows={4}
          className="w-full p-4 rounded-2xl bg-white border border-gray-200 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-sm"
        />

        <div className="flex flex-col gap-2">
          {CONVERSIONS.map(({ id, label, fn }) => {
            const result = input ? fn(input) : ''
            return (
              <div key={id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                  <p className={cn('text-sm font-mono truncate', input ? 'text-gray-800' : 'text-gray-300')}>
                    {result || '—'}
                  </p>
                </div>
                <button
                  onClick={() => copy(id, result)}
                  disabled={!result}
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-indigo-500 disabled:opacity-30 active:scale-90 transition"
                >
                  {copiedId === id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
