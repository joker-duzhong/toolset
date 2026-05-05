// 时刻发布弹窗
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { storageApi } from '@/common/api/storage'
import imageCompression from 'browser-image-compression'
import toast from 'react-hot-toast'

interface MomentPublishModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (content: string, imageIds: string[]) => void
}

export function MomentPublishModal({ isOpen, onClose, onPublish }: MomentPublishModalProps) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 选择图片
  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 9) {
      toast.error('最多只能上传 9 张图片')
      return
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  // 压缩图片
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    }

    try {
      return await imageCompression(file, options)
    } catch (error) {
      console.error('图片压缩失败:', error)
      return file
    }
  }

  // 上传图片
  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async ({ file }) => {
      try {
        const compressedFile = await compressImage(file)
        const res = await storageApi.upload(compressedFile)
        return res.data?.id || null
      } catch (error) {
        console.error('图片上传失败:', error)
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    return results.filter((id): id is string => id !== null)
  }

  // 发布
  const handlePublish = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error('请输入内容或上传图片')
      return
    }

    try {
      setUploading(true)

      // 上传图片
      const imageIds = images.length > 0 ? await uploadImages() : []

      if (images.length > 0 && imageIds.length === 0) {
        toast.error('图片上传失败')
        return
      }

      // 发布时刻
      await onPublish(content.trim(), imageIds)

      // 重置状态
      setContent('')
      setImages([])
    } catch (error) {
      console.error('发布失败:', error)
      toast.error('发布失败')
    } finally {
      setUploading(false)
    }
  }

  // 关闭弹窗
  const handleClose = () => {
    if (uploading) return

    // 清理预览 URL
    images.forEach(({ preview }) => URL.revokeObjectURL(preview))

    setContent('')
    setImages([])
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[60]"
          />

          {/* 发布弹窗 */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-800 text-lg">发布时刻</h3>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="p-2 bg-stone-50 rounded-full text-stone-400 hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* 文字输入 */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享此刻的心情..."
              rows={4}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none mb-4"
              disabled={uploading}
            />

            {/* 图片预览 */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {images.map(({ preview }, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      disabled={uploading}
                      className="absolute top-1 right-1 p-1 bg-stone-900/50 rounded-full text-white hover:bg-stone-900/70 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 9}
                className="flex-1 py-3 px-4 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ImageIcon size={18} />
                <span className="text-sm font-medium">
                  添加图片 ({images.length}/9)
                </span>
              </button>

              <button
                onClick={handlePublish}
                disabled={uploading || (!content.trim() && images.length === 0)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm font-medium">发布中...</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">发布</span>
                )}
              </button>
            </div>

            {/* 隐藏的文件输入 */}
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
  )
}
