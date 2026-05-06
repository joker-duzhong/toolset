import { useEffect, useRef, useState } from "react";
import { Link2, Copy, Gift, Check, Plus, Sparkles, Heart, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { WishlistFulfillPayload, WishlistItem, WishlistItemPayload } from "../types";
import { cn } from "@/utils/cn";
import { storageApi } from "@/common/api/storage";
import { APP_KEY as JUST_RIGHT_APP_KEY } from "../services/api";
import toast from "react-hot-toast";

interface WishlistCardProps {
  item: WishlistItem;
  isMine: boolean;
  onClaim: (id: string) => void;
  onFulfill: (id: string) => void;
  onDelete: (id: string) => void;
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
  mode?: "create" | "edit";
  initialValue?: WishlistItem | null;
  onClose: () => void;
  onSubmit: (item: WishlistItemPayload) => Promise<void> | void;
}

export function WishlistAddModal({ open, mode = "create", initialValue, onClose, onSubmit }: WishlistAddModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!open) return;

    setTitle(initialValue?.title || "");
    setUrl(initialValue?.url || "");
    setPrice(initialValue?.price != null ? String(initialValue.price) : "");
    setImageUrl(initialValue?.image_url || "");
  }, [initialValue, open]);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setPrice("");
    setImageUrl("");
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const normalizedPrice = price.trim() ? Number(price) : null;
    if (normalizedPrice != null && (Number.isNaN(normalizedPrice) || normalizedPrice < 0)) {
      toast.error("请输入有效的价格");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: trimmedTitle,
        url: url.trim() || null,
        price: normalizedPrice,
        image_url: imageUrl.trim() || null,
      });
      resetForm();
      onClose();
    } catch {
      toast.error(isEditMode ? "保存心愿失败" : "添加心愿失败");
    } finally {
      setSubmitting(false);
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
            onClick={handleClose}
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
              <h3 className="text-lg font-bold text-stone-800">{isEditMode ? "编辑心愿" : "许下新的心愿"}</h3>
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

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="图片链接 (选填)"
                className="w-full px-5 py-4 bg-[#FDFBF7] rounded-2xl border border-stone-100 text-stone-700 placeholder:text-stone-400 text-sm focus:border-rose-300 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <motion.button
              whileTap={{ scale: title.trim() ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="w-full mt-8 py-4 bg-[#1C1C1E] text-white rounded-2xl font-bold text-base shadow-lg shadow-stone-200/50 disabled:opacity-40 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  {isEditMode ? "保存中..." : "放入中..."}
                </>
              ) : (
                <>
                  {isEditMode ? "保存心愿" : "放入心愿单"} <Gift size={18} />
                </>
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface WishlistFulfillRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: WishlistFulfillPayload) => Promise<void> | void;
}

export function WishlistFulfillRecordModal({ open, onClose, onSubmit }: WishlistFulfillRecordModalProps) {
  const [note, setNote] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    images.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setNote("");
    setImages([]);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (images.length + files.length > 9) {
      toast.error("最多只能上传 9 张图片");
      return;
    }

    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const uploadImages = async () => {
    const uploaded = await storageApi.uploadFiles(
      images.map(({ file }) => file),
      {
        appKey: JUST_RIGHT_APP_KEY,
        compression: {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          fileType: "image/jpeg",
        },
        thumbnail: {
          maxWidthOrHeight: 512,
          fileType: "image/jpeg",
        },
      },
    );
    return uploaded.map((item) => item.resource.id);
  };

  const handleSubmit = async () => {
    if (!note.trim() && images.length === 0) {
      toast.error("请填写记录或上传图片");
      return;
    }

    try {
      setSubmitting(true);
      const resourceIds = images.length > 0 ? await uploadImages() : [];
      await onSubmit({
        note: note.trim() || null,
        resource_ids: resourceIds.length ? resourceIds : null,
      });
      reset();
      onClose();
    } catch {
      toast.error("保存完成记录失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-stone-900/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] bg-white px-6 pb-10 pt-4 shadow-2xl"
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-stone-200" />

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-800">记录这次实现</h3>
                <p className="mt-1 text-xs text-stone-400">备注和照片会随完成动作一起提交</p>
              </div>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="rounded-full bg-stone-100 p-2 text-stone-400 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="写一点准备过程或完成备注..."
              rows={4}
              disabled={submitting}
              className="mb-4 w-full resize-none rounded-2xl border border-stone-100 bg-[#FDFBF7] px-5 py-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:outline-none disabled:opacity-50"
            />

            {images.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {images.map(({ preview }, index) => (
                  <div
                    key={preview}
                    className="relative aspect-square overflow-hidden rounded-xl bg-stone-100"
                  >
                    <img
                      src={preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      disabled={submitting}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/40 p-1 text-white backdrop-blur disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting || images.length >= 9}
                className="flex-1 rounded-2xl bg-stone-100 px-4 py-3.5 text-sm font-bold text-stone-600 disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  <ImageIcon size={16} />
                  图片 ({images.length}/9)
                </span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || (!note.trim() && images.length === 0)}
                className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-100 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    提交中...
                  </span>
                ) : (
                  "完成并记录"
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleSelectImages}
              className="hidden"
            />
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
