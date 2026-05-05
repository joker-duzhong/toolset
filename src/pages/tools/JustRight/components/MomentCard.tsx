// 时刻卡片组件
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Trash2, MoreVertical } from 'lucide-react'
import type { Memo } from '../types'
import { cn } from '@/utils/cn'

interface MomentCardProps {
  moment: Memo
  currentUserId: number
  onDelete: (id: number) => void
  onLike: (id: number) => void
  onUnlike: (id: number) => void
}

export function MomentCard({ moment, currentUserId, onDelete, onLike, onUnlike }: MomentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)

  const isMyMoment = moment.creator_uid === currentUserId
  const isLiked = moment.liked_by_me || false
  const likeCount = moment.likes || 0
  const images = moment.resources || []

  // 双击点赞
  const handleDoubleTap = () => {
    if (!isLiked) {
      onLike(moment.id)
      setShowLikeAnimation(true)
      setTimeout(() => setShowLikeAnimation(false), 1000)
    }
  }

  // 点赞按钮
  const handleLikeClick = () => {
    if (isLiked) {
      onUnlike(moment.id)
    } else {
      onLike(moment.id)
    }
  }

  // 删除确认
  const handleDelete = () => {
    if (confirm('确定删除这条时刻吗？')) {
      onDelete(moment.id)
    }
    setShowMenu(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100"
    >
      {/* 头部：头像、昵称、时间 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-200 to-amber-200 flex items-center justify-center text-lg">
            {isMyMoment ? '🙋‍♀️' : '💁‍♂️'}
          </div>
          <div>
            <p className="text-sm font-bold text-stone-700">
              {isMyMoment ? '我' : 'Ta'}
            </p>
            <p className="text-xs text-stone-400">
              {new Date(moment.created_at).toLocaleDateString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* 菜单按钮（仅自己的时刻） */}
        {isMyMoment && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-stone-400 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMenu(false)}
                    className="fixed inset-0 z-10"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-20"
                  >
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                    >
                      <Trash2 size={14} />
                      删除
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 图片区域 */}
      {images.length > 0 && (
        <div className="relative mb-3" onDoubleClick={handleDoubleTap}>
          {/* 图片网格 */}
          <div
            className={cn(
              'grid gap-2 rounded-2xl overflow-hidden',
              images.length === 1 && 'grid-cols-1',
              images.length === 2 && 'grid-cols-2',
              images.length === 3 && 'grid-cols-3',
              images.length === 4 && 'grid-cols-2',
              images.length >= 5 && 'grid-cols-3'
            )}
          >
            {images.slice(0, 9).map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative bg-stone-100 overflow-hidden',
                  images.length === 1 ? 'aspect-[4/3]' : 'aspect-square'
                )}
              >
                <img
                  src={img.thumb_url || img.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* 双击点赞动画 */}
          <AnimatePresence>
            {showLikeAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart size={80} className="text-rose-500 fill-rose-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 文字内容 */}
      {moment.content && (
        <p className="text-sm text-stone-700 leading-relaxed mb-3 whitespace-pre-wrap">
          {moment.content}
        </p>
      )}

      {/* 交互区：点赞、评论 */}
      <div className="flex items-center gap-4 pt-3 border-t border-stone-100">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLikeClick}
          className="flex items-center gap-1.5 text-stone-500 hover:text-rose-500 transition-colors"
        >
          <Heart
            size={18}
            className={cn(
              'transition-all',
              isLiked && 'text-rose-500 fill-rose-500'
            )}
          />
          <span className="text-xs font-medium">
            {likeCount > 0 ? likeCount : '点赞'}
          </span>
        </motion.button>

        <button className="flex items-center gap-1.5 text-stone-500 hover:text-amber-500 transition-colors">
          <MessageCircle size={18} />
          <span className="text-xs font-medium">评论</span>
        </button>
      </div>
    </motion.div>
  )
}
