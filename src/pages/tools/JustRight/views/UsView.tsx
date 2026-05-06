import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ManualCard } from "../components/ManualSection";
import type { HomeData, UserManual } from "../types";

interface UsViewProps {
  homeData: HomeData;
  myManual: UserManual;
  partnerManual: UserManual;
  onUpdateManual: (data: Partial<UserManual>) => void;
  onManageAnniversaries: () => void;
}

// SVG 图标组件 (尽量还原设计图风格)
const Icons = {
  Settings: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#666"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  ),
  Back: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
      <path
        d="M19 12H9"
        strokeDasharray="2 2"
        strokeWidth="1"
      />
    </svg>
  ),
  Book: () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4A90E2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 2v20" />
    </svg>
  ),
  Pen: () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF7A59"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF8A65"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

export function UsView({ homeData, myManual, partnerManual, onUpdateManual, onManageAnniversaries }: UsViewProps) {
  // 控制说明书的展示 (全屏模态框)
  const [activeManual, setActiveManual] = useState<"mine" | "partner" | null>(null);

  const { upcoming_anniversaries } = homeData;
  const closestAnniversary = upcoming_anniversaries?.[0];

  return (
    <div className="min-h-[100%] bg-[#FAFAFA] font-sans relative overflow-hidden">
      {/* --- 顶部区域 --- */}
      <div className="pt-4 px-5 relative">
        {/* 背景光晕装饰 */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#FFF0E5] to-transparent opacity-60 z-0" />
      </div>

      <div className="px-5 space-y-8 relative z-10">
        {/* --- 说明书入口 (设计图双卡片结构) --- */}
        <section>
          <h2 className="text-[#333] text-[15px] font-bold mb-4 ml-1">Ta的说明书</h2>
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveManual("partner")}
              className="flex-1 bg-[#F5F8FF] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border border-[#E5EDFF] shadow-sm"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Icons.Book />
              </div>
              <div className="text-center">
                <div className="font-bold text-[#333] text-sm">查阅</div>
                <div className="text-[#4A90E2] text-xs mt-0.5">Ta的说明书</div>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveManual("mine")}
              className="flex-1 bg-[#FFF6F4] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border border-[#FFE8E3] shadow-sm"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Icons.Pen />
              </div>
              <div className="text-center">
                <div className="font-bold text-[#333] text-sm">编写</div>
                <div className="text-[#FF7A59] text-xs mt-0.5">我的说明书</div>
              </div>
            </motion.button>
          </div>
        </section>

        {/* --- 纪念日时间轴入口预览 --- */}
        <section>
          <div className="flex items-center justify-between mb-4 ml-1">
            <h2 className="text-[#333] text-[15px] font-bold">纪念日时间轴</h2>
            <button
              onClick={onManageAnniversaries}
              className="p-1 bg-[#FFF0E5] rounded-full"
            >
              <Icons.Plus />
            </button>
          </div>

          {closestAnniversary ? (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={onManageAnniversaries}
              className="bg-gradient-to-r from-[#FFF6F4] to-[#FFF0F0] rounded-2xl p-5 border border-[#FFE8E3] relative overflow-hidden shadow-sm"
            >
              <div className="absolute right-2 bottom-2 opacity-50 text-6xl">{closestAnniversary.anniversary.icon || "✨"}</div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{closestAnniversary.anniversary.icon || "✨"}</span>
                  <span className="font-bold text-[#333]">{closestAnniversary.anniversary.title}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[#FF7A59] text-sm font-medium">还有</span>
                  <span className="text-3xl font-bold text-[#FF7A59]">{closestAnniversary.days_until}</span>
                  <span className="text-[#FF7A59] text-sm font-medium">天</span>
                </div>
                <p className="text-[#999] text-xs">{closestAnniversary.anniversary.target_date}</p>
              </div>
            </motion.div>
          ) : (
            <div
              onClick={onManageAnniversaries}
              className="bg-white rounded-2xl p-6 text-center border border-dashed border-[#FFB6C1] text-[#999] text-sm"
            >
              点击添加第一个纪念日吧 ~
            </div>
          )}
        </section>
      </div>

      {/* --- 全屏说明书弹窗 --- */}
      <AnimatePresence>
        {activeManual && (
          <ManualCard
            manual={activeManual === "mine" ? myManual : partnerManual}
            isOwner={activeManual === "mine"}
            onClose={() => setActiveManual(null)}
            onUpdate={onUpdateManual}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
