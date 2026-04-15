// ────────────────────────────────────────────────
// Trade Copilot - 观察池管理页面
// ────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { Plus, Eye, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWatchlist, useStList } from '../hooks/useWatchlist'
import { WatchlistItem } from '../components/WatchlistItem'
import { EmptyState } from '../components/EmptyState'
import type {
  WatchlistItem as WatchlistItemType,
  CreateWatchlistRequest,
  UpdateWatchlistRequest,
} from '../types'
import { containerVariants, itemVariants } from '../utils/animations'

// ── Modal 模式 ────────────────────────────────
type ModalMode = 'add' | 'edit'

interface FormData {
  symbol: string
  name: string
  reason: string
}

const emptyForm: FormData = { symbol: '', name: '', reason: '' }

export function WatchlistView() {
  const { data, loading, error, add, update, remove } = useWatchlist()
  const { isSt } = useStList()

  // modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('add')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── helpers ────────────────────────────────

  const openAddModal = useCallback(() => {
    setModalMode('add')
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((item: WatchlistItemType) => {
    setModalMode('edit')
    setEditingId(item.id)
    setForm({
      symbol: item.symbol,
      name: item.name,
      reason: item.reason,
    })
    setFormError(null)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setFormError(null)
  }, [])

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setFormError(null)
  }

  // ── submit ─────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const symbol = form.symbol.trim()
    const name = form.name.trim()
    const reason = form.reason.trim()

    if (!/^\d{6}$/.test(symbol)) {
      setFormError('股票代码必须为 6 位数字')
      return
    }
    if (!name) {
      setFormError('请填写股票名称')
      return
    }

    // ST check (only on add)
    if (modalMode === 'add' && isSt(symbol)) {
      setFormError('该股票为 ST 股，风险较高，不建议观察')
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      let result: { success: boolean; message?: string }

      if (modalMode === 'add') {
        const req: CreateWatchlistRequest = { symbol, name }
        if (reason) req.reason = reason
        result = await add(req)
      } else {
        const req: UpdateWatchlistRequest = {}
        if (reason !== undefined) req.reason = reason
        result = await update(editingId!, req)
      }

      if (result.success) {
        closeModal()
      } else {
        setFormError(result.message || '操作失败，请重试')
      }
    } catch {
      setFormError('网络连接失败')
    } finally {
      setSubmitting(false)
    }
  }, [form, modalMode, editingId, isSt, add, update, closeModal])

  // ── delete ─────────────────────────────────

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await remove(deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget, remove])

  // ── render ─────────────────────────────────

  return (
    <div className="relative min-h-full pb-20">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="size-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 my-8 p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={Eye}
          title="暂无观察目标"
          description="添加你的第一个观察目标"
        />
      )}

      {/* List */}
      {!loading && !error && data.length > 0 && (
        <motion.div
          className="space-y-3 px-4 py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.map(item => (
            <motion.div key={item.id} variants={itemVariants}>
              <WatchlistItem
                item={item}
                onEdit={openEditModal}
                onDelete={id => setDeleteTarget(id)}
                onQuickBuy={item => {
                  console.info('quick buy', item.symbol)
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* FAB */}
      <button
        onClick={openAddModal}
        className="fixed bottom-24 right-6 z-20 w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center transition active:scale-[0.92] hover:bg-blue-600"
      >
        <Plus className="size-6" />
      </button>

      {/* ── Add / Edit Modal ──────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === 'add' ? '新增观察' : '编辑观察'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">股票代码</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6位数字，如 000001"
                  value={form.symbol}
                  onChange={e => updateField('symbol', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={modalMode === 'edit'}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    modalMode === 'edit'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">股票名称</label>
                <input
                  type="text"
                  placeholder="如 平安银行"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  disabled={modalMode === 'edit'}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    modalMode === 'edit'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  placeholder="选填，记录观察理由…"
                  rows={3}
                  value={form.reason}
                  onChange={e => updateField('reason', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-6 w-full py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? '提交中…' : modalMode === 'add' ? '添加观察' : '保存修改'}
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-30 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          <div className="relative w-full max-w-xs bg-white rounded-2xl p-6 text-center">
            <p className="text-base font-semibold text-gray-900 mb-2">确认删除</p>
            <p className="text-sm text-gray-500 mb-5">
              删除后无法恢复，确定要移除这条观察吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 disabled:opacity-50 active:scale-[0.98]"
              >
                {deleting ? '删除中…' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
