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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="JSON 格式化" subtitle="格式化 / 压缩 / 校验" />

      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* 模式切换 */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          {(['format', 'minify'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {m === 'format' ? '格式化' : '压缩'}
            </button>
          ))}
        </div>

        {/* 输入 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">输入 JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            rows={8}
            className="w-full p-3 rounded-xl bg-white border border-gray-200 text-xs font-mono text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
            ❌ {error}
          </p>
        )}

        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="w-full py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition"
        >
          {mode === 'format' ? '格式化' : '压缩'}
        </button>

        {/* 输出 */}
        {output && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">结果</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-indigo-500 active:scale-90 transition"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className="w-full p-3 rounded-xl bg-gray-900 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
