// 纪念日管理视图
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft } from 'lucide-react'
import { AnniversaryTimeline } from '../components/AnniversaryTimeline'
import { AnniversaryFormModal } from '../components/AnniversaryFormModal'
import { anniversaryApi } from '../services/api'
import type { Anniversary } from '../types'
import toast from 'react-hot-toast'

interface AnniversaryManageViewProps {
  onBack: () => void
}

export function AnniversaryManageView({ onBack }: AnniversaryManageViewProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | undefined>()

  // 加载纪念日列表
  useEffect(() => {
    loadAnniversaries()
  }, [])

  const loadAnniversaries = async () => {
    try {
      setLoading(true)
      const res = await anniversaryApi.list()
      if (res.data) {
        setAnniversaries(res.data)
      }
    } catch (error) {
      console.error('加载纪念日失败:', error)
      toast.error('加载纪念日失败')
    } finally {
      setLoading(false)
    }
  }

  // 添加纪念日
  const handleAdd = async (data: Omit<Anniversary, 'id' | 'couple_id' | 'is_deleted' | 'created_at' | 'updated_at'>) => {
    try {
      const res = await anniversaryApi.add(data)
      if (res.data) {
        setAnniversaries((prev) => [...prev, res.data!])
        toast.success('纪念日添加成功')
      }
    } catch (error) {
      console.error('添加纪念日失败:', error)
      toast.error('添加纪念日失败')
    }
  }

  // 编辑纪念日
  const handleEdit = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary)
    setShowForm(true)
  }

  // 更新纪念日
  const handleUpdate = async (data: Omit<Anniversary, 'id' | 'couple_id' | 'is_deleted' | 'created_at' | 'updated_at'>) => {
    if (!editingAnniversary) return

    try {
      const res = await anniversaryApi.update(editingAnniversary.id, data)
      if (res.data) {
        setAnniversaries((prev) =>
          prev.map((a) => (a.id === editingAnniversary.id ? res.data! : a))
        )
        toast.success('纪念日更新成功')
        setEditingAnniversary(undefined)
      }
    } catch (error) {
      console.error('更新纪念日失败:', error)
      toast.error('更新纪念日失败')
    }
  }

  // 删除纪念日
  const handleDelete = async (id: number) => {
    try {
      await anniversaryApi.delete(id)
      setAnniversaries((prev) => prev.filter((a) => a.id !== id))
      toast.success('纪念日已删除')
    } catch (error) {
      console.error('删除纪念日失败:', error)
      toast.error('删除纪念日失败')
    }
  }

  // 关闭表单
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAnniversary(undefined)
  }

  return (
    <div className="min-h-full bg-[#FDFBF7] pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-stone-800">纪念日管理</h1>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 -mr-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4 pt-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm mt-3">加载中...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnniversaryTimeline
              anniversaries={anniversaries}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </motion.div>
        )}
      </div>

      {/* 表单模态框 */}
      <AnniversaryFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={editingAnniversary ? handleUpdate : handleAdd}
        initialData={editingAnniversary}
      />
    </div>
  )
}
