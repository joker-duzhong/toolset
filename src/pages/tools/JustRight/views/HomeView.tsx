import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, ChevronRight, Clock, Smile } from "lucide-react";
import { FridgeBoard, FridgeNote } from "../components/FridgeNote";
import { MoodIndicator, MoodPicker, getMoodLabel, isForgiveMood } from "../components/MoodIndicator";
import { ProfileEditModal } from "../components/ProfileEditModal";
import { WhiteFlagAnimation } from "../components/WhiteFlag";
import type { ExtraInfo, HomeData, UserManual, UserState } from "../types";

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

type ProfileInfo = ExtraInfo & {
  avatar?: string;
  nickname?: string;
  gender?: string;
};

function readProfile(manual: UserManual): ProfileInfo {
  return manual.extra_info || {};
}

function getProfileName(profile: ProfileInfo, fallback: string) {
  return typeof profile.nickname === "string" && profile.nickname.trim() ? profile.nickname.trim() : fallback;
}

const moodFallbackNotes: Record<NonNullable<UserState["mood"]>, { me: string; partner: string }> = {
  happy: { me: "今天心情亮晶晶~", partner: "今天心情亮晶晶~" },
  sad: { me: "需要一点点安慰", partner: "Ta需要一点点安慰" },
  angry: { me: "现在有点火大", partner: "Ta现在有点火大" },
  tired: { me: "电量不足，需要休息", partner: "Ta电量不足，需要休息" },
  sick: { me: "身体不舒服，想被照顾", partner: "Ta身体不舒服，想被照顾" },
  love: { me: "突然很想你", partner: "Ta正在想你" },
  period: { me: "需要更多温柔照顾", partner: "Ta需要更多温柔照顾" },
  forgive: { me: "想认真求个原谅", partner: "正在认真求原谅" },
};

function getMoodFallbackNote(mood: UserState["mood"], owner: "me" | "partner") {
  return mood ? moodFallbackNotes[mood][owner] : "";
}

// 纯手绘的跳动红心 Icon（契合设计图的柔和浅珊瑚红）
const FloatingHeartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="#FF8A7A"
      filter="drop-shadow(0 2px 4px rgba(255, 138, 122, 0.3))"
    />
  </svg>
);

// 纯手绘的日历小图标（替换原有的 CalendarBadgeIcon）
const MiniCalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
    />
    <line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
    />
  </svg>
);

function AvatarIllustration({ tone }: { tone: "warm" | "cool" }) {
  const colors = tone === "warm" ? { bg: "#FFE0B8", hair: "#F0A45E", face: "#FFD7B0", blush: "#FF9D8B", shirt: "#FFEFE7" } : { bg: "#BDE8EA", hair: "#C98658", face: "#FFD2AA", blush: "#FF9D8B", shirt: "#EAF6FF" };

  return (
    <svg
      viewBox="0 0 96 96"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="48"
        cy="48"
        r="48"
        fill={colors.bg}
      />
      <path
        d="M25 76c4-14 13-22 23-22s19 8 23 22c-6 6-14 9-23 9s-17-3-23-9Z"
        fill={colors.shirt}
      />
      <circle
        cx="48"
        cy="43"
        r="22"
        fill={colors.face}
      />
      <path
        d="M26 39c3-17 15-27 29-23 11 3 18 12 18 25-8-7-18-10-29-8-7 1-13 3-18 6Z"
        fill={colors.hair}
      />
      <circle
        cx="39"
        cy="45"
        r="2.5"
        fill="#7A4F3A"
      />
      <circle
        cx="57"
        cy="45"
        r="2.5"
        fill="#7A4F3A"
      />
      <path
        d="M41 56c4 4 10 4 14 0"
        stroke="#F36E5E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="33"
        cy="53"
        r="4"
        fill={colors.blush}
        opacity=".35"
      />
      <circle
        cx="63"
        cy="53"
        r="4"
        fill={colors.blush}
        opacity=".35"
      />
    </svg>
  );
}

function CoupleAvatar({ profile, tone, fallbackName, onClick }: { profile: ProfileInfo; tone: "warm" | "cool"; fallbackName: string; onClick?: () => void }) {
  const avatar = typeof profile.avatar === "string" ? profile.avatar : "";
  const name = getProfileName(profile, fallbackName);
  const content = (
    <>
      <div className="rounded-full border-[5px] border-white bg-white p-1 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
        <div className="h-[74px] w-[74px] overflow-hidden rounded-full bg-white">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <AvatarIllustration tone={tone} />
          )}
        </div>
      </div>
      <span className="mt-2 max-w-[82px] truncate text-center text-[11px] font-bold text-stone-500">{name}</span>
    </>
  );
  const className = "flex flex-col items-center rounded-full outline-none transition-transform active:scale-95";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label="编辑我的基本信息"
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

interface HomeViewProps {
  data: HomeData;
  myState: UserState;
  partnerState: UserState;
  myManual: UserManual;
  partnerManual: UserManual;
  onUpdateMood: (mood: UserState["mood"], moodNote?: string) => void;
  onUpdateFridgeNote: (note: string) => void;
  onUpdateManual: (data: Partial<UserManual>) => Promise<void> | void;
  onManageAnniversaries: () => void;
}

export function HomeView({ data, myState, partnerState, myManual, partnerManual, onUpdateMood, onUpdateFridgeNote, onUpdateManual, onManageAnniversaries }: HomeViewProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [, setNow] = useState(() => Date.now());
  const [showWhiteFlagAnimation, setShowWhiteFlagAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const { couple, together_days, upcoming_anniversaries, state } = data;
  const myProfile = readProfile(myManual);
  const partnerProfile = readProfile(partnerManual);

  useEffect(() => {
    if (isForgiveMood(partnerState.mood)) {
      setShowWhiteFlagAnimation(true);
    }
  }, [partnerState.mood, partnerState.updated_at]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-full pb-28 pt-6 px-5 space-y-7 bg-[#FFF8F7]" // 还原背景色
    >
      {/* 头像与在一起天数 */}

      <div className="relative z-10 pt-8 pb-4">
        {/* 左上角纪念日日期标签 - 优化为毛玻璃轻拟物风格 */}
        <div className="absolute left-0 -top-2 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/50 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-[#888] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <MiniCalendarIcon />
          <span>{couple.anniversary_date || "-"}</span>
        </div>

        {/* 主体排版：横向排列 (头像 - 中间核心数据 - 头像) */}
        <div className="flex items-center justify-between px-2 mt-4">
          {/* 左侧头像 (我) */}
          <div className="relative flex-shrink-0">
            {/* 暖橘色背景光晕 */}
            <div className="absolute inset-0 bg-[#FFF0E5] blur-lg rounded-full scale-[1.18] opacity-80" />
            <div className="relative z-10 w-[88px] h-[88px] rounded-full border-[3px] border-white shadow-sm overflow-hidden bg-[#FFDAB9]">
              <CoupleAvatar
                profile={myProfile}
                tone="warm"
                fallbackName="我"
                onClick={() => setShowProfileEditor(true)}
              />
            </div>
          </div>

          {/* 中间核心信息区 */}
          <div className="flex flex-col items-center justify-center -mt-2">
            {/* 顶部悬浮跳动的爱心 */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="mb-1.5 drop-shadow-sm"
            >
              <FloatingHeartIcon />
            </motion.div>

            {/* 巨大的天数数字 (使用深褐色 #382B26 契合设计图) */}
            <div className="text-[46px] font-extrabold text-[#382B26] leading-none tracking-tight mb-2 drop-shadow-sm font-sans">{together_days}</div>

            {/* 底部小字 */}
            <p className="text-[13px] text-[#999] font-medium tracking-wide">我们在一起</p>
          </div>

          {/* 右侧头像 (Ta) */}
          <div className="relative flex-shrink-0">
            {/* 偏冷/浅蓝背景光晕 */}
            <div className="absolute inset-0 bg-[#F0F8FF] blur-lg rounded-full scale-[1.18] opacity-80" />
            <div className="relative z-10 w-[88px] h-[88px] rounded-full border-[3px] border-white shadow-sm overflow-hidden bg-[#B0E0E6]">
              <CoupleAvatar
                profile={partnerProfile}
                tone="cool"
                fallbackName="Ta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 心情卡片区块 */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-2 gap-4"
      >
        {/* 我的心情 (偏暖色) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMoodPicker(true)}
          className="bg-white/80 rounded-[2rem] p-5 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(255,155,130,0.1)] border border-rose-50 cursor-pointer min-h-[160px]"
        >
          <span className="text-sm font-bold text-[#FF8A65] mb-4">我</span>
          {myState.mood ? (
            <div className="flex flex-col items-center">
              <MoodIndicator
                mood={myState.mood}
                size="lg"
              />
              <span className="text-sm font-bold text-stone-700 mt-3">{getMoodLabel(myState.mood)}</span>
              <span className="text-[10px] text-stone-400 mt-1 line-clamp-1">{myState.mood_note || getMoodFallbackNote(myState.mood, "me")}</span>
              <span className="text-[9px] text-stone-300 mt-1">刚刚 更新</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-stone-300">
              <Smile
                size={32}
                className="mb-2 opacity-50"
              />
              <span className="text-xs">点击记录心情</span>
            </div>
          )}
        </motion.div>

        {/* Ta的心情 (偏冷色) */}
        <div className="bg-white/80 rounded-[2rem] p-5 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(156,195,255,0.15)] border border-blue-50 min-h-[160px]">
          <span className="text-sm font-bold text-[#8BA7D5] mb-4">Ta</span>
          {partnerState.mood ? (
            <div className="flex flex-col items-center">
              <MoodIndicator
                mood={partnerState.mood}
                size="lg"
              />
              <span className="text-sm font-bold text-stone-700 mt-3">{getMoodLabel(partnerState.mood)}</span>
              <span className="text-[10px] text-stone-400 mt-1 line-clamp-1">{partnerState.mood_note || getMoodFallbackNote(partnerState.mood, "partner")}</span>
              <span className="text-[9px] text-stone-300 mt-1">刚刚 更新</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-stone-300">
              <Clock
                size={32}
                className="mb-2 opacity-50"
              />
              <span className="text-xs">等待Ta的更新</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* 3. 我们的冰箱贴 */}
      <motion.section variants={itemVariants}>
        <h2 className="text-[15px] font-bold text-stone-800 mb-3 ml-2">我们的冰箱贴</h2>
        {/* 软木板边框设计 */}
        <div className="bg-[#FAF6F0] rounded-[1.75rem] p-4 border-[6px] border-[#EADAC5] shadow-[inset_0_2px_8px_rgba(139,105,70,0.08),0_10px_22px_rgba(139,105,70,0.08)] relative overflow-hidden">
          {/* 软木板图钉装饰 */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-stone-300 shadow-sm" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-stone-300 shadow-sm" />

          <FridgeBoard>
            <FridgeNote
              content={state.fridge_note || ""}
              author="我"
              onChange={onUpdateFridgeNote}
            />
          </FridgeBoard>
        </div>
      </motion.section>

      {/* 4. 即将到来的纪念日 (列表样式) */}
      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-end mb-4 ml-2 mr-1">
          <h2 className="text-[15px] font-bold text-stone-800">即将到来的纪念日</h2>
          <button
            onClick={onManageAnniversaries}
            className="flex items-center text-xs text-stone-400 hover:text-stone-600"
          >
            全部 <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {upcoming_anniversaries.length > 0 ? (
            upcoming_anniversaries.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/60 p-3 px-4 rounded-2xl border border-rose-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <span className="text-lg leading-none">{item.anniversary.icon || "✨"}</span>
                  </div>
                  <span className="text-sm font-bold text-stone-700">{item.anniversary.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-stone-500 font-medium">
                    还有 <span className="text-rose-500 font-bold text-sm">{item.days_until}</span> 天
                  </span>
                  <span className="text-xs text-stone-400 w-10 text-right">
                    {/* 假设有日期字段，若无则展示占位 */}
                    {item.anniversary.target_date ? item.anniversary.target_date.substring(5).replace("-", ".") : "近期"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              onClick={onManageAnniversaries}
              className="flex items-center justify-center py-6 bg-white/60 rounded-2xl border border-dashed border-rose-200 text-sm text-stone-400 cursor-pointer"
            >
              + 添加你们的第一个纪念日
            </div>
          )}
        </div>
      </motion.section>

      <ProfileEditModal
        isOpen={showProfileEditor}
        manual={myManual}
        onClose={() => setShowProfileEditor(false)}
        onSave={onUpdateManual}
      />

      {/* 心情选择弹窗 */}
      <AnimatePresence>
        {showMoodPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoodPicker(false)}
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFF8F7] rounded-t-[2.5rem] p-6 pb-12 z-[70] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-stone-800">此刻的心情如何？</h3>
                <button
                  onClick={() => setShowMoodPicker(false)}
                  className="p-2 bg-stone-200/50 rounded-full text-stone-500"
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

      {/* 求原谅全屏动画 */}
      {showWhiteFlagAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/20 backdrop-blur-md">
          <WhiteFlagAnimation onClose={() => setShowWhiteFlagAnimation(false)} />
        </div>
      )}
    </motion.div>
  );
}
