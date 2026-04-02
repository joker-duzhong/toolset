// ────────────────────────────────────────────────
// Trade Copilot - 市场温度计组件
// ────────────────────────────────────────────────

import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Thermometer as ThermometerType } from '../types'
import { TEMPERATURE_LABELS, TEMPERATURE_COLORS } from '../constants'

interface ThermometerProps {
  data: ThermometerType | null
  loading?: boolean
}

/** Determine score-based color token */
function scoreColor(score: number): string {
  if (score < 30) return 'text-sky-500'
  if (score <= 70) return 'text-amber-500'
  return 'text-red-500'
}

function scoreStroke(score: number): string {
  if (score < 30) return '#0ea5e9' // sky-500
  if (score <= 70) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

function scoreRingBg(score: number): string {
  if (score < 30) return 'stroke-sky-100'
  if (score <= 70) return 'stroke-amber-100'
  return 'stroke-red-100'
}

// ── SVG Gauge ──────────────────────────────────

const RADIUS = 52
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreGauge({ score }: { score: number }) {
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = CIRCUMFERENCE * (1 - progress / 100)
  const strokeColor = scoreStroke(score)

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className={scoreRingBg(score)}
        />
        {/* Progress ring */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>
          {score}
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">市场温度</span>
      </div>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────

function Skeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4 animate-pulse">
      <div className="w-32 h-32 mx-auto rounded-full bg-gray-100" />
      <div className="flex justify-center gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-100" />
        <div className="h-6 w-12 rounded-full bg-gray-100" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-5 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────

export function Thermometer({ data, loading = false }: ThermometerProps) {
  if (loading) return <Skeleton />
  if (!data) return null

  const tempLabel =
    TEMPERATURE_LABELS[data.temperature] ?? data.temperature
  const tempColor =
    TEMPERATURE_COLORS[data.temperature] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
      {/* Score gauge */}
      <ScoreGauge score={data.score} />

      {/* Tags row */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Temperature */}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tempColor}`}
        >
          {tempLabel}
        </span>

        {/* Limit up */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
          <TrendingUp className="size-3" />
          涨停 {data.limit_up_count}
        </span>

        {/* Limit down */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
          <TrendingDown className="size-3" />
          跌停 {data.limit_down_count}
        </span>
      </div>

      {/* Market stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
        <div>
          <p className="text-red-500 font-semibold">{data.up_count}</p>
          <p>上涨</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold">{data.flat_count}</p>
          <p>平盘</p>
        </div>
        <div>
          <p className="text-emerald-500 font-semibold">{data.down_count}</p>
          <p>下跌</p>
        </div>
      </div>

      {/* Top 5 sectors */}
      {data.top_sectors.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">领涨板块</p>
          <div className="space-y-1.5">
            {data.top_sectors.map((sector) => (
              <div
                key={sector.sector_name}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50"
              >
                <span className="text-sm text-gray-700">{sector.sector_name}</span>
                <span
                  className={`text-sm font-semibold ${
                    sector.pct_change >= 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}
                >
                  {sector.pct_change >= 0 ? '+' : ''}
                  {sector.pct_change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
