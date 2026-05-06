import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Pin } from "lucide-react";
import type { MomentViewData } from "../types";
import { cn } from "@/utils/cn";
import { MomentMediaGrid } from "./MomentMediaGrid";
import { formatMomentTime } from "../utils/moments";

interface MomentCardProps {
  moment: MomentViewData;
  currentUserId: string;
  onOpenDetail: (id: string) => void;
  onToggleLike: (id: string) => void;
}

export function MomentCard({ moment, currentUserId, onOpenDetail, onToggleLike }: MomentCardProps) {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const isMyMoment = moment.creator_uid === currentUserId;
  const isLiked = moment.liked_by_me;
  const likeCount = moment.likes_count || 0;
  const images = moment.resources || [];
  const commentCount = moment.comments_count || 0;

  const handleDoubleTap = () => {
    if (!isLiked) {
      onToggleLike(moment.id);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
  };

  const handleLikeClick = () => {
    onToggleLike(moment.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onOpenDetail(moment.id)}
      className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-[22px] overflow-hidden">{isMyMoment ? "👧" : "🧑"}</div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-bold text-[#333333] leading-tight">{isMyMoment ? "我" : "Ta"}</p>
              {moment.is_pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3EE] px-2 py-0.5 text-[11px] font-medium text-[#FF8D6B]">
                  <Pin size={11} />
                  置顶
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-[#999999]">{formatMomentTime(moment.created_at)}</p>
          </div>
        </div>
      </div>

      {moment.content && (
        <button
          type="button"
          className="mb-3.5 block w-full text-left"
        >
          <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-[1.6] tracking-wide text-[#333333]">{moment.content}</p>
        </button>
      )}

      {images.length > 0 && (
        <div
          className="relative mb-4"
          onDoubleClick={handleDoubleTap}
        >
          <MomentMediaGrid images={images} />
          <AnimatePresence>
            {showLikeAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart
                  size={80}
                  className="text-[#FF9874] fill-[#FF9874]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLikeClick}
          className="flex items-center gap-1.5 text-[#CCCCCC] hover:text-[#FF9874] transition-colors"
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={cn("transition-all", isLiked && "text-[#FF9874] fill-[#FF9874]")}
          />
          <span className={cn("text-[14px] font-medium", isLiked ? "text-[#FF9874]" : "")}>{likeCount > 0 ? likeCount : ""}</span>
        </motion.button>

        <div className="flex items-center gap-4 text-[#CCCCCC]">
          <button
            type="button"
            onClick={() => onOpenDetail(moment.id)}
            className="flex items-center gap-1.5 hover:text-gray-500 transition-colors"
          >
            <MessageSquare
              size={19}
              strokeWidth={2}
            />
            <span className="text-[14px] font-medium">{commentCount > 0 ? commentCount : ""}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
