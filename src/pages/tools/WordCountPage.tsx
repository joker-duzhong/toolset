import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'

interface Stats {
  chars: number
  charsNoSpace: number
  words: number
  lines: number
  paragraphs: number
  readTime: string
}

function analyze(text: string): Stats {
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const lines = text === '' ? 0 : text.split('\n').length
  const paragraphs = text.trim() === '' ? 0 : text.trim().split(/\n\s*\n+/).length
  const minutes = Math.ceil(charsNoSpace / 400) // 中文阅读速度约 400 字/分钟
  const readTime = minutes < 1 ? '< 1 分钟' : `约 ${minutes} 分钟`
  return { chars, charsNoSpace, words, lines, paragraphs, readTime }
}

const ITEMS = [
  { key: 'chars', label: '总字符数（含空格）' },
  { key: 'charsNoSpace', label: '字符数（不含空格）' },
  { key: 'words', label: '单词 / 词组数' },
  { key: 'lines', label: '行数' },
  { key: 'paragraphs', label: '段落数' },
  { key: 'readTime', label: '预计阅读时间' },
] as const

export function WordCountPage() {
  const [text, setText] = useState('')
  const stats = analyze(text)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="字数统计" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="在此粘贴或输入文章内容…"
          rows={10}
          className="w-full p-4 text-sm outline-none resize-none"
          style={{
            borderRadius: 'var(--radius-lg)',
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

        <div className="grid grid-cols-2 gap-3">
          {ITEMS.map(item => (
            <div
              key={item.key}
              className="flex flex-col gap-0.5 p-3.5"
              style={{
                backgroundColor: 'var(--color-bg-base)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {item.label}
              </p>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {typeof stats[item.key] === 'number' ? stats[item.key].toLocaleString() : stats[item.key]}
              </p>
            </div>
          ))}
        </div>

        {text && (
          <button
            onClick={() => setText('')}
            className="w-full py-3 text-sm active:scale-95 transition"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            清空
          </button>
        )}
      </main>
    </div>
  )
}
