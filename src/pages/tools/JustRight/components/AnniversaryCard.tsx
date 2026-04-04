// 纪念日卡片
import { Heart, Cake, Sparkles } from 'lucide-react'
import type { Anniversary } from '../types'

interface AnniversaryCardProps {
  anniversary: Anniversary
}

// 计算天数差
function getDaysDiff(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
  return Math.abs(diff)
}

// 计算剩余天数
function getDaysRemaining(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  // 设置为今年
  target.setFullYear(today.getFullYear())

  // 如果已过，设置为明年
  if (target < today) {
    target.setFullYear(today.getFullYear() + 1)
  }

  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function AnniversaryCard({ anniversary }: AnniversaryCardProps) {
  const isCountUp = anniversary.type === 'countup'
  const days = isCountUp ? getDaysDiff(anniversary.target_date) : getDaysRemaining(anniversary.target_date)

  const Icon = anniversary.title.includes('生日') ? Cake : anniversary.title.includes('纪念') ? Heart : Sparkles

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-rose-100/50">
      {/* 图标 */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
        <Icon size={24} className="text-rose-500" />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-stone-700 truncate">{anniversary.title}</h3>
        <p className="text-xs text-stone-400 mt-0.5">
          {anniversary.target_date} {anniversary.is_lunar && '📅 农历'}
        </p>
      </div>

      {/* 天数 */}
      <div className="text-right">
        <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
          {days}
        </div>
        <div className="text-xs text-stone-400">
          {isCountUp ? '天了' : '天后'}
        </div>
      </div>
    </div>
  )
}

// 简洁版纪念日展示（用于首页顶部）
interface CompactAnniversaryProps {
  title: string
  days: number
  type: 'countup' | 'countdown'
}

export function CompactAnniversary({ title, days, type }: CompactAnniversaryProps) {
  return (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
      <span className="text-lg">
        {title.includes('生日') ? '🎂' : title.includes('在一起') ? '💕' : '✨'}
      </span>
      <span className="text-sm text-stone-600">{title}</span>
      <span className="font-bold text-amber-600">
        {type === 'countup' ? `${days}天` : `${days}天后`}
      </span>
    </div>
  )
}
