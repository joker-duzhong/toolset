import { useState, useEffect } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

const ZONES = [
  { label: '本地时间', offset: null },
  { label: 'UTC+0', offset: 0 },
  { label: 'UTC+8（北京）', offset: 8 },
]

function pad(n: number) { return String(n).padStart(2, '0') }

function formatDate(d: Date, offsetHours: number | null) {
  const date = offsetHours === null ? d : new Date(d.getTime() + offsetHours * 3600000 - d.getTimezoneOffset() * 60000)
  const Y = date.getFullYear(), M = date.getMonth() + 1, D = date.getDate()
  const h = date.getHours(), m = date.getMinutes(), s = date.getSeconds()
  return `${Y}-${pad(M)}-${pad(D)} ${pad(h)}:${pad(m)}:${pad(s)}`
}

export function TimestampPage() {
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [tsResult, setTsResult] = useState<{ ms: number; s: number } | null>(null)
  const [dateResult, setDateResult] = useState<Date | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [nowTs, setNowTs] = useState(Math.floor(Date.now() / 1000))

  // 每秒更新当前时间戳
  useEffect(() => {
    const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const handleTsConvert = () => {
    const raw = tsInput.trim()
    if (!raw) return
    const n = parseInt(raw)
    if (isNaN(n)) return
    // 自动判断秒/毫秒
    const ms = raw.length >= 13 ? n : n * 1000
    setDateResult(new Date(ms))
    setTsResult({ ms, s: Math.floor(ms / 1000) })
  }

  const handleDateConvert = () => {
    if (!dateInput) return
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return
    setTsResult({ ms: d.getTime(), s: Math.floor(d.getTime() / 1000) })
    setDateResult(d)
  }

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id); setTimeout(() => setCopied(null), 1800)
    })
  }

  const CopyBtn = ({ id, text }: { id: string; text: string }) => (
    <button onClick={() => copy(id, text)} className="active:scale-90 transition">
      {copied === id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 text-gray-400" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="时间戳转换" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-5">

        {/* 当前时间戳 */}
        <div className="flex items-center justify-between p-4 bg-indigo-600 rounded-2xl text-white">
          <div>
            <p className="text-xs opacity-70">当前 Unix 时间戳（秒）</p>
            <p className="text-2xl font-bold tabular-nums mt-0.5">{nowTs}</p>
          </div>
          <button onClick={() => copy('now', String(nowTs))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 text-xs font-medium active:scale-95 transition">
            {copied === 'now' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            复制
          </button>
        </div>

        {/* 时间戳 → 日期 */}
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-600">时间戳 → 日期</p>
          <div className="flex gap-2">
            <input value={tsInput} onChange={e => { setTsInput(e.target.value); setDateResult(null); setTsResult(null) }}
              placeholder="输入时间戳（秒或毫秒）"
              className="flex-1 h-10 px-3 rounded-xl bg-gray-100 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-400" />
            <button onClick={handleTsConvert}
              className="flex items-center justify-center px-4 rounded-xl bg-indigo-600 text-white active:scale-95 transition">
              <RefreshCw className="size-4" />
            </button>
          </div>
          {dateResult && tsResult && (
            <div className="flex flex-col gap-1.5">
              {ZONES.map((z) => {
                const val = formatDate(dateResult, z.offset)
                return (
                  <div key={z.label} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-[10px] text-gray-400">{z.label}</p>
                      <p className="text-sm font-mono text-gray-800">{val}</p>
                    </div>
                    <CopyBtn id={`zone-${z.label}`} text={val} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 日期 → 时间戳 */}
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-600">日期 → 时间戳</p>
          <div className="flex gap-2">
            <input type="datetime-local" value={dateInput} onChange={e => { setDateInput(e.target.value); setTsResult(null) }}
              className="flex-1 h-10 px-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
            <button onClick={handleDateConvert}
              className="flex items-center justify-center px-4 rounded-xl bg-indigo-600 text-white active:scale-95 transition">
              <RefreshCw className="size-4" />
            </button>
          </div>
          {tsResult && dateInput && (
            <div className="flex flex-col gap-1.5">
              {[
                { label: '秒级时间戳', value: String(tsResult.s) },
                { label: '毫秒级时间戳', value: String(tsResult.ms) },
              ].map(({ label, value }) => (
                <div key={label} className={cn('flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl')}>
                  <div>
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-sm font-mono text-gray-800">{value}</p>
                  </div>
                  <CopyBtn id={label} text={value} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
