import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

const toBase64 = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch {
    return '编码失败，请检查输入'
  }
}

const fromBase64 = (str: string) => {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch {
    return '解码失败，请检查是否为合法 Base64'
  }
}

export function Base64Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    setOutput(mode === 'encode' ? toBase64(input) : fromBase64(input))
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
      <PageHeader title="Base64 编解码" />

      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          {(['encode', 'decode'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {m === 'encode' ? '编码' : '解码'}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '输入文本…' : '输入 Base64 字符串…'}
          rows={6}
          className="w-full p-3 rounded-xl bg-white border border-gray-200 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />

        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="w-full py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition"
        >
          {mode === 'encode' ? '编码' : '解码'}
        </button>

        {output && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">结果</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-indigo-500"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              rows={5}
              className="w-full p-3 rounded-xl bg-gray-100 text-xs font-mono text-gray-700 outline-none resize-none"
            />
          </div>
        )}
      </main>
    </div>
  )
}
