import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AnniversaryFormModal } from '../components/AnniversaryFormModal'
import { anniversaryApi } from '../services/api'
import type { Anniversary, AnniversaryPayload } from '../types'
import { daysBetween } from '../utils/lunar'

interface AnniversaryManageViewProps {
  onBack: () => void
}

function todayYmd() {
  return new Date().toISOString().split('T')[0]
}

function formatDisplayDate(date: string) {
  return date.replace(/-/g, '.')
}

function getRepeatText(repeatType: Anniversary['repeat_type']) {
  if (repeatType === 'monthly') return '每月'
  if (repeatType === 'once') return '仅一次'
  return '每年'
}

export function AnniversaryManageView({ onBack }: AnniversaryManageViewProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const today = todayYmd()

  useEffect(() => {
    loadAnniversaries()
  }, [])

  const loadAnniversaries = async () => {
    try {
      setLoading(true)
      const res = await anniversaryApi.list()
      if (res.data) setAnniversaries(res.data.filter((item) => !item.is_deleted))
    } catch {
      toast.error('加载纪念日失败')
    } finally {
      setLoading(false)
    }
  }

  const sortedAnniversaries = useMemo(() => {
    return [...anniversaries].sort((a, b) => {
      const diff = daysBetween(today, a.target_date) - daysBetween(today, b.target_date)
      if (diff !== 0) return diff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [anniversaries, today])

  const focusAnniversary = sortedAnniversaries[0] || null
  const timelineData = sortedAnniversaries.slice(1)

  const closeForm = () => {
    setShowForm(false)
    setEditingAnniversary(null)
  }

  const handleSubmit = async (payload: AnniversaryPayload) => {
    try {
      const res = editingAnniversary
        ? await anniversaryApi.update(editingAnniversary.id, payload)
        : await anniversaryApi.add(payload)

      if (!res.data) {
        throw new Error(res.message || 'empty response')
      }

      setAnniversaries((prev) => {
        if (editingAnniversary) {
          return prev.map((item) => (item.id === editingAnniversary.id ? res.data! : item))
        }
        return [res.data!, ...prev]
      })
      toast.success(editingAnniversary ? '纪念日已更新' : '纪念日已添加')
    } catch (error) {
      toast.error(editingAnniversary ? '保存纪念日失败' : '添加纪念日失败')
      throw error
    }
  }

  const handleDelete = async (anniversary: Anniversary) => {
    if (!window.confirm(`确定删除纪念日「${anniversary.title}」吗？`)) return

    try {
      setDeletingId(anniversary.id)
      const res = await anniversaryApi.delete(anniversary.id)
      if (!String(res.code).startsWith('2')) {
        throw new Error(res.message || 'delete failed')
      }
      setAnniversaries((prev) => prev.filter((item) => item.id !== anniversary.id))
      toast.success('纪念日已删除')
    } catch {
      toast.error('删除纪念日失败')
    } finally {
      setDeletingId(null)
    }
  }

  const openEditForm = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary)
    setShowForm(true)
  }

  const openCreateForm = () => {
    setEditingAnniversary(null)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      <div className="sticky top-0 z-20 bg-[#FAFAFA]/90 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-[#666]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-[#333] text-lg tracking-wider">纪念日</h1>
        <button onClick={openCreateForm} className="p-2 -mr-2 text-[#FF7A59]">
          <Plus size={24} />
        </button>
      </div>

      <div className="px-5 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#B7AAA1]">
            <Loader2 size={22} className="mr-2 animate-spin" />
            正在加载纪念日...
          </div>
        ) : anniversaries.length === 0 ? (
          <button
            onClick={openCreateForm}
            className="mt-8 w-full rounded-[2rem] border border-dashed border-[#FFB6C1] bg-white px-6 py-14 text-center text-[#999]"
          >
            <Calendar size={34} className="mx-auto mb-3 text-[#FFB6C1]" />
            点击添加第一个纪念日吧 ~
          </button>
        ) : (
          <>
            {focusAnniversary && (
              <AnniversaryHighlightCard
                anniversary={focusAnniversary}
                today={today}
                deleting={deletingId === focusAnniversary.id}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            )}

            <div className="relative pl-4 mt-6 space-y-8 before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-[#FFE8E3]">
              {timelineData.map((item, idx) => (
                <AnniversaryTimelineItem
                  key={item.id}
                  anniversary={item}
                  today={today}
                  index={idx}
                  deleting={deletingId === item.id}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <AnniversaryFormModal
        isOpen={showForm}
        initialValue={editingAnniversary}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function AnniversaryHighlightCard({
  anniversary,
  today,
  deleting,
  onEdit,
  onDelete,
}: {
  anniversary: Anniversary
  today: string
  deleting: boolean
  onEdit: (anniversary: Anniversary) => void
  onDelete: (anniversary: Anniversary) => void
}) {
  const days = daysBetween(today, anniversary.target_date)

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-br from-[#FFF6F4] to-[#FFF0E5] rounded-[2rem] p-6 mb-8 relative overflow-hidden shadow-sm border border-[#FFE8E3]"
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="text-[#333] font-bold text-lg">{anniversary.title}</h2>
          <AnniversaryActions
            anniversary={anniversary}
            deleting={deleting}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-[#FF7A59] text-sm font-medium">{days >= 0 ? '还有' : '已过去'}</span>
          <span className="text-4xl font-bold text-[#FF7A59]">{Math.abs(days)}</span>
          <span className="text-[#FF7A59] text-sm font-medium">天</span>
        </div>
        <p className="text-[#999] text-xs font-medium">{formatDisplayDate(anniversary.target_date)}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="rounded-full bg-white/70 px-3 py-1 text-[#D98A6C]">{getRepeatText(anniversary.repeat_type)}</span>
          {anniversary.is_lunar && <span className="rounded-full bg-white/70 px-3 py-1 text-[#D98A6C]">农历</span>}
        </div>
      </div>
      <div className="absolute right-0 -bottom-4 opacity-80 pointer-events-none">
        <span className="text-8xl">{anniversary.icon || '🎂'}</span>
      </div>
    </motion.div>
  )
}

function AnniversaryTimelineItem({
  anniversary,
  today,
  index,
  deleting,
  onEdit,
  onDelete,
}: {
  anniversary: Anniversary
  today: string
  index: number
  deleting: boolean
  onEdit: (anniversary: Anniversary) => void
  onDelete: (anniversary: Anniversary) => void
}) {
  const days = daysBetween(today, anniversary.target_date)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative pl-6"
    >
      <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#FFB6C1] shadow-sm z-10" />

      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-bold text-[#333] text-[15px]">{anniversary.title}</h3>
            {anniversary.is_lunar && <span className="rounded-full bg-[#FFF0E5] px-2 py-0.5 text-[10px] font-bold text-[#FF7A59]">农历</span>}
          </div>
          <p className="text-[#999] text-xs mb-1">{formatDisplayDate(anniversary.target_date)}</p>
          <p className="text-[#FF7A59] text-xs font-medium">
            {days >= 0 ? `还有 ${days} 天` : `已过去 ${Math.abs(days)} 天`} · {getRepeatText(anniversary.repeat_type)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-3xl opacity-30 grayscale-[30%]">{anniversary.icon || '✨'}</div>
          <AnniversaryActions
            anniversary={anniversary}
            deleting={deleting}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </motion.div>
  )
}

function AnniversaryActions({
  anniversary,
  deleting,
  onEdit,
  onDelete,
}: {
  anniversary: Anniversary
  deleting: boolean
  onEdit: (anniversary: Anniversary) => void
  onDelete: (anniversary: Anniversary) => void
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        onClick={() => onEdit(anniversary)}
        className="rounded-full bg-white/70 p-2 text-[#A3968C] transition-colors hover:text-[#FF7A59]"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDelete(anniversary)}
        disabled={deleting}
        className="rounded-full bg-white/70 p-2 text-[#A3968C] transition-colors hover:text-rose-500 disabled:opacity-50"
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}
