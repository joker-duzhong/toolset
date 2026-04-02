// ────────────────────────────────────────────────
// Trade Copilot - 持仓列表视图
// ────────────────────────────────────────────────

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import type { PositionStatus, CreatePositionRequest } from '../types'
import { usePositions } from '../hooks/usePositions'
import { PositionCard } from '../components/PositionCard'
import { EmptyState } from '../components/EmptyState'
import { PositionDetailView } from './PositionDetailView'

// ── Tabs config ──────────────────────────────────
const TABS: { key: PositionStatus; label: string }[] = [
  { key: 'holding', label: '当前持仓' },
  { key: 'closed', label: '已清仓' },
]

// ── Helpers ──────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

interface FormErrors {
  symbol?: string
  name?: string
  cost_price?: string
  quantity?: string
}

function validateForm(form: {
  symbol: string
  name: string
  cost_price: string
  quantity: string
}): { valid: boolean; errors: FormErrors } {
  const errors: FormErrors = {}

  if (!form.symbol) {
    errors.symbol = '请输入股票代码'
  } else if (!/^\d{6}$/.test(form.symbol)) {
    errors.symbol = '股票代码为6位数字'
  }

  if (!form.name.trim()) {
    errors.name = '请输入股票名称'
  }

  const costPrice = parseFloat(form.cost_price)
  if (!form.cost_price) {
    errors.cost_price = '请输入成本价'
  } else if (isNaN(costPrice) || costPrice <= 0) {
    errors.cost_price = '成本价必须大于0'
  }

  const qty = parseInt(form.quantity, 10)
  if (!form.quantity) {
    errors.quantity = '请输入买入数量'
  } else if (isNaN(qty) || qty <= 0 || qty % 100 !== 0) {
    errors.quantity = '买入数量须为100的整数倍'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ── Create Position Modal ────────────────────────

interface CreateModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (req: CreatePositionRequest) => Promise<{ success: boolean; message?: string }>
}

function CreatePositionModal({ open, onClose, onSubmit }: CreateModalProps) {
  const [form, setForm] = useState({
    symbol: '',
    name: '',
    buy_date: today(),
    cost_price: '',
    quantity: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async () => {
    const { valid, errors: validationErrors } = validateForm(form)
    setErrors(validationErrors)
    if (!valid) return

    setSubmitting(true)
    setApiError(null)
    const result = await onSubmit({
      symbol: form.symbol,
      name: form.name.trim(),
      buy_date: form.buy_date,
      cost_price: parseFloat(form.cost_price),
      quantity: parseInt(form.quantity, 10),
    })
    setSubmitting(false)

    if (result.success) {
      setForm({ symbol: '', name: '', buy_date: today(), cost_price: '', quantity: '' })
      setErrors({})
      onClose()
    } else {
      setApiError(result.message || '新增持仓失败')
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field as keyof FormErrors]
        return next
      })
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">新增持仓</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            disabled={submitting}
          >
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">股票代码</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6位数字，如 600519"
              value={form.symbol}
              onChange={(e) => updateField('symbol', e.target.value)}
              className={`${inputCls} ${errors.symbol ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : ''}`}
            />
            {errors.symbol && <p className="text-xs text-red-500 mt-1">{errors.symbol}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">股票名称</label>
            <input
              type="text"
              placeholder="如 贵州茅台"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`${inputCls} ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">买入日期</label>
            <input
              type="date"
              value={form.buy_date}
              onChange={(e) => updateField('buy_date', e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成本价</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="如 1680.50"
              value={form.cost_price}
              onChange={(e) => updateField('cost_price', e.target.value)}
              className={`${inputCls} ${errors.cost_price ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : ''}`}
            />
            {errors.cost_price && <p className="text-xs text-red-500 mt-1">{errors.cost_price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">买入数量</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="100的整数倍"
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
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
            确认新增
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Positions View ───────────────────────────────

export function PositionsView() {
  const [activeTab, setActiveTab] = useState<PositionStatus>('holding')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null)

  const { data, loading, error, refresh, createPosition } = usePositions(activeTab)

  if (selectedPositionId) {
    return (
      <PositionDetailView
        positionId={selectedPositionId}
        onBack={() => setSelectedPositionId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex border-b border-gray-100 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="px-4 py-3">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={refresh} className="text-xs text-indigo-600 mt-1">
              点击重试
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 text-indigo-400 animate-spin" />
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <EmptyState
            title={activeTab === 'holding' ? '暂无持仓' : '暂无已清仓记录'}
            description={
              activeTab === 'holding'
                ? '点击右下角按钮新增持仓'
                : '清仓后的记录会显示在这里'
            }
          />
        )}

        {!loading && data.length > 0 && (
          <div className="p-4 space-y-3">
            {data.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                onClick={setSelectedPositionId}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition"
        aria-label="新增持仓"
      >
        <Plus className="size-6" />
      </button>

      <CreatePositionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={createPosition}
      />
    </div>
  )
}
