// 备忘录卡片组件
import { useState } from 'react'
import { ImagePlus, X, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Memo } from '../types'

interface MemoCardProps {
  memo: Memo
  onDelete: (id: number) => void
}

export function MemoCard({ memo, onDelete }: MemoCardProps) {
  const [showActions, setShowActions] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div
      className="bg-white rounded-3xl shadow-md shadow-stone-100/50 border border-stone-100 overflow-hidden group hover:shadow-xl hover:border-pink-200 transition-all duration-300"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 图片区域 */}
      {memo.image_urls.length > 0 && (
        <div
          className={cn(
            'grid gap-1.5 p-3',
            memo.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {memo.image_urls.slice(0, 4).map((url, index) => (
            <div
              key={index}
              className="aspect-square bg-stone-100 rounded-xl overflow-hidden relative group/img"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {showActions && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => onDelete(memo.id)}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-400 hover:text-red-500 hover:scale-110 transition-all duration-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-4">
        <p className="text-stone-700 text-sm whitespace-pre-wrap line-clamp-3">
          {memo.content}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
          <span className="text-xs font-medium text-stone-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
            {formatDate(memo.created_at)}
          </span>
          {showActions && (
            <button
              onClick={() => onDelete(memo.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
            >
              <Trash2 size={14} />
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 备忘录创建弹窗
interface MemoCreateModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (content: string, images: string[]) => void
}

export function MemoCreateModal({ open, onClose, onSubmit }: MemoCreateModalProps) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      // 这里应该调用实际的图片上传 API
      // const urls = await Promise.all([...files].map(f => uploadApi.image(f)))
      // setImages([...images, ...urls])

      // 暂时使用本地预览
      const newImages = [...files].map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages].slice(0, 4))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = () => {
    if (content.trim() || images.length > 0) {
      onSubmit(content.trim(), images)
      setContent('')
      setImages([])
      onClose()
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-t-4xl p-6 animate-slide-up shadow-2xl shadow-stone-200/50">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <span className="text-2xl">✍️</span>
            写备忘
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容输入 - 精致设计 */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录点什么美好回忆..."
            className="w-full h-36 p-5 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-pink-100/50 transition-all duration-300 text-stone-700 placeholder-stone-400 text-base"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            <span className="text-xs text-stone-400">{content.length}/200</span>
          </div>
        </div>

        {/* 图片预览 */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square group/img-preview">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover/img-preview:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => removeImage(index)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            {images.length < 4 && (
              <button
                disabled={uploading || images.length >= 4}
                onClick={() => document.getElementById('memo-images')?.click()}
                className="relative aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 group/add"
              >
                <div className="text-center opacity-0 group-hover/add:opacity-100 transition-opacity duration-300">
                  <ImagePlus size={24} className="mx-auto text-stone-400 group-hover/add:text-pink-400" />
                  <span className="text-xs text-stone-400 group-hover/add:text-pink-400 mt-1 block">添加</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={uploading || images.length >= 4}
                  id="memo-images"
                />
              </button>
            )}
          </div>
        )}

        {/* 底部操作 */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-stone-100">
          <label className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-pink-50 to-rose-50 text-stone-500 cursor-pointer hover:from-pink-100 hover:to-rose-100 hover:text-pink-500 rounded-full transition-all duration-300 border border-pink-100 group">
            <ImagePlus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">添加图片</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
              disabled={uploading || images.length >= 4}
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() && images.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            发布
          </button>
        </div>

        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </div>
    </div>
  )
}

// 备忘录瀑布流容器
export function MemoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="columns-2 gap-3 space-y-3">
      {children}
    </div>
  )
}
