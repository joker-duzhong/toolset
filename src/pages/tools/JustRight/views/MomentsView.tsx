// 时刻视图 - 私密朋友圈
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'
import { MomentCard } from '../components/MomentCard'
import { MomentPublishModal } from '../components/MomentPublishModal'
import type { Memo } from '../types'
import { memoApi } from '../services/api'
import toast from 'react-hot-toast'

interface MomentsViewProps {
  currentUserId: number
}

export function MomentsView({ currentUserId }: MomentsViewProps) {
  const [moments, setMoments] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [showPublishModal, setShowPublishModal] = useState(false)

  // 加载时刻列表
  useEffect(() => {
    loadMoments()
  }, [])

  const loadMoments = async () => {
    try {
      setLoading(true)
      const res = await memoApi.list()

      if (res.data) {
        const items = res.data.items || []
        setMoments(items)
      }
    } catch (error) {
      console.error('加载时刻失败:', error)
      toast.error('加载时刻失败')
    } finally {
      setLoading(false)
    }
  }

  // 发布时刻
  const handlePublish = async (content: string, imageIds: string[]) => {
    try {
      const res = await memoApi.create(content, imageIds)
      if (res.data) {
        setMoments((prev) => [res.data!, ...prev])
        toast.success('发布成功')
        setShowPublishModal(false)
      }
    } catch (error) {
      console.error('发布失败:', error)
      toast.error('发布失败')
    }
  }

  // 删除时刻
  const handleDelete = async (id: number) => {
    try {
      await memoApi.delete(id)
      setMoments((prev) => prev.filter((m) => m.id !== id))
      toast.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  // 点赞时刻
  const handleLike = async (id: number) => {
    try {
      const res = await memoApi.like(id)
      if (res.data) {
        setMoments((prev) =>
          prev.map((m) => (m.id === id ? res.data! : m))
        )
      }
    } catch (error) {
      console.error('点赞失败:', error)
      toast.error('点赞失败')
    }
  }

  // 取消点赞
  const handleUnlike = async (id: number) => {
    try {
      const res = await memoApi.unlike(id)
      if (res.data) {
        setMoments((prev) =>
          prev.map((m) => (m.id === id ? res.data! : m))
        )
      }
    } catch (error) {
      console.error('取消点赞失败:', error)
      toast.error('取消点赞失败')
    }
  }

  return (
    <div className="min-h-full bg-[#FDFBF7] pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="font-bold text-stone-800">时刻</h1>
          <button
            onClick={() => setShowPublishModal(true)}
            className="p-2 -mr-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Camera size={20} />
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
        ) : moments.length === 0 ? (
          <div className="text-center py-12">
            <Camera size={48} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-400 text-sm">还没有时刻</p>
            <p className="text-stone-400 text-xs mt-1">点击右上角相机图标发布第一条时刻</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {moments.map((moment) => (
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  currentUserId={currentUserId}
                  onDelete={handleDelete}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 发布弹窗 */}
      <MomentPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
      />
    </div>
  )
}
