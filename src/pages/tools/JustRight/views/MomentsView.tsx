import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import { MomentCard } from "../components/MomentCard";
import { MomentPublishModal } from "../components/MomentPublishModal";
import { memoApi } from "../services/api";
import type { Memo, MomentViewData } from "../types";
import { MomentDetailView } from "./MomentDetailView";

interface MomentsViewProps {
  currentUserId: string;
  onDetailModeChange?: (isDetail: boolean) => void;
}

function buildMomentViewData(moments: Memo[], currentUserId: string): MomentViewData[] {
  return [...moments]
    .map((moment) => {
      const likes = moment.likes || [];
      const comments = moment.comments || [];

      return {
        ...moment,
        resources: moment.resources || [],
        comments,
        comments_count: comments.length,
        likes_count: likes.length,
        liked_by_me: likes.includes(currentUserId),
        is_pinned: !!moment.is_pinned,
      };
    })
    .sort((a, b) => {
      if (!!a.is_pinned !== !!b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export function MomentsView({ currentUserId, onDetailModeChange }: MomentsViewProps) {
  const [rawMoments, setRawMoments] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingMoment, setEditingMoment] = useState<MomentViewData | null>(null);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);

  useEffect(() => {
    loadMoments();
  }, []);

  const moments = useMemo(() => buildMomentViewData(rawMoments, currentUserId), [rawMoments, currentUserId]);
  const selectedMoment = useMemo(() => moments.find((moment) => moment.id === selectedMomentId) || null, [moments, selectedMomentId]);

  useEffect(() => {
    onDetailModeChange?.(!!selectedMomentId);

    return () => {
      onDetailModeChange?.(false);
    };
  }, [onDetailModeChange, selectedMomentId]);

  const loadMoments = async () => {
    try {
      setLoading(true);
      const res = await memoApi.list();

      if (res.data) {
        setRawMoments(res.data.items || []);
      }
    } catch (error) {
      console.error("加载时刻失败:", error);
      toast.error("加载时刻失败");
    } finally {
      setLoading(false);
    }
  };

  const upsertMoment = (nextMoment: Memo) => {
    setRawMoments((prev) => {
      const exists = prev.some((moment) => moment.id === nextMoment.id);
      if (!exists) return [nextMoment, ...prev];
      return prev.map((moment) => (moment.id === nextMoment.id ? nextMoment : moment));
    });
  };

  const handlePublish = async (content: string, imageIds: string[]) => {
    try {
      const res = await memoApi.create(content, imageIds);
      if (res.data) {
        upsertMoment(res.data);
        toast.success("发布成功");
        setShowPublishModal(false);
      }
    } catch (error) {
      console.error("发布失败:", error);
      toast.error("发布失败");
    }
  };

  const handleSaveEdit = async (content: string, imageIds: string[]) => {
    if (!editingMoment) return;

    try {
      const res = await memoApi.update(editingMoment.id, {
        content,
        resource_ids: imageIds,
      });

      if (res.data) {
        upsertMoment(res.data);
        setEditingMoment(null);
        toast.success("保存成功");
      }
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await memoApi.delete(id);
      if (res.code >= 200 && res.code < 300) {
        setRawMoments((prev) => prev.filter((moment) => moment.id !== id));
        setSelectedMomentId((prev) => (prev === id ? null : prev));
        setEditingMoment((prev) => (prev?.id === id ? null : prev));
        toast.success("删除成功");
      }
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败");
    }
  };

  const handleToggleLike = async (id: string) => {
    try {
      const res = await memoApi.toggleLike(id);
      if (res.data) {
        upsertMoment(res.data);
      }
    } catch (error) {
      console.error("点赞操作失败:", error);
      toast.error("点赞操作失败");
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const res = await memoApi.togglePin(id);
      if (res.data) {
        upsertMoment(res.data);
        toast.success(res.data.is_pinned ? "已置顶" : "已取消置顶");
      }
    } catch (error) {
      console.error("置顶操作失败:", error);
      toast.error("置顶操作失败");
    }
  };

  const handleAddComment = async (memoId: string, content: string) => {
    const res = await memoApi.comment(memoId, content);
    if (!res.data) {
      throw new Error(res.message || "评论失败");
    }

    upsertMoment(res.data);
    toast.success("评论成功");
  };

  const handleUpdateComment = async (memoId: string, commentId: string, content: string) => {
    const res = await memoApi.updateComment(memoId, commentId, content);
    if (!res.data) {
      throw new Error(res.message || "修改评论失败");
    }

    upsertMoment(res.data);
    toast.success("评论已更新");
  };

  const handleDeleteComment = async (memoId: string, commentId: string) => {
    const res = await memoApi.deleteComment(memoId, commentId);
    if (!res.data) {
      throw new Error(res.message || "删除评论失败");
    }

    upsertMoment(res.data);
    toast.success("评论已删除");
  };

  return (
    <div className="min-h-full bg-[#FAFAFA] pb-24 font-sans">
      {selectedMoment ? (
        <MomentDetailView
          moment={selectedMoment}
          currentUserId={currentUserId}
          onBack={() => setSelectedMomentId(null)}
          onDelete={handleDelete}
          onEdit={(moment) => setEditingMoment(moment)}
          onToggleLike={handleToggleLike}
          onTogglePin={handleTogglePin}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
        />
      ) : (
        <>
          {/* {renderHeader()} */}

          <div className="px-4 pt-4">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#FF9874]/30 border-t-[#FF9874]" />
                <p className="mt-3 text-sm text-gray-400">加载中...</p>
              </div>
            ) : moments.length === 0 ? (
              <div className="py-20 text-center">
                <Camera
                  size={48}
                  className="mx-auto mb-3 text-gray-300"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-gray-400">还没有时刻</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <AnimatePresence>
                  {moments.map((moment) => (
                    <MomentCard
                      key={moment.id}
                      moment={moment}
                      currentUserId={currentUserId}
                      onOpenDetail={setSelectedMomentId}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </>
      )}

      <MomentPublishModal
        isOpen={showPublishModal && !editingMoment}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
      />

      <MomentPublishModal
        isOpen={!!editingMoment}
        mode="edit"
        initialValue={editingMoment ? { content: editingMoment.content, resources: editingMoment.resources || [] } : null}
        onClose={() => setEditingMoment(null)}
        onPublish={handlePublish}
        onSaveEdit={handleSaveEdit}
      />

      {!selectedMoment && (
        <button
          type="button"
          onClick={() => setShowPublishModal(true)}
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB494] to-[#FF9874] text-white shadow-[0_12px_28px_rgba(255,152,116,0.35)] transition-transform active:scale-95"
          aria-label="发布时刻"
        >
          <Camera
            size={24}
            strokeWidth={2.5}
          />
        </button>
      )}
    </div>
  );
}
