// 备忘录卡片组件
import { useState } from 'react'
import { ImagePlus, X, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Memo } from '../types'

interface MemoCardProps {
  memo: Memo
  onDelete: (id: string) => void
}

export function MemoCard({ memo, onDelete }: MemoCardProps) {
  const [showActions, setShowActions] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 图片区域 */}
      {memo.image_urls.length > 0 && (
        <div
          className={cn(
            'grid gap-1 p-2',
            memo.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {memo.image_urls.slice(0, 4).map((url, index) => (
            <div
              key={index}
              className="aspect-square bg-stone-100 rounded-lg overflow-hidden"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-3">
        <p className="text-stone-700 text-sm whitespace-pre-wrap line-clamp-3">
          {memo.content}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-stone-400">
          <span>{formatDate(memo.created_at)}</span>
          {showActions && (
            <button
              onClick={() => onDelete(memo.id)}
              className="p-1 text-stone-300 hover:text-red-400 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-stone-800">写备忘</h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容输入 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录点什么..."
          className="w-full h-32 p-4 bg-stone-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
        />

        {/* 图片预览 */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 底部操作 */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
          <label className="flex items-center gap-2 px-4 py-2 text-stone-500 cursor-pointer hover:bg-stone-50 rounded-full">
            <ImagePlus size={20} />
            <span className="text-sm">添加图片</span>
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
            className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
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
            animation: slide-up 0.3s ease-out;
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
