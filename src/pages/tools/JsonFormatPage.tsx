import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

export function JsonFormatPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'format' | 'minify'>('format')

  const handleConvert = () => {
    setError('')
    try {
      const parsed = JSON.parse(input)
      const result =
        mode === 'format'
          ? JSON.stringify(parsed, null, 2)
          : JSON.stringify(parsed)
      setOutput(result)
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="JSON 格式化" subtitle="格式化 / 压缩 / 校验" />

      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* 模式切换 */}
        <div
          className="flex gap-2 p-1"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {(['format', 'minify'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 text-xs font-semibold transition"
              style={{
                borderRadius: 'var(--radius-sm)',
                backgroundColor: mode === m ? 'var(--color-bg-base)' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {m === 'format' ? '格式化' : '压缩'}
            </button>
          ))}
        </div>

        {/* 输入 */}
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            输入 JSON
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            rows={8}
            className="w-full p-3 text-xs font-mono outline-none resize-none"
            style={{
              borderRadius: 'var(--radius-md)',
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
        </div>

        {error && (
          <p
            className="text-xs px-3 py-2"
            style={{
              color: '#D32F2F',
              backgroundColor: '#FFEBEE',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            ❌ {error}
          </p>
        )}

        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="w-full py-3 text-sm font-semibold active:scale-95 transition disabled:active:scale-100"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: !input.trim() ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          {mode === 'format' ? '格式化' : '压缩'}
        </button>

        {/* 输出 */}
        {output && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                结果
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs active:scale-90 transition"
                style={{ color: 'var(--color-primary)' }}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre
              className="w-full p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#1E1E1E',
                color: '#0d99ff',
              }}
            >
              {output}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
