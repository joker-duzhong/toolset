import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'

interface DiffLine {
  type: 'equal' | 'add' | 'remove'
  text: string
}

function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  const m = linesA.length
  const n = linesB.length

  // LCS dp
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])

  const result: DiffLine[] = []
  let i = 0, j = 0
  while (i < m || j < n) {
    if (i < m && j < n && linesA[i] === linesB[j]) {
      result.push({ type: 'equal', text: linesA[i++] })
      j++
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: 'add', text: linesB[j++] })
    } else {
      result.push({ type: 'remove', text: linesA[i++] })
    }
  }
  return result
}

export function TextDiffPage() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [diff, setDiff] = useState<DiffLine[] | null>(null)

  const addCount = diff?.filter(d => d.type === 'add').length ?? 0
  const removeCount = diff?.filter(d => d.type === 'remove').length ?? 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="文本对比" subtitle="逐行高亮差异" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              原文本
            </label>
            <textarea
              value={left}
              onChange={e => { setLeft(e.target.value); setDiff(null) }}
              rows={8}
              placeholder="粘贴原始内容…"
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
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              新文本
            </label>
            <textarea
              value={right}
              onChange={e => { setRight(e.target.value); setDiff(null) }}
              rows={8}
              placeholder="粘贴修改后内容…"
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
          </div>
        </div>

        <button
          onClick={() => setDiff(diffLines(left, right))}
          disabled={!left && !right}
          className="w-full py-3 text-sm font-semibold active:scale-95 transition disabled:active:scale-100"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: !left && !right ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          对比
        </button>

        {diff && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 text-xs">
              <span
                className="px-2 py-1 font-medium"
                style={{
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#E8F5E9',
                  color: '#388E3C',
                }}
              >
                +{addCount} 行新增
              </span>
              <span
                className="px-2 py-1 font-medium"
                style={{
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#FFEBEE',
                  color: '#D32F2F',
                }}
              >
                -{removeCount} 行删除
              </span>
            </div>
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              {diff.map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-1.5 text-xs font-mono"
                  style={{
                    backgroundColor:
                      line.type === 'add' ? '#E8F5E9' :
                      line.type === 'remove' ? '#FFEBEE' :
                      'var(--color-bg-base)',
                    color:
                      line.type === 'add' ? '#2E7D32' :
                      line.type === 'remove' ? '#C62828' :
                      'var(--color-text-secondary)',
                  }}
                >
                  <span className="shrink-0 w-4 text-center opacity-60">
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                  </span>
                  <span className="break-all whitespace-pre-wrap">{line.text || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
