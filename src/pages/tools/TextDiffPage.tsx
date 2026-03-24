import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="文本对比" subtitle="逐行高亮差异" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">原文本</label>
            <textarea
              value={left} onChange={e => { setLeft(e.target.value); setDiff(null) }}
              rows={8} placeholder="粘贴原始内容…"
              className="w-full p-3 rounded-xl bg-white border border-gray-200 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">新文本</label>
            <textarea
              value={right} onChange={e => { setRight(e.target.value); setDiff(null) }}
              rows={8} placeholder="粘贴修改后内容…"
              className="w-full p-3 rounded-xl bg-white border border-gray-200 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        </div>

        <button
          onClick={() => setDiff(diffLines(left, right))}
          disabled={!left && !right}
          className="w-full py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition"
        >
          对比
        </button>

        {diff && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">+{addCount} 行新增</span>
              <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">-{removeCount} 行删除</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {diff.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-2 px-3 py-1.5 text-xs font-mono',
                    line.type === 'add' && 'bg-emerald-50 text-emerald-800',
                    line.type === 'remove' && 'bg-rose-50 text-rose-800',
                    line.type === 'equal' && 'bg-white text-gray-600',
                  )}
                >
                  <span className="flex-shrink-0 w-4 text-center opacity-60">
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
