import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Heart, Calendar, MessageCircle, Sparkles, X, Flag } from "lucide-react";
import { FridgeBoard, FridgeNote } from "../components/FridgeNote";
import { MoodIndicator, MoodPicker } from "../components/MoodIndicator";
import { WhiteFlagButton, WhiteFlagAnimation } from "../components/WhiteFlag";
import type { HomeData, UserState } from "../types";

// 动画变体
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

interface HomeViewProps {
  data: HomeData;
  myState: UserState;
  partnerState: UserState;
  onUpdateMood: (mood: UserState["mood"], moodNote?: string) => void;
  onUpdateFridgeNote: (note: string) => void;
  onRaiseFlag: () => void;
  onLowerFlag: () => void;
}

export function HomeView({ data, myState, partnerState, onUpdateMood, onUpdateFridgeNote, onRaiseFlag, onLowerFlag }: HomeViewProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const { together_days, upcoming_anniversaries, state } = data;
  const nextAnniversary = upcoming_anniversaries[0];

  const shouldShowWhiteFlag = useMemo(() => {
    const flag = partnerState.white_flag;
    if (!flag?.raised || !flag?.raised_at) return false;
    const raisedTime = new Date(flag.raised_at).getTime();
    return raisedTime > now - 60000;
  }, [partnerState.white_flag, now]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-full pb-24 pt-4 px-4 space-y-6 bg-[#FDFBF7]"
    >
      {/* 1. 顶部纪念日卡片 */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-white rounded-[2.5rem] p-6 shadow-sm border border-rose-100/50"
      >
        {/* 背景光晕 */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-80" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-60" />

        <div className="relative flex flex-col">
          {/* 顶部栏：左侧我们，右侧天数 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              <span className="text-lg leading-none">💕</span>
              <span className="text-sm font-bold text-stone-700">我们</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
              <Heart
                size={12}
                className="text-rose-400 fill-rose-400"
              />
              <span>在一起的第 {together_days} 天</span>
            </div>
          </div>

          {/* 中心大数字 */}
          <div className="flex flex-col items-center">
            <span className="text-7xl font-black text-[#F44380] tracking-tight leading-none mb-3">{together_days}</span>
            <span className="text-stone-500 font-medium text-sm mb-3">天了</span>
            <p className="text-stone-400 text-xs flex items-center gap-1">
              每一天都值得纪念{" "}
              <Sparkles
                size={12}
                className="text-amber-400 fill-amber-400"
              />
            </p>
          </div>

          {/* 下一个纪念日倒计时（保留了好看的组件） */}
          {nextAnniversary && (
            <div className="w-full bg-[#FFF9F9] rounded-2xl p-4 border border-rose-100/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={14}
                    className="text-rose-400"
                  />
                  <span className="text-xs font-bold text-stone-700">{nextAnniversary.anniversary.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-rose-200 text-rose-600 rounded-full font-bold">倒计时</span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-[10px] text-stone-400">我们将在这天迎来新的浪漫</p>
                <p className="text-xl font-bold text-rose-500">
                  {nextAnniversary.days_until}
                  <span className="text-xs ml-0.5">天</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      {/* 2. 今日心情同步 */}
      <motion.section
        variants={itemVariants}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <MessageCircle
              size={18}
              className="text-amber-500"
            />
            今日心情同步
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMoodPicker(true)}
            className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">🙋‍♀️</div>
              <span className="text-xs font-bold text-stone-600">我</span>
            </div>
            {myState.mood ? (
              <MoodIndicator
                mood={myState.mood}
                note={myState.mood_note}
                size="sm"
              />
            ) : (
              <div className="h-10 flex items-center justify-center border border-dashed border-stone-200 rounded-xl text-[10px] text-stone-400">点击同步</div>
            )}
          </motion.div>

          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">💁‍♂️</div>
              <span className="text-xs font-bold text-stone-600">Ta</span>
            </div>
            {partnerState.mood ? (
              <MoodIndicator
                mood={partnerState.mood}
                note={partnerState.mood_note}
                size="sm"
              />
            ) : (
              <div className="h-10 flex items-center justify-center text-[10px] text-stone-400 italic">保持好奇心...</div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showMoodPicker && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMoodPicker(false)}
                className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-4 right-4 bg-white rounded-[2.5rem] p-6 z-[70] shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-stone-800">此刻的心情如何？</h3>
                  <button
                    onClick={() => setShowMoodPicker(false)}
                    className="p-2 bg-stone-50 rounded-full text-stone-400"
                  >
                    <X size={16} />
                  </button>
                </div>
                <MoodPicker
                  value={myState.mood}
                  onChange={(mood) => {
                    onUpdateMood(mood);
                    setShowMoodPicker(false);
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.section>

      {/* 3. 冰箱贴留言 */}
      <motion.section variants={itemVariants}>
        <div className="bg-[#FAF7F2] rounded-[2.5rem] p-5 border border-stone-100">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <h3 className="text-sm font-bold text-stone-700 italic">爱的留言板</h3>
            </div>
          </div>
          <FridgeBoard>
            <FridgeNote
              content={state.fridge_note || ""}
              author="我"
              onChange={onUpdateFridgeNote}
            />
          </FridgeBoard>
        </div>
      </motion.section>

      {/* 4. 美化后的白旗卡片 */}
      <motion.section variants={itemVariants}>
        <div className="bg-white rounded-[2.5rem] p-5 border border-stone-100 shadow-sm relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute right-0 top-0 opacity-5 -rotate-12 translate-x-4 -translate-y-4">
            <Flag size={120} />
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-stone-700 mb-1">吵架了吗？</h3>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                爱情里没有输赢，只有珍惜。
                <br />
                举起白旗，给彼此一个温柔的台阶。
              </p>
            </div>

            <div className="shrink-0">
              <WhiteFlagButton
                raised={myState.white_flag?.raised || false}
                onRaise={onRaiseFlag}
                onLower={onLowerFlag}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 底部装饰 */}
      <motion.div
        variants={itemVariants}
        className="text-center pt-4 opacity-40"
      >
        <p className="text-[10px] font-medium text-stone-500 italic uppercase tracking-[0.2em]">Endless love in everyday life</p>
        <p className="text-[10px] font-medium text-stone-500 italic uppercase tracking-[0.2em]">晚饭吃啥不重要，恰好是你最重要 💕</p>
      </motion.div>

      {/* 全屏动画 */}
      {shouldShowWhiteFlag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/10 backdrop-blur-md">
          <WhiteFlagAnimation onClose={onLowerFlag} />
        </div>
      )}
    </motion.div>
  );
}
