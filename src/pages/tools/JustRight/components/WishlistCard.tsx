import { useState } from "react";
import { Link2, Copy, Gift, Check, Plus, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { WishlistItem } from "../types";
import { cn } from "@/utils/cn";

interface WishlistCardProps {
  item: WishlistItem;
  isMine: boolean;
  onClaim: (id: number) => void;
  onFulfill: (id: number) => void;
  onDelete: (id: number) => void;
}

export function WishlistCard({ item, isMine, onClaim, onFulfill, onDelete }: WishlistCardProps) {
  const isClaimed = item.status === "claimed";
  const isFulfilled = item.status === "fulfilled";
  const showClaimedHint = isMine && isClaimed;

  const [copiedState, setCopiedState] = useState<"title" | "link" | null>(null);

  const handleCopy = (text: string, type: "title" | "link") => {
    if (!text) return;
    const performCopy = () => {
      setCopiedState(type);
      setTimeout(() => setCopiedState(null), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(performCopy)
        .catch(() => fallbackCopy(text, performCopy));
    } else {
      fallbackCopy(text, performCopy);
    }
  };

  const fallbackCopy = (text: string, callback: () => void) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      callback();
    } catch (_err) {}
    document.body.removeChild(textArea);
  };

  return (
    <div className="relative overflow-hidden flex flex-col group/card">
      {/* --- 右上角取消按钮 (仅在自己创建且未被认领时显示) --- */}
      {isMine && !isClaimed && !isFulfilled && (
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-0 right-0 z-20 p-2 text-stone-500 hover:text-rose-400 transition-colors"
          title="取消心愿"
        >
          <div className="bg-stone-50/80 text-stone-500 text-xs">取消心愿</div>
        </button>
      )}

      {/* 水印背景 */}
      {!item.image_url && (
        <div className="absolute -right-6 -top-6 opacity-[0.03] pointer-events-none select-none">
          <Gift size={120} />
        </div>
      )}

      {/* 图片部分 */}
      {item.image_url && (
        <div className="w-full aspect-[4/3] rounded-2xl mb-4 bg-stone-50 overflow-hidden relative border border-stone-100/50">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* 内容主体 */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* 标题区：预留右侧空间给删除按钮 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            onClick={() => handleCopy(item.title, "title")}
            className={cn(
              "flex items-center gap-2 group cursor-pointer",
              isMine && !isClaimed ? "pr-6" : "", // 为右上角按钮预留内边距
            )}
          >
            <h4 className="font-bold text-stone-800 text-lg leading-snug line-clamp-2 decoration-stone-300 decoration-dashed underline-offset-4 group-hover:underline">{item.title}</h4>
            {copiedState === "title" ? (
              <span className="text-[10px] text-emerald-500 font-bold shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">已复制</span>
            ) : (
              <Copy
                size={14}
                className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            )}
          </div>
        </div>

        {/* 价格与链接行 */}
        <div className="flex items-center justify-between min-h-[40px]">
          {item.price ? (
            <div className="inline-flex items-baseline gap-0.5 px-3 py-1.5 bg-rose-50/60 rounded-xl border border-rose-100/50">
              <span className="text-rose-400 font-bold text-sm">¥</span>
              <span className="text-rose-500 font-black text-xl tracking-tight leading-none">{item.price}</span>
            </div>
          ) : (
            <div className="text-xs text-stone-400 font-medium px-1 italic">期待一份惊喜...</div>
          )}

          {item.url && (
            <button
              onClick={() => handleCopy(item.url!, "link")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold border shadow-sm", copiedState === "link" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white hover:bg-stone-50 text-stone-600 border-stone-100")}
            >
              {copiedState === "link" ? (
                <>
                  <Check
                    size={14}
                    strokeWidth={3}
                  />
                  <span>已复制链接</span>
                </>
              ) : (
                <>
                  <Link2
                    size={14}
                    className="text-stone-400"
                  />
                  <span>商品链接</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 底部状态与操作区 */}
        <div className="mt-auto">
          {(showClaimedHint || isFulfilled || isClaimed) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {showClaimedHint ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-500 bg-rose-50/80 px-3 py-1.5 rounded-full border border-rose-100">
                  <Heart
                    size={12}
                    className="fill-rose-500"
                  />{" "}
                  Ta 已暗中准备
                </span>
              ) : isFulfilled ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <Check
                    size={12}
                    strokeWidth={3}
                  />{" "}
                  心愿已达成 ✨
                </span>
              ) : isClaimed ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Gift size={12} /> 惊喜准备中...
                </span>
              ) : null}
            </div>
          )}

          {/* 交互按钮 (仅对方可见) */}
          <div className="flex gap-2">
            {!isMine && !isClaimed && !isFulfilled && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onClaim(item.id)}
                className="flex-1 py-3.5 bg-[#1C1C1E] text-white rounded-[1.25rem] text-sm font-bold shadow-md shadow-stone-200 flex items-center justify-center gap-2"
              >
                <Gift size={16} />
                我来准备
              </motion.button>
            )}

            {!isMine && isClaimed && !isFulfilled && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onFulfill(item.id)}
                className="flex-1 py-3.5 bg-emerald-50 text-emerald-600 rounded-[1.25rem] text-sm font-bold border border-emerald-100 flex items-center justify-center gap-2"
              >
                <Check
                  size={16}
                  strokeWidth={3}
                />
                已就绪
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// ================= 心愿添加弹窗 =================
interface WishlistAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: { title: string; url?: string; price?: number; image_url?: string }) => void;
}

export function WishlistAddModal({ open, onClose, onSubmit }: WishlistAddModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        url: url.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
      });
      setTitle("");
      setUrl("");
      setPrice("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 毛玻璃背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-stone-900/20 backdrop-blur-sm"
          />

          {/* 底部抽屉 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[2.5rem] px-6 pt-4 pb-10 shadow-2xl"
          >
            {/* 拖拽指示条 */}
            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6" />

            <div className="flex items-center gap-2 mb-6">
              <Sparkles
                size={20}
                className="text-rose-400 fill-rose-100"
              />
              <h3 className="text-lg font-bold text-stone-800">许下新的心愿</h3>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="想要什么礼物或体验？"
                className="w-full px-5 py-4 bg-[#FDFBF7] rounded-2xl border border-stone-100 text-stone-700 placeholder:text-stone-400 font-medium focus:border-rose-300 focus:bg-white focus:outline-none transition-all"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="预估价格 (选填)"
                  className="w-full px-5 py-4 bg-[#FDFBF7] rounded-2xl border border-stone-100 text-stone-700 placeholder:text-stone-400 text-sm focus:border-rose-300 focus:bg-white focus:outline-none transition-all"
                />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="商品链接 (选填)"
                  className="w-full px-5 py-4 bg-[#FDFBF7] rounded-2xl border border-stone-100 text-stone-700 placeholder:text-stone-400 text-sm focus:border-rose-300 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: title.trim() ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="w-full mt-8 py-4 bg-[#1C1C1E] text-white rounded-2xl font-bold text-base shadow-lg shadow-stone-200/50 disabled:opacity-40 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              放入心愿单 <Gift size={18} />
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ================= 浮动添加按钮 =================
export function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-[3.5rem] h-[3.5rem] bg-[#1C1C1E] text-white rounded-[1.25rem] shadow-lg shadow-stone-300/50 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform"
    >
      <Plus
        size={26}
        strokeWidth={2.5}
      />
    </motion.button>
  );
}
