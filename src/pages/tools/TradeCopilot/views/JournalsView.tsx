// ────────────────────────────────────────────────
// Trade Copilot - 交易日记视图
// ────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useJournals } from '../hooks/useJournals'
import { EmptyState } from '../components/EmptyState'
import { StarRating } from '../components/StarRating'
import { JournalCard } from '../components/JournalCard'
import type { Journal, CreateJournalRequest, UpdateJournalRequest } from '../types'
import { containerVariants, itemVariants } from '../utils/animations'

// ── Form State ──────────────────────────────────

interface FormState {
  record_date: string
  execution_score: number
  notes: string
  mistakes_made: string
  emotions: string
}

const emptyForm = (): FormState => ({
  record_date: new Date().toISOString().slice(0, 10),
  execution_score: 5,
  notes: '',
  mistakes_made: '',
  emotions: '',
})

// ── View ────────────────────────────────────────

export function JournalsView() {
  const { data, loading, create, update } = useJournals()

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.record_date.localeCompare(a.record_date)),
    [data],
  )

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ date?: boolean; score?: boolean }>({})

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (journal: Journal) => {
    setEditingId(journal.id)
    setForm({
      record_date: journal.record_date,
      execution_score: journal.execution_score,
      notes: journal.notes,
      mistakes_made: journal.mistakes_made,
      emotions: journal.emotions,
    })
    setErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    const newErrors: typeof errors = {}
    if (!form.record_date) newErrors.date = true
    if (!form.execution_score) newErrors.score = true
    setErrors(newErrors)
    if (newErrors.date || newErrors.score) return

    setSaving(true)
    try {
      if (editingId) {
        const req: UpdateJournalRequest = {
          record_date: form.record_date,
          execution_score: form.execution_score,
          notes: form.notes || undefined,
          mistakes_made: form.mistakes_made || undefined,
          emotions: form.emotions || undefined,
        }
        await update(editingId, req)
      } else {
        const req: CreateJournalRequest = {
          record_date: form.record_date,
          execution_score: form.execution_score,
          notes: form.notes || undefined,
          mistakes_made: form.mistakes_made || undefined,
          emotions: form.emotions || undefined,
        }
        await create(req)
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'record_date') setErrors((e) => ({ ...e, date: false }))
    if (key === 'execution_score') setErrors((e) => ({ ...e, score: false }))
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">交易日记</h1>
      </div>

      <div className="flex-1 px-4 pb-24">
        {loading ? (
          <ListSkeleton />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="暂无交易日记"
            description="记录你的第一篇交易日记"
          />
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sorted.map((journal) => (
              <motion.div key={journal.id} variants={itemVariants}>
                <JournalCard
                  journal={journal}
                  onClick={openEdit}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-24 right-5 w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center transition hover:bg-amber-600 active:scale-95 z-20"
      >
        <Plus className="size-6" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {editingId ? '编辑日记' : '新建日记'}
              </h2>
              <button
                onClick={closeModal}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                取消
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* 交易日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  交易日期 <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={form.record_date}
                  onChange={(e) => updateField('record_date', e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                    errors.date
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-200 focus:border-amber-400'
                  }`}
                />
                {errors.date && <p className="text-xs text-red-400 mt-1">请选择交易日期</p>}
              </div>

              {/* 执行力评分 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  执行力评分 <span className="text-red-400 ml-0.5">*</span>
                </label>
                <StarRating
                  value={form.execution_score}
                  onChange={(v) => updateField('execution_score', v)}
                />
                {errors.score && <p className="text-xs text-red-400 mt-1">请选择评分</p>}
              </div>

              {/* 操作回顾 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">操作回顾</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                  placeholder="记录今天的操作..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-400 resize-none"
                />
              </div>

              {/* 犯错记录 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">犯错记录</label>
                <textarea
                  value={form.mistakes_made}
                  onChange={(e) => updateField('mistakes_made', e.target.value)}
                  rows={3}
                  placeholder="今天犯了什么错误..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-400 resize-none"
                />
              </div>

              {/* 情绪记录 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">情绪记录</label>
                <textarea
                  value={form.emotions}
                  onChange={(e) => updateField('emotions', e.target.value)}
                  rows={3}
                  placeholder="今天有什么感悟..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── List Skeleton ───────────────────────────────

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-xl bg-amber-50/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-12 rounded bg-gray-200" />
          </div>
          <div className="h-3 w-3/4 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}
