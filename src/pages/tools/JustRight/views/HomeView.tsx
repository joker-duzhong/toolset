// 首页视图
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { FridgeBoard, FridgeNote } from '../components/FridgeNote'
import { MoodIndicator, MoodPicker, MoodAlertCard } from '../components/MoodIndicator'
import { WhiteFlagButton, WhiteFlagAnimation } from '../components/WhiteFlag'
import { CompactAnniversary } from '../components/AnniversaryCard'
import type { HomeData, UserState } from '../types'

interface HomeViewProps {
  data: HomeData
  myState: UserState
  partnerState: UserState
  currentUserId: number
  partnerId: number
  onUpdateMood: (mood: UserState['mood'], moodNote?: string) => void
  onUpdateFridgeNote: (note: string) => void
  onRaiseFlag: () => void
  onLowerFlag: () => void
}

export function HomeView({
  data,
  myState,
  partnerState,
  currentUserId,
  partnerId,
  onUpdateMood,
  onUpdateFridgeNote,
  onRaiseFlag,
  onLowerFlag,
}: HomeViewProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showWhiteFlag, setShowWhiteFlag] = useState(false)

  const { couple, together_days, upcoming_anniversaries, state } = data

  // 获取最近一个即将到来的纪念日
  const nextAnniversary = upcoming_anniversaries[0]

  // 检查是否需要显示白旗动画
  const shouldShowWhiteFlag =
    partnerState.white_flag?.raised &&
    partnerState.white_flag?.raised_at &&
    new Date(partnerState.white_flag.raised_at).getTime() > Date.now() - 60000 // 1分钟内

  return (
    <div className="min-h-full pb-6">
      {/* 顶部纪念日卡片 */}
      <div className="bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 rounded-b-[2rem] px-5 pt-4 pb-6 shadow-sm">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💕</span>
            <span className="font-medium text-stone-700">我们</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Heart size={12} className="text-rose-400 fill-rose-400" />
            在一起的第 {together_days} 天
          </div>
        </div>

        {/* 在一起天数 */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            {together_days}
          </div>
          <div className="text-sm text-stone-500 mt-1">天了</div>
          <div className="text-xs text-stone-400 mt-2">每一天都值得纪念 ✨</div>
        </div>

        {/* 即将到来的纪念日 */}
        {nextAnniversary && (
          <div className="flex justify-center mt-2">
            <CompactAnniversary
              title={nextAnniversary.anniversary.title}
              days={nextAnniversary.days_until}
              type="countdown"
            />
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="px-4 mt-5 space-y-5">
        {/* 心情状态区域 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-stone-700 flex items-center gap-2">
              <span>💭</span> 心情状态
            </h2>
          </div>

          {/* 双方心情卡片 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 我的心情 */}
            <div
              className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 cursor-pointer"
              onClick={() => setShowMoodPicker(!showMoodPicker)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  😊
                </div>
                <span className="text-sm text-stone-600">我</span>
              </div>
              {myState.mood ? (
                <MoodIndicator mood={myState.mood} note={myState.mood_note} size="sm" />
              ) : (
                <p className="text-xs text-stone-400">点击设置心情</p>
              )}
            </div>

            {/* Ta的心情 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  🥰
                </div>
                <span className="text-sm text-stone-600">Ta</span>
              </div>
              {partnerState.mood ? (
                <MoodIndicator mood={partnerState.mood} note={partnerState.mood_note} size="sm" />
              ) : (
                <p className="text-xs text-stone-400">暂未设置</p>
              )}
            </div>
          </div>

          {/* 心情选择器 */}
          {showMoodPicker && (
            <div className="mt-3 p-4 bg-white rounded-2xl shadow-sm border border-stone-100">
              <p className="text-sm text-stone-500 mb-3">选择我的心情</p>
              <MoodPicker
                value={myState.mood}
                onChange={(mood) => {
                  onUpdateMood(mood)
                  setShowMoodPicker(false)
                }}
              />
            </div>
          )}

          {/* Ta 的情绪预警 */}
          <div className="mt-3">
            <MoodAlertCard
              mood={partnerState.mood}
              note={partnerState.mood_note}
              partnerName="Ta"
            />
          </div>
        </section>

        {/* 冰箱贴留言 */}
        <section>
          <FridgeBoard>
            <FridgeNote
              content={state.fridge_note || ''}
              author="我"
              onChange={onUpdateFridgeNote}
            />
          </FridgeBoard>
        </section>

        {/* 快捷入口 */}
        <section className="grid grid-cols-2 gap-3">
          {/* 待办事项 */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">待办事项</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {data.pending_todos}
                </p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>

          {/* 心愿单 */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">心愿单</p>
                <p className="text-2xl font-bold text-pink-600 mt-1">
                  {data.upcoming_wishes}
                </p>
              </div>
              <span className="text-3xl">🎁</span>
            </div>
          </div>
        </section>

        {/* 白旗求和 */}
        <section className="flex items-center justify-center pt-4">
          <WhiteFlagButton
            raised={myState.white_flag?.raised || false}
            onRaise={onRaiseFlag}
            onLower={onLowerFlag}
          />
        </section>

        {/* 底部装饰 */}
        <div className="text-center pt-4">
          <p className="text-xs text-stone-300">
            晚饭吃啥不重要，恰好是你最重要 💕
          </p>
        </div>
      </div>

      {/* 白旗动画 */}
      {shouldShowWhiteFlag && (
        <WhiteFlagAnimation onClose={onLowerFlag} />
      )}
    </div>
  )
}
