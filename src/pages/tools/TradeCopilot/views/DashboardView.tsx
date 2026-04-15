// ────────────────────────────────────────────────
// Trade Copilot - 驾驶舱视图
// ────────────────────────────────────────────────

import { RefreshCw, Briefcase, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMarketStatus, useMarketThermometer } from '../hooks/useMarket'
import { usePositions } from '../hooks/usePositions'
import { TrafficLight } from '../components/TrafficLight'
import { Thermometer } from '../components/Thermometer'
import { containerVariants, itemVariants } from '../utils/animations'

export function DashboardView() {
  const marketStatus = useMarketStatus()
  const thermometer = useMarketThermometer()
  const positions = usePositions('holding')

  const refreshAll = () => {
    marketStatus.refresh()
    thermometer.refresh()
    positions.refresh()
  }

  const anyLoading =
    marketStatus.loading || thermometer.loading || positions.loading

  const totalCost = positions.data.reduce(
    (sum, p) => sum + p.cost_price * p.quantity,
    0
  )

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-6">
      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">驾驶舱</h1>
        <button
          onClick={refreshAll}
          disabled={anyLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-[0.97] transition disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3.5 ${anyLoading ? 'animate-spin' : ''}`}
          />
          刷新
        </button>
      </div>

      {/* Bento Grid Layout */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Traffic Light - 2 cards, each col-span-1 */}
        <motion.section variants={itemVariants} className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500">
            大盘红绿灯
            <span className="text-gray-300 font-normal ml-1.5">
              20 日均线
            </span>
          </h2>

          {marketStatus.error ? (
            <InlineError message={marketStatus.error} onRetry={marketStatus.refresh} />
          ) : (
            <TrafficLight
              sh_status={marketStatus.data?.sh_status ?? 'red'}
              sz_status={marketStatus.data?.sz_status ?? 'red'}
              sh_reason={marketStatus.data?.sh_reason ?? ''}
              sz_reason={marketStatus.data?.sz_reason ?? ''}
              loading={marketStatus.loading}
            />
          )}
        </motion.section>

        {/* Thermometer - spans 2 columns on large screens */}
        <motion.section variants={itemVariants} className="space-y-2 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-500">市场温度计</h2>

          {thermometer.error ? (
            <InlineError message={thermometer.error} onRetry={thermometer.refresh} />
          ) : (
            <Thermometer data={thermometer.data} loading={thermometer.loading} />
          )}
        </motion.section>

        {/* Position Summary - full width */}
        <motion.section variants={itemVariants} className="space-y-2 lg:col-span-3">
          <h2 className="text-sm font-semibold text-gray-500">持仓概览</h2>

          {positions.error ? (
            <InlineError message={positions.error} onRetry={positions.refresh} />
          ) : positions.loading ? (
            <PositionSummarySkeleton />
          ) : (
            <div className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Briefcase className="size-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">持有股票</p>
                  <p className="text-xl font-bold text-gray-800">
                    {positions.data.length}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      只
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">总成本</p>
                  <p className="text-xl font-bold text-gray-800">
                    <span className="text-xs font-normal text-gray-400 mr-0.5">
                      &yen;
                    </span>
                    {totalCost.toLocaleString('zh-CN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  )
}

// ── Inline Error ───────────────────────────────

function InlineError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-100">
      <AlertCircle className="size-4 text-red-400 shrink-0" />
      <p className="flex-1 text-xs text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-medium text-red-500 hover:text-red-700 shrink-0"
      >
        重试
      </button>
    </div>
  )
}

// ── Position Summary Skeleton ──────────────────

function PositionSummarySkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-12 rounded bg-gray-100" />
          <div className="h-5 w-16 rounded bg-gray-100" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-10 rounded bg-gray-100" />
          <div className="h-5 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
