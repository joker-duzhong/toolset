import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, MessageSquare, Pin, PencilLine, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import type { MomentComment, MomentViewData } from "../types";
import { formatMomentDetailTime } from "../utils/moments";
import { MomentImageViewer } from "../components/MomentImageViewer";
import { MomentMediaGrid } from "../components/MomentMediaGrid";

interface MomentDetailViewProps {
  moment: MomentViewData;
  currentUserId: string;
  onBack: () => void;
  onDelete: (id: string) => Promise<void> | void;
  onEdit: (moment: MomentViewData) => void;
  onToggleLike: (id: string) => Promise<void> | void;
  onTogglePin: (id: string) => Promise<void> | void;
  onAddComment: (memoId: string, content: string) => Promise<void> | void;
  onUpdateComment: (memoId: string, commentId: string, content: string) => Promise<void> | void;
  onDeleteComment: (memoId: string, commentId: string) => Promise<void> | void;
}

function getCommentId(comment: MomentComment) {
  return comment.comment_id || comment.id || comment.uid;
}

export function MomentDetailView({
  moment,
  currentUserId,
  onBack,
  onDelete,
  onEdit,
  onToggleLike,
  onTogglePin,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: MomentDetailViewProps) {
  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState<MomentComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isMyMoment = moment.creator_uid === currentUserId;
  const isLiked = moment.liked_by_me;
  const likeCount = moment.likes_count || 0;
  const comments = moment.comments || [];

  const title = useMemo(() => (isMyMoment ? "我的时刻" : "Ta 的时刻"), [isMyMoment]);

  const handleSubmitComment = async () => {
    const content = comment.trim();
    if (!content) {
      toast.error("请输入评论内容");
      return;
    }

    try {
      setSubmitting(true);
      await onAddComment(moment.id, content);
      setComment("");
    } catch {
      toast.error("评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveComment = async () => {
    if (!editingComment) return;

    const content = editingCommentText.trim();
    if (!content) {
      toast.error("请输入评论内容");
      return;
    }

    try {
      setSubmitting(true);
      await onUpdateComment(moment.id, getCommentId(editingComment), content);
      setEditingComment(null);
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch {
      toast.error("修改评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (target: MomentComment) => {
    if (!window.confirm("确定删除这条评论吗？")) return;

    try {
      await onDeleteComment(moment.id, getCommentId(target));
    } catch {
      toast.error("删除评论失败");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("确定删除这条时刻吗？")) return;
    await onDelete(moment.id);
  };

  const handleToggleLike = async () => {
    await onToggleLike(moment.id);
  };

  const handleTogglePin = async () => {
    await onTogglePin(moment.id);
  };

  return (
    <div className="min-h-full bg-[#FAFAFA] pb-28">
      <div className="sticky top-0 z-20 bg-[#FAFAFA]/95 px-5 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft
              size={24}
              strokeWidth={2.5}
            />
          </button>

          <div className="text-[16px] font-semibold text-[#333333]">{title}</div>

          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-100 to-amber-50 text-[22px]">
                {isMyMoment ? "👩" : "🧑"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[17px] font-bold text-[#333333]">{isMyMoment ? "我" : "Ta"}</p>
                  {moment.is_pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3EE] px-2 py-0.5 text-[11px] font-medium text-[#FF8D6B]">
                      <Pin size={11} />
                      置顶
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[13px] text-[#999999]">{formatMomentDetailTime(moment.created_at)}</p>
              </div>
            </div>

            {isMyMoment && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(moment)}
                  className="flex items-center gap-1 rounded-full bg-[#FFF3EE] px-3 py-2 text-[13px] font-medium text-[#FF8D6B]"
                  aria-label="编辑时刻"
                >
                  <PencilLine size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePin}
                  className="flex items-center gap-1 rounded-full bg-[#F7F7F7] px-3 py-2 text-[13px] font-medium text-[#666666]"
                  aria-label="置顶时刻"
                >
                  <Pin size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 rounded-full bg-[#FFF1F1] px-3 py-2 text-[13px] font-medium text-[#F56C6C]"
                  aria-label="删除时刻"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {moment.content && <p className="mb-4 whitespace-pre-wrap text-[16px] leading-[1.7] text-[#333333]">{moment.content}</p>}

          {moment.resources?.length ? (
            <div className="mb-5">
              <MomentMediaGrid
                images={moment.resources}
                onImageClick={(index) => {
                  setViewerIndex(index);
                  setViewerOpen(true);
                }}
              />
            </div>
          ) : null}

          <div className="flex items-center gap-5 border-t border-[#F4F4F4] pt-4">
            <button
              type="button"
              onClick={handleToggleLike}
              className="flex items-center gap-1.5 text-[#999999] transition-colors hover:text-[#FF9874]"
            >
              <Heart
                size={19}
                className={cn(isLiked && "fill-[#FF9874] text-[#FF9874]")}
              />
              <span className={cn("text-[14px] font-medium", isLiked && "text-[#FF9874]")}>{likeCount > 0 ? likeCount : "点赞"}</span>
            </button>

            <div className="flex items-center gap-1.5 text-[#999999]">
              <MessageSquare size={18} />
              <span className="text-[14px] font-medium">{comments.length > 0 ? `${comments.length} 条评论` : "暂无评论"}</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 rounded-[28px] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#333333]">评论</h3>
            <span className="text-[13px] text-[#999999]">{comments.length} 条</span>
          </div>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((item) => {
                const mine = item.uid === currentUserId;
                const commentId = getCommentId(item);
                const isEditing = editingCommentId === commentId;

                return (
                  <div
                    key={commentId}
                    className="rounded-2xl bg-[#FAFAFA] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[15px] shadow-sm">
                          {mine ? "👩" : "🧑"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] leading-none text-[#B5B5B5]">{formatMomentDetailTime(item.created_at)}</span>
                          <span className="mt-1 text-[14px] font-semibold leading-none text-[#333333]">{mine ? "我" : "Ta"}</span>
                        </div>
                      </div>

                      {mine && !isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingComment(item);
                              setEditingCommentId(commentId);
                              setEditingCommentText(item.content);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#8C8C8C] shadow-sm ring-1 ring-[#F0F0F0] transition-colors hover:text-[#FF8D6B]"
                            aria-label="编辑评论"
                          >
                            <PencilLine size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#F08F8F] shadow-sm ring-1 ring-[#F3EAEA] transition-colors hover:text-[#F56C6C]"
                            aria-label="删除评论"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingCommentText}
                          onChange={(event) => setEditingCommentText(event.target.value)}
                          className="w-full rounded-2xl bg-white px-4 py-3 text-[14px] text-[#333333] outline-none ring-1 ring-[#EDEDED] focus:ring-[#FFB494]"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveComment}
                            disabled={submitting}
                            className="rounded-full bg-gradient-to-r from-[#FFB494] to-[#FF9874] px-4 py-2 text-[13px] text-white disabled:opacity-50"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingComment(null);
                              setEditingCommentId(null);
                              setEditingCommentText("");
                            }}
                            className="rounded-full bg-[#F3F3F3] px-4 py-2 text-[13px] text-[#666666]"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-[#555555]">{item.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#ECECEC] px-4 py-8 text-center text-[14px] text-[#B5B5B5]">
              还没有评论，来说第一句话吧
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#F3F3F3] bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-end gap-3">
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="写下你的评论..."
            rows={1}
            className="min-h-[48px] flex-1 resize-none rounded-2xl bg-[#F7F7F7] px-4 py-3 text-[14px] text-[#333333] outline-none ring-1 ring-transparent transition focus:ring-[#FFB494]"
          />

          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={submitting || !comment.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FFB494] to-[#FF9874] text-white shadow-md shadow-[#FF9874]/25 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <MomentImageViewer
        open={viewerOpen}
        images={moment.resources || []}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
