// ────────────────────────────────────────────────
// Trade Copilot - 大盘红绿灯组件
// ────────────────────────────────────────────────

import { ShieldCheck, ShieldAlert } from 'lucide-react'
import type { MarketStatus } from '../types'

interface TrafficLightProps {
  sh_status: MarketStatus['sh_status']
  sz_status: MarketStatus['sz_status']
  sh_reason: string
  sz_reason: string
  loading?: boolean
}

interface StatusCardProps {
  title: string
  status: 'red' | 'green'
  reason: string
}

function StatusCard({ title, status, reason }: StatusCardProps) {
  const isRed = status === 'red'

  return (
    <div
      className={`flex-1 rounded-2xl p-4 transition ${
        isRed
          ? 'bg-red-50 border border-red-100'
          : 'bg-emerald-50 border border-emerald-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {isRed ? (
          <ShieldCheck className="size-4.5 text-red-500" />
        ) : (
          <ShieldAlert className="size-4.5 text-emerald-600" />
        )}
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>

      {/* Status label */}
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
          isRed
            ? 'bg-red-500 text-white'
            : 'bg-emerald-600 text-white'
        }`}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            isRed ? 'bg-white/80' : 'bg-white/80'
          }`}
        />
        {isRed ? '线之上' : '已跌破'}
      </div>

      {/* Reason */}
      {reason && (
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">{reason}</p>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-1 rounded-2xl p-4 bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4.5 h-4.5 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
      <div className="mt-2 h-3 w-full rounded bg-gray-200 animate-pulse" />
      <div className="mt-1 h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
    </div>
  )
}

export function TrafficLight({
  sh_status,
  sz_status,
  sh_reason,
  sz_reason,
  loading = false,
}: TrafficLightProps) {
  if (loading) {
    return (
      <div className="flex gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <StatusCard title="上证" status={sh_status} reason={sh_reason} />
      <StatusCard title="深证" status={sz_status} reason={sz_reason} />
    </div>
  )
}
