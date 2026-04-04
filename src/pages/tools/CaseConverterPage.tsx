import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="大小写转换" subtitle="多种命名风格互转" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入任意文字或变量名…"
          rows={4}
          className="w-full p-4 text-sm font-mono outline-none resize-none"
          style={{
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'
            e.target.style.borderColor = 'var(--color-primary)'
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none'
            e.target.style.borderColor = 'var(--color-border)'
          }}
        />

        <div className="flex flex-col gap-2">
          {CONVERSIONS.map(({ id, label, fn }) => {
            const result = input ? fn(input) : ''
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  backgroundColor: 'var(--color-bg-base)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{label}</p>
                  <p
                    className="text-sm font-mono truncate"
                    style={{ color: input ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                  >
                    {result || '—'}
                  </p>
                </div>
                <button
                  onClick={() => copy(id, result)}
                  disabled={!result}
                  className="shrink-0 flex items-center gap-1 text-xs active:scale-90 transition disabled:opacity-30"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {copiedId === id ? (
                    <Check className="size-4" style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
