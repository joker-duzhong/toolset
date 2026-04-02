// ────────────────────────────────────────────────
// Trade Copilot - 持仓详情视图
// ────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  TrendingDown,
  Trash2,
  XCircle,
  Loader2,
  Plus,
} from 'lucide-react'
import type { CreateTransactionRequest, TransactionAction } from '../types'
import { POSITION_STATUS_LABELS, POSITION_STATUS_COLORS } from '../constants'
import { usePositions, useTransactions } from '../hooks/usePositions'
import { TransactionList } from '../components/TransactionList'

// ── Confirm Dialog ───────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  confirmClass?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认',
  confirmClass = 'bg-red-600 text-white hover:bg-red-700',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-11 rounded-xl text-sm font-medium active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2 ${confirmClass}`}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Transaction Modal ────────────────────────

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (req: CreateTransactionRequest) => Promise<{ success: boolean; message?: string }>
}

function AddTransactionModal({ open, onClose, onSubmit }: AddTransactionModalProps) {
  const [txAction, setTxAction] = useState<TransactionAction>('buy')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [errors, setErrors] = useState<{ price?: string; quantity?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async () => {
    const nextErrors: { price?: string; quantity?: string } = {}

    const p = parseFloat(price)
    if (!price) {
      nextErrors.price = '请输入价格'
    } else if (isNaN(p) || p <= 0) {
      nextErrors.price = '价格必须大于0'
    }

    const q = parseInt(quantity, 10)
    if (!quantity) {
      nextErrors.quantity = '请输入数量'
    } else if (isNaN(q) || q <= 0 || q % 100 !== 0) {
      nextErrors.quantity = '数量须为100的整数倍'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setApiError(null)
    const result = await onSubmit({ action: txAction, price: p, quantity: q })
    setSubmitting(false)

    if (result.success) {
      setPrice('')
      setQuantity('')
      setErrors({})
      setTxAction('buy')
      onClose()
    } else {
      setApiError(result.message || '添加流水失败')
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={submitting ? undefined : onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">添加流水</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            disabled={submitting}
          >
            <XCircle className="size-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          {/* Action selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">交易类型</label>
            <div className="flex gap-2">
              {(['buy', 'sell'] as TransactionAction[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTxAction(t)}
                  className={`flex-1 h-11 rounded-xl text-sm font-medium transition active:scale-[0.98] ${
                    txAction === t
                      ? t === 'buy'
                        ? 'bg-red-50 text-red-600 border-2 border-red-200'
                        : 'bg-green-50 text-green-600 border-2 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {t === 'buy' ? '买入' : '卖出'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="如 1680.50"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }))
              }}
              className={`${inputCls} ${errors.price ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : ''}`}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="100的整数倍"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value)
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }))
              }}
              className={`${inputCls} ${errors.quantity ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : ''}`}
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 bg-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            确认添加
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Position Detail View ─────────────────────────

interface PositionDetailViewProps {
  positionId: number
  onBack: () => void
}

export function PositionDetailView({ positionId, onBack }: PositionDetailViewProps) {
  const { data: positions, updatePosition, removePosition } = usePositions()
  const { data: transactions, loading: txLoading, createTransaction } = useTransactions(positionId)

  const position = useMemo(
    () => positions.find((p) => p.id === positionId),
    [positions, positionId],
  )

  const [showAddTx, setShowAddTx] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handleClosePosition = async () => {
    setActionLoading(true)
    const result = await updatePosition(positionId, { status: 'closed' })
    setActionLoading(false)
    if (result.success) {
      setConfirmClose(false)
      onBack()
    }
  }

  const handleDeletePosition = async () => {
    setActionLoading(true)
    const result = await removePosition(positionId)
    setActionLoading(false)
    if (result.success) {
      setConfirmDelete(false)
      onBack()
    }
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <p className="text-gray-400 text-sm mb-4">持仓不存在</p>
        <button onClick={onBack} className="text-sm text-indigo-600 font-medium">
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-50 active:scale-[0.97] transition"
            aria-label="返回"
          >
            <ArrowLeft className="size-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                {position.name}
              </h1>
              <span
                className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${POSITION_STATUS_COLORS[position.status]}`}
              >
                {POSITION_STATUS_LABELS[position.status]}
              </span>
            </div>
            <p className="text-xs text-gray-400">{position.symbol}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Info section */}
        <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">成本价</p>
              <p className="text-gray-900 font-medium mt-0.5">
                {position.cost_price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">数量</p>
              <p className="text-gray-900 font-medium mt-0.5">
                {position.quantity.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">买入日期</p>
              <p className="text-gray-900 font-medium mt-0.5">{position.buy_date}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">持仓市值</span>
            <span className="text-sm font-semibold text-gray-900">
              {(position.cost_price * position.quantity).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Transaction list */}
        <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">交易流水</h2>
          </div>
          <TransactionList transactions={transactions} loading={txLoading} />
        </div>

        {/* Action buttons */}
        <div className="px-4 mt-4 space-y-2 pb-6">
          {position.status === 'holding' && (
            <>
              <button
                onClick={() => setShowAddTx(true)}
                className="w-full h-11 bg-indigo-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition"
              >
                <Plus className="size-4" />
                添加流水
              </button>

              <button
                onClick={() => setConfirmClose(true)}
                className="w-full h-11 bg-orange-50 text-orange-600 text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 active:scale-[0.98] transition"
              >
                <TrendingDown className="size-4" />
                卖出清仓
              </button>
            </>
          )}

          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full h-11 bg-gray-50 text-gray-500 text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 active:scale-[0.98] transition"
          >
            <Trash2 className="size-4" />
            删除
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
        onSubmit={createTransaction}
      />

      <ConfirmDialog
        open={confirmClose}
        title="确认清仓"
        description={`确定要将 ${position.name}(${position.symbol}) 标记为已清仓吗？`}
        confirmLabel="确认清仓"
        confirmClass="bg-orange-600 text-white hover:bg-orange-700"
        loading={actionLoading}
        onConfirm={handleClosePosition}
        onCancel={() => setConfirmClose(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="确认删除"
        description={`删除后将无法恢复 ${position.name}(${position.symbol}) 的持仓记录及相关交易流水。`}
        confirmLabel="确认删除"
        confirmClass="bg-red-600 text-white hover:bg-red-700"
        loading={actionLoading}
        onConfirm={handleDeletePosition}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
