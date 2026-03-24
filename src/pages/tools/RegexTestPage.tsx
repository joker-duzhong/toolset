import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

interface Match {
  index: number
  end: number
  text: string
}

export function RegexTestPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  let matches: Match[] = []
  if (pattern && text) {
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      setError('')
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        matches.push({ index: m.index, end: m.index + m[0].length, text: m[0] })
        if (!flags.includes('g')) break
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }

  // 构建高亮段落
  const segments: { text: string; highlight: boolean }[] = []
  if (matches.length > 0) {
    let cursor = 0
    for (const m of matches) {
      if (cursor < m.index) segments.push({ text: text.slice(cursor, m.index), highlight: false })
      segments.push({ text: m.text, highlight: true })
      cursor = m.end
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor), highlight: false })
  }

  const ALL_FLAGS = ['g', 'i', 'm', 's']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="正则表达式测试" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* 正则输入 */}
        <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <label className="text-xs font-medium text-gray-500">正则表达式</label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-gray-100 font-mono text-sm">
            <span className="text-gray-400">/</span>
            <input value={pattern} onChange={e => setPattern(e.target.value)}
              placeholder="pattern"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-300" />
            <span className="text-gray-400">/</span>
            <span className="text-indigo-600 font-bold">{flags || '—'}</span>
          </div>
          {error && <p className="text-xs text-rose-500">❌ {error}</p>}

          {/* 修饰符 */}
          <div className="flex gap-2 flex-wrap">
            {ALL_FLAGS.map(f => (
              <button key={f} onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-mono font-bold transition',
                  flags.includes(f) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500',
                )}>
                {f}
              </button>
            ))}
            <span className="text-[10px] text-gray-400 self-center">g=全局 i=忽略大小写 m=多行 s=点匹配换行</span>
          </div>
        </div>

        {/* 测试文本 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">测试文本</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
            placeholder="输入要测试的文本…"
            className="w-full p-3 rounded-xl bg-white border border-gray-200 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        </div>

        {/* 匹配统计 */}
        {text && pattern && !error && (
          <div className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
            matches.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500',
          )}>
            {matches.length > 0 ? `✅ 匹配 ${matches.length} 处` : '⭕ 无匹配'}
          </div>
        )}

        {/* 高亮结果 */}
        {segments.length > 0 && (
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-2">匹配高亮</p>
            <p className="text-sm font-mono leading-relaxed break-all whitespace-pre-wrap">
              {segments.map((seg, i) =>
                seg.highlight
                  ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{seg.text}</mark>
                  : <span key={i} className="text-gray-700">{seg.text}</span>
              )}
            </p>
          </div>
        )}

        {/* 匹配列表 */}
        {matches.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-500">匹配详情</p>
            {matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 w-6">#{i + 1}</span>
                <code className="flex-1 text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{m.text}</code>
                <span className="text-[10px] text-gray-400">[{m.index}, {m.end})</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
