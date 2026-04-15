// ────────────────────────────────────────────────
// Trade Copilot - 策略管理视图
// ────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import {
  Plus,
  Target,
  RefreshCw,
  AlertCircle,
  X,
  Wallet,
  Percent,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useStrategies, useCapital } from '../hooks/useStrategies'
import { StrategyCard } from '../components/StrategyCard'
import { EmptyState } from '../components/EmptyState'
import type { Strategy, CreateStrategyRequest, UpdateStrategyRequest } from '../types'
import { containerVariants, itemVariants } from '../utils/animations'

// ── Main View ────────────────────────────────────

export function StrategiesView() {
  const strategies = useStrategies()
  const capital = useCapital()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [deprecatingId, setDeprecatingId] = useState<number | null>(null)
  const [showCapitalModal, setShowCapitalModal] = useState(false)

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Handlers ─────────────────────────────────

  const handleDeprecate = useCallback(
    async (id: number) => {
      const res = await strategies.deprecate(id)
      setDeprecatingId(null)
      if (res.success) {
        showToast('success', '策略已废弃')
      } else {
        showToast('error', res.message || '废弃策略失败')
      }
    },
    [strategies, showToast],
  )

  const handleCreate = useCallback(
    async (req: CreateStrategyRequest) => {
      const res = await strategies.create(req)
      setShowCreateModal(false)
      if (res.success) {
        showToast('success', '策略创建成功')
      } else {
        showToast('error', res.message || '创建策略失败')
      }
    },
    [strategies, showToast],
  )

  const handleUpdate = useCallback(
    async (id: number, req: CreateStrategyRequest | UpdateStrategyRequest) => {
      const res = await strategies.update(id, req)
      setEditingStrategy(null)
      if (res.success) {
        showToast('success', '策略更新成功')
      } else {
        showToast('error', res.message || '更新策略失败')
      }
    },
    [strategies, showToast],
  )

  const handleSaveCapital = useCallback(
    async (value: number) => {
      const res = await capital.save(value)
      setShowCapitalModal(false)
      if (res.success) {
        showToast('success', '资金设置已更新')
      } else {
        showToast('error', res.message || '更新资金设置失败')
      }
    },
    [capital, showToast],
  )

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-6 relative min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">策略管理</h1>
        <button
          onClick={() => strategies.refresh()}
          disabled={strategies.loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-[0.97] transition disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${strategies.loading ? 'animate-spin' : ''}`} />
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
        {/* Capital Settings Card - full width */}
        <motion.section variants={itemVariants} className="space-y-2 lg:col-span-3">
          <h2 className="text-sm font-semibold text-gray-500">资金设置</h2>

          {capital.error ? (
            <InlineError message={capital.error} onRetry={capital.refresh} />
          ) : (
            <motion.button
              onClick={() => setShowCapitalModal(true)}
              className="w-full text-left rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg p-4 transition active:scale-[0.98]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Wallet className="size-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">总资金</p>
                  <p className="text-xl font-bold text-gray-800">
                    <span className="text-xs font-normal text-gray-400 mr-0.5">&yen;</span>
                    {capital.loading
                      ? '--'
                      : capital.data?.total_capital.toLocaleString('zh-CN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) ?? '--'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">佣金率</p>
                  <p className="text-lg font-bold text-gray-600">
                    {capital.loading
                      ? '--'
                      : capital.data
                        ? `${(capital.data.commission_rate * 100).toFixed(3)}%`
                        : '--'}
                  </p>
                </div>
              </div>
            </motion.button>
          )}
        </motion.section>

        {/* Strategy Cards */}
        {!strategies.error && !strategies.loading && strategies.data.length > 0 && (
          <>
            {strategies.data.map((s) => (
              <motion.div key={s.id} variants={itemVariants}>
                <StrategyCard
                  strategy={s}
                  onEdit={setEditingStrategy}
                  onDeprecate={(id) => setDeprecatingId(id)}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      {/* Error/Loading/Empty States */}
      {strategies.error && (
        <div className="mt-4">
          <InlineError message={strategies.error} onRetry={strategies.refresh} />
        </div>
      )}

      {strategies.loading && (
        <div className="mt-4">
          <StrategyListSkeleton />
        </div>
      )}

      {!strategies.loading && !strategies.error && strategies.data.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={Target}
            title="暂无策略"
            description="点击右下角按钮创建你的第一个交易策略"
          />
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 z-10 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 active:scale-[0.95] transition"
      >
        <Plus className="size-6" />
      </button>

      {/* Modals */}
      {showCreateModal && (
        <StrategyFormModal
          title="新建策略"
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingStrategy && (
        <StrategyFormModal
          title="编辑策略"
          strategy={editingStrategy}
          onSubmit={(req) => handleUpdate(editingStrategy.id, req)}
          onClose={() => setEditingStrategy(null)}
        />
      )}

      {deprecatingId && (
        <ConfirmModal
          title="确认废弃策略"
          message="废弃后该策略将不再生效，此操作不可恢复。确认废弃？"
          confirmLabel="确认废弃"
          onConfirm={() => handleDeprecate(deprecatingId)}
          onClose={() => setDeprecatingId(null)}
        />
      )}

      {showCapitalModal && (
        <CapitalModal
          currentCapital={capital.data?.total_capital ?? 0}
          onSave={handleSaveCapital}
          onClose={() => setShowCapitalModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}

// ── Strategy Form Modal ──────────────────────────

interface StrategyFormModalProps {
  title: string
  strategy?: Strategy
  onSubmit: (req: CreateStrategyRequest) => Promise<void>
  onClose: () => void
}

function StrategyFormModal({ title, strategy, onSubmit, onClose }: StrategyFormModalProps) {
  const [name, setName] = useState(strategy?.name ?? '')
  const [takeProfitDrawdown, setTakeProfitDrawdown] = useState(
    strategy?.take_profit_drawdown_pct != null ? String(strategy.take_profit_drawdown_pct) : '',
  )
  const [stopLoss, setStopLoss] = useState(
    strategy?.stop_loss_pct != null ? String(strategy.stop_loss_pct) : '',
  )
  const [description, setDescription] = useState(strategy?.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setFormError(null)

    if (!name.trim()) {
      setFormError('请输入策略名称')
      return
    }

    const tpDrawdown = parseFloat(takeProfitDrawdown)
    const slPct = parseFloat(stopLoss)

    if (!takeProfitDrawdown || isNaN(tpDrawdown)) {
      setFormError('请输入有效的止盈回撤比例')
      return
    }

    if (!stopLoss || isNaN(slPct)) {
      setFormError('请输入有效的止损比例')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        take_profit_drawdown_pct: tpDrawdown,
        stop_loss_pct: slPct,
        ...(description.trim() ? { description: description.trim() } : {}),
      })
    } catch {
      setFormError('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-[calc(100vw-2rem)] max-w-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 active:scale-[0.95] transition"
          >
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              策略名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入策略名称"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
              <Percent className="size-3 text-emerald-500" />
              止盈回撤比例 (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={takeProfitDrawdown}
              onChange={(e) => setTakeProfitDrawdown(e.target.value)}
              placeholder="如: 10"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
            />
            <p className="text-[10px] text-gray-300 mt-1">从最高点回撤该比例时止盈</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
              <ShieldAlert className="size-3 text-red-400" />
              止损比例 (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="如: 5"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
            />
            <p className="text-[10px] text-gray-300 mt-1">从成本价下跌该比例时止损</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">适用范围</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="选填，如: 主板、创业板"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="size-3.5 shrink-0" />
              {formError}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 active:scale-[0.97] transition"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition disabled:opacity-50"
          >
            {submitting ? '提交中...' : '确认'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── Confirm Modal ────────────────────────────────

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }: ConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-[calc(100vw-2rem)] max-w-sm p-5 shadow-xl">
        <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{message}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 active:scale-[0.97] transition disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.97] transition disabled:opacity-50"
          >
            {submitting ? '处理中...' : confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── Capital Modal ────────────────────────────────

interface CapitalModalProps {
  currentCapital: number
  onSave: (value: number) => Promise<void>
  onClose: () => void
}

function CapitalModal({ currentCapital, onSave, onClose }: CapitalModalProps) {
  const [value, setValue] = useState(currentCapital > 0 ? String(currentCapital) : '')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSave = async () => {
    setFormError(null)
    const num = parseFloat(value)

    if (!value || isNaN(num) || num <= 0) {
      setFormError('请输入大于 0 的金额')
      return
    }

    setSubmitting(true)
    try {
      await onSave(num)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-[calc(100vw-2rem)] max-w-sm p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">编辑资金</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 active:scale-[0.95] transition"
          >
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">总资金 (&yen;)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="输入总资金"
            min="0"
            step="0.01"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
          />
        </div>

        {formError && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
            <AlertCircle className="size-3.5 shrink-0" />
            {formError}
          </div>
        )}

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 active:scale-[0.97] transition disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── Modal Overlay (shared) ───────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50">{children}</div>
    </div>
  )
}

// ── Inline Error ─────────────────────────────────

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
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

// ── Strategy List Skeleton ───────────────────────

function StrategyListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-24 rounded bg-gray-100" />
            <div className="h-5 w-14 rounded-full bg-gray-100" />
          </div>
          <div className="space-y-2 mb-2">
            <div className="h-3 w-20 rounded bg-gray-100" />
            <div className="h-5 w-16 rounded-md bg-gray-100" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="h-5 w-14 rounded-md bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
