import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const encode = (s: string) => { try { return encodeURIComponent(s) } catch { return '编码失败' } }
const decode = (s: string) => { try { return decodeURIComponent(s) } catch { return '解码失败，请检查输入' } }

export function UrlEncodePage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => setOutput(mode === 'encode' ? encode(input) : decode(input))
  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <main className="h-full overflow-auto px-4 py-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div
          className="flex gap-2 p-1"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {(['encode', 'decode'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setOutput('') }}
              className="flex-1 py-2 text-xs font-semibold transition"
              style={{
                borderRadius: 'var(--radius-sm)',
                backgroundColor: mode === m ? 'var(--color-bg-base)' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {m === 'encode' ? '编码' : '解码'}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setOutput('') }}
          placeholder={mode === 'encode' ? '输入原始文本或 URL…' : '输入 URL 编码字符串…'}
          rows={5}
          className="w-full p-3 text-xs font-mono outline-none resize-none"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none'
          }}
        />

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
          {mode === 'encode' ? '编码' : '解码'}
        </button>

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
                className="flex items-center gap-1 text-xs active:scale-90"
                style={{ color: 'var(--color-primary)' }}
              >
                {copied ? (
                  <Check className="size-3.5" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              rows={5}
              className="w-full p-3 text-xs font-mono outline-none resize-none"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        )}
    </main>
  )
}
