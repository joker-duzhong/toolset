import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/utils/cn";
import { Gift, Dices, Lightbulb, Sparkles } from "lucide-react";
import { WishlistCard, WishlistAddModal, FloatingAddButton } from "../components/WishlistCard";
import { RouletteWheel, RouletteOptions, CategorySelector } from "../components/RouletteWheel";
import type { WishlistItem, RouletteOption } from "../types";

type SubTab = "wish" | "roulette";

interface WishViewProps {
  wishlist: WishlistItem[];
  rouletteOptions: RouletteOption[];
  currentUserId: number;
  onAddWish: (item: { title: string; url?: string; price?: number; image_url?: string; description?: string }) => void;
  onClaimWish: (id: number) => void;
  onFulfillWish: (id: number) => void;
  onDeleteWish: (id: number) => void;
  onAddRouletteOption: (title: string, category: "food" | "place" | "other") => void;
  onDeleteRouletteOption: (id: number) => void;
}

// 页面切换动画
const pageVariants: Variants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

// 列表交错动画
const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function WishView({ wishlist, rouletteOptions, currentUserId, onAddWish, onClaimWish, onFulfillWish, onDeleteWish, onAddRouletteOption, onDeleteRouletteOption }: WishViewProps) {
  const [activeTab, setActiveTab] = useState<SubTab>("wish");
  const [showAddWishModal, setShowAddWishModal] = useState(false);
  const [rouletteCategory, setRouletteCategory] = useState<"food" | "place" | "other">("food");

  // 最佳实践：使用 useMemo 缓存派生状态，避免不必要的重新计算
  const activeWishes = useMemo(() => {
    return wishlist.filter((w) => w.status === "unclaimed" || w.status === "claimed");
  }, [wishlist]);

  return (
    <div className="min-h-full pb-24 bg-[#FDFBF7]">
      {/* 顶部 Tab 切换 - 悬浮奶油风 */}
      <div className="sticky top-0 z-20 pt-4 pb-4 px-4 bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent backdrop-blur-sm">
        <div className="relative flex p-1.5 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm border border-stone-100">
          {(["wish", "roulette"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.75rem] text-sm font-bold transition-colors z-10", isActive ? "text-stone-800" : "text-stone-400 hover:text-stone-600")}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white rounded-[1.75rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab === "wish" ? (
                    <Gift
                      size={18}
                      className={isActive ? "text-rose-400" : ""}
                    />
                  ) : (
                    <Dices
                      size={18}
                      className={isActive ? "text-amber-500" : ""}
                    />
                  )}
                  {tab === "wish" ? "心愿单" : "小转盘"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === "wish" ? (
            <motion.div
              key="wish"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <WishSection
                wishes={activeWishes}
                currentUserId={currentUserId}
                onClaim={onClaimWish}
                onFulfill={onFulfillWish}
                onDelete={onDeleteWish}
              />
            </motion.div>
          ) : (
            <motion.div
              key="roulette"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <RouletteSection
                options={rouletteOptions}
                category={rouletteCategory}
                onCategoryChange={setRouletteCategory}
                onAddOption={onAddRouletteOption}
                onDeleteOption={onDeleteRouletteOption}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 悬浮添加按钮 */}
      <AnimatePresence>
        {activeTab === "wish" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-6 z-30"
          >
            <FloatingAddButton onClick={() => setShowAddWishModal(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <WishlistAddModal
        open={showAddWishModal}
        onClose={() => setShowAddWishModal(false)}
        onSubmit={onAddWish}
      />
    </div>
  );
}

// ================= 心愿单部分 =================
interface WishSectionProps {
  wishes: WishlistItem[];
  currentUserId: number;
  onClaim: (id: number) => void;
  onFulfill: (id: number) => void;
  onDelete: (id: number) => void;
}

function WishSection({ wishes, currentUserId, onClaim, onFulfill, onDelete }: WishSectionProps) {
  return (
    <div className="space-y-6 pt-2">
      {/* 温馨提示卡片 */}
      <div className="relative overflow-hidden bg-[#FFF5F6] rounded-[2rem] p-5 border border-rose-100/50 shadow-sm">
        <div className="absolute -right-4 -top-4 opacity-40">
          <Sparkles
            size={80}
            className="text-rose-200"
          />
        </div>
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <Lightbulb
              size={20}
              className="text-rose-400"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-1">给 Ta 留一点小暗示</h3>
            <p className="text-xs text-stone-500 leading-relaxed">偷偷加进心愿单，认领后会保持神秘，把日常的期待变成浪漫的惊喜！</p>
          </div>
        </div>
      </div>

      {/* 列表渲染 */}
      {wishes.length > 0 ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {wishes.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              layout
              className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100 transition-all hover:shadow-md"
            >
              <WishlistCard
                item={item}
                isMine={item.creator_uid === currentUserId}
                onClaim={onClaim}
                onFulfill={onFulfill}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* 空状态 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-60" />
            <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-100">
              <Gift
                size={32}
                className="text-rose-300"
              />
            </div>
          </div>
          <h3 className="text-stone-700 font-bold mb-2">还没有许下心愿哦</h3>
          <p className="text-sm text-stone-400">点击右下角，种下第一个小期待吧～</p>
        </motion.div>
      )}
    </div>
  );
}

// ================= 转盘部分 =================
interface RouletteSectionProps {
  options: RouletteOption[];
  category: "food" | "place" | "other";
  onCategoryChange: (category: "food" | "place" | "other") => void;
  onAddOption: (title: string, category: "food" | "place" | "other") => void;
  onDeleteOption: (id: number) => void;
}

function RouletteSection({ options, category, onCategoryChange, onAddOption, onDeleteOption }: RouletteSectionProps) {
  return (
    <div className="space-y-6 pt-2">
      {/* 提示卡片 */}
      <div className="relative overflow-hidden bg-[#FFF9F0] rounded-[2rem] p-5 border border-amber-100/50 shadow-sm">
        <div className="absolute -right-4 -top-4 opacity-40">
          <Dices
            size={80}
            className="text-amber-200"
          />
        </div>
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <Dices
              size={20}
              className="text-amber-500"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-700 mb-1">选择困难症福音</h3>
            <p className="text-xs text-stone-500 leading-relaxed">不知道今天吃什么、去哪里玩？让命运的齿轮转动起来帮你决定吧！</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100">
        <CategorySelector
          value={category}
          onChange={onCategoryChange}
        />
        <div className="mt-8 mb-4">
          <RouletteWheel
            key={category}
            options={options}
            category={category}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100">
        <RouletteOptions
          options={options}
          category={category}
          onAdd={(title: string) => onAddOption(title, category)}
          onDelete={onDeleteOption}
        />
      </div>
    </div>
  );
}
