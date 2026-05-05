// 我们视图 - 整合说明书、纪念日、设置
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Calendar, Settings, BookOpen, User } from 'lucide-react'
import { ManualCard, AvatarSwitcher } from '../components/ManualSection'
import type { HomeData, UserManual } from '../types'

interface UsViewProps {
  homeData: HomeData
  myManual: UserManual
  partnerManual: UserManual
  onUpdateManual: (data: Partial<UserManual>) => void
  onManageAnniversaries: () => void
}

export function UsView({
  homeData,
  myManual,
  partnerManual,
  onUpdateManual,
  onManageAnniversaries,
}: UsViewProps) {
  const [manualView, setManualView] = useState<'mine' | 'partner'>('mine')

  const isMine = manualView === 'mine'
  const currentManual = isMine ? myManual : partnerManual
  const { together_days, upcoming_anniversaries } = homeData

  return (
    <div className="min-h-full bg-[#FDFBF7] pb-24">
      {/* 顶部关系名片 */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-violet-50 to-transparent pt-4 pb-6">
        <div className="px-4">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-stone-800">我们</h1>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white rounded-full shadow-sm border border-stone-100"
            >
              <Settings size={18} className="text-stone-500" />
            </motion.button>
          </div>

          {/* 关系卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-violet-100/50 relative overflow-hidden"
          >
            {/* 背景装饰 */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-violet-50 rounded-full blur-2xl opacity-60" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-rose-50 rounded-full blur-2xl opacity-60" />

            <div className="relative flex flex-col items-center">
              {/* 双人头像 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
                  <User size={28} className="text-amber-600" />
                </div>
                <div className="flex flex-col items-center">
                  <Heart size={20} className="text-rose-400 fill-rose-400 mb-1" />
                  <span className="text-xs text-stone-400 font-medium">{together_days} 天</span>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shadow-sm">
                  <User size={28} className="text-rose-600" />
                </div>
              </div>

              {/* 在一起天数 */}
              <p className="text-sm text-stone-600 font-medium">
                在一起的第 <span className="text-rose-500 font-bold">{together_days}</span> 天
              </p>
              <p className="text-xs text-stone-400 mt-1">每一天都值得纪念 ✨</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="px-4 space-y-6">
        {/* 说明书档案 */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <BookOpen size={18} className="text-violet-400" />
            <h2 className="text-sm font-bold text-stone-700">说明书档案</h2>
          </div>

          {/* 切换器 */}
          <div className="mb-4">
            <AvatarSwitcher current={manualView} onChange={setManualView} />
          </div>

          {/* 说明书内容 */}
          <ManualCard
            manual={currentManual}
            isOwner={isMine}
            onUpdate={onUpdateManual}
          />
        </section>

        {/* 纪念日时间轴 */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-rose-400" />
              <h2 className="text-sm font-bold text-stone-700">纪念日时间轴</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onManageAnniversaries}
              className="text-xs text-rose-500 font-medium"
            >
              管理
            </motion.button>
          </div>

          {/* 即将到来的纪念日 */}
          {upcoming_anniversaries.length > 0 ? (
            <div className="space-y-3">
              {upcoming_anniversaries.slice(0, 3).map((item) => (
                <motion.div
                  key={item.anniversary.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={onManageAnniversaries}
                  className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm cursor-pointer hover:border-rose-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-stone-700">
                          {item.anniversary.title}
                        </span>
                        {item.days_until <= 7 && (
                          <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold">
                            即将到来
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400">
                        {item.anniversary.target_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-rose-500">
                        {item.days_until}
                      </p>
                      <p className="text-[10px] text-stone-400">天后</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onManageAnniversaries}
              className="w-full bg-white rounded-2xl p-6 border-2 border-dashed border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2 text-rose-400">
                <Calendar size={24} />
                <span className="text-sm font-medium">添加第一个纪念日</span>
                <span className="text-xs text-stone-400">记录你们的重要时刻</span>
              </div>
            </motion.button>
          )}
        </section>

        {/* 底部装饰 */}
        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <span>📖</span>
            <span>了解彼此，珍惜彼此</span>
            <span>💕</span>
          </div>
        </div>
      </div>
    </div>
  )
}
