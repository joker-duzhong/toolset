// 纪念日时间轴组件
import { motion } from 'framer-motion'
import { Calendar, Edit2, Trash2, Clock } from 'lucide-react'
import type { Anniversary } from '../types'
import { formatDate, daysBetween } from '../utils/lunar'

interface AnniversaryTimelineProps {
  anniversaries: Anniversary[]
  onEdit: (anniversary: Anniversary) => void
  onDelete: (id: string) => void
}

export function AnniversaryTimeline({ anniversaries, onEdit, onDelete }: AnniversaryTimelineProps) {
  // 按日期排序（即将到来的在前）
  const sortedAnniversaries = [...anniversaries].sort((a, b) => {
    const daysA = daysBetween(new Date().toISOString().split('T')[0], a.target_date)
    const daysB = daysBetween(new Date().toISOString().split('T')[0], b.target_date)
    return daysA - daysB
  })

  // 分组：即将到来 vs 历史
  const today = new Date().toISOString().split('T')[0]
  const upcoming = sortedAnniversaries.filter(a => a.target_date >= today)
  const past = sortedAnniversaries.filter(a => a.target_date < today)

  if (anniversaries.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto text-stone-300 mb-3" />
        <p className="text-stone-400 text-sm">还没有添加纪念日</p>
        <p className="text-stone-400 text-xs mt-1">点击右上角 + 添加第一个纪念日</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 即将到来的纪念日 */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-stone-700 mb-3 px-1">即将到来</h3>
          <div className="space-y-3">
            {upcoming.map((anniversary, index) => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                isUpcoming={true}
                isFirst={index === 0}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* 历史纪念日 */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-stone-700 mb-3 px-1">历史记录</h3>
          <div className="space-y-3">
            {past.map((anniversary) => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                isUpcoming={false}
                isFirst={false}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 纪念日卡片
function AnniversaryCard({
  anniversary,
  isUpcoming,
  isFirst,
  onEdit,
  onDelete,
}: {
  anniversary: Anniversary
  isUpcoming: boolean
  isFirst: boolean
  onEdit: (anniversary: Anniversary) => void
  onDelete: (id: string) => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const daysUntil = daysBetween(today, anniversary.target_date)
  const daysAgo = Math.abs(daysUntil)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-4 rounded-2xl border-2 transition-all ${
        isFirst && isUpcoming
          ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg shadow-rose-100'
          : 'border-stone-200 bg-white'
      }`}
    >
      {/* 左侧图标 */}
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
            isFirst && isUpcoming ? 'bg-white shadow-sm' : 'bg-stone-50'
          }`}
        >
          {anniversary.icon || '🎂'}
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-stone-800 text-base leading-tight">
              {anniversary.title}
            </h4>

            {/* 操作按钮 */}
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(anniversary)}
                className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`确定删除纪念日"${anniversary.title}"吗？`)) {
                    onDelete(anniversary.id)
                  }
                }}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* 日期信息 */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <Calendar size={12} />
            <span>{formatDate(anniversary.target_date, anniversary.is_lunar)}</span>
            {anniversary.is_lunar && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[10px] font-medium">
                农历
              </span>
            )}
          </div>

          {/* 倒计时/正计时 */}
          {isUpcoming ? (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-rose-400" />
              <span className={`font-bold ${isFirst ? 'text-rose-500 text-lg' : 'text-stone-600 text-sm'}`}>
                还有 {daysUntil} 天
              </span>
            </div>
          ) : (
            <div className="text-xs text-stone-400">
              {daysAgo} 天前
            </div>
          )}

          {/* 描述 */}
          {anniversary.description && (
            <p className="text-xs text-stone-500 mt-2 line-clamp-2">
              {anniversary.description}
            </p>
          )}

          {/* 标签 */}
          <div className="flex gap-1.5 mt-2">
            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">
              {anniversary.type === 'countdown' ? '倒计时' : '正计时'}
            </span>
            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">
              {anniversary.repeat_type === 'yearly'
                ? '每年'
                : anniversary.repeat_type === 'monthly'
                ? '每月'
                : '仅一次'}
            </span>
          </div>
        </div>
      </div>

      {/* 高亮边框动画（仅第一个即将到来的） */}
      {isFirst && isUpcoming && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-rose-400"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  )
}
