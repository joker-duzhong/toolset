import { useState } from 'react'

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
    <main className="h-full overflow-auto px-4 py-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* 正则输入 */}
        <div
          className="flex flex-col gap-2 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            正则表达式
          </label>
          <div
            className="flex items-center gap-2 h-10 px-3 font-mono text-sm"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
            }}
          >
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="pattern"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{flags || '—'}</span>
          </div>
          {error && (
            <p style={{ color: '#D32F2F', fontSize: '12px' }}>❌ {error}</p>
          )}

          {/* 修饰符 */}
          <div className="flex gap-2 flex-wrap">
            {ALL_FLAGS.map(f => (
              <button
                key={f}
                onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)}
                className="px-3 py-1 text-xs font-mono font-bold transition"
                style={{
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: flags.includes(f) ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                  color: flags.includes(f) ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                }}
              >
                {f}
              </button>
            ))}
            <span
              className="text-[10px] self-center"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              g=全局 i=忽略大小写 m=多行 s=点匹配换行
            </span>
          </div>
        </div>

        {/* 测试文本 */}
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            测试文本
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
            placeholder="输入要测试的文本…"
            className="w-full p-3 text-sm font-mono outline-none resize-none"
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
        </div>

        {/* 匹配统计 */}
        {text && pattern && !error && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: matches.length > 0 ? 'var(--color-primary-light)' : 'var(--color-bg-tertiary)',
              color: matches.length > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {matches.length > 0 ? `✅ 匹配 ${matches.length} 处` : '⭕ 无匹配'}
          </div>
        )}

        {/* 高亮结果 */}
        {segments.length > 0 && (
          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
            }}
          >
            <p
              className="text-xs font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              匹配高亮
            </p>
            <p className="text-sm font-mono leading-relaxed break-all whitespace-pre-wrap">
              {segments.map((seg, i) =>
                seg.highlight ? (
                  <mark
                    key={i}
                    className="px-0.5 rounded"
                    style={{ backgroundColor: '#FFECB3', color: '#5D4037' }}
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i} style={{ color: 'var(--color-text-primary)' }}>{seg.text}</span>
                )
              )}
            </p>
          </div>
        )}

        {/* 匹配列表 */}
        {matches.length > 0 && (
          <div className="flex flex-col gap-2">
            <p
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              匹配详情
            </p>
            {matches.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5"
                style={{
                  backgroundColor: 'var(--color-bg-base)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                <span
                  className="text-[10px] w-6"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  #{i + 1}
                </span>
                <code
                  className="flex-1 text-xs font-mono px-2 py-1"
                  style={{
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {m.text}
                </code>
                <span
                  className="text-[10px]"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  [{m.index}, {m.end})
                </span>
              </div>
            ))}
          </div>
        )}
    </main>
  )
}
