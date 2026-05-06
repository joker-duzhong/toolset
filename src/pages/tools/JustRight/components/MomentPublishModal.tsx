// 时刻发布弹窗
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { storageApi, type StorageInfo } from '@/common/api/storage'
import { APP_KEY as JUST_RIGHT_APP_KEY } from '../services/api'
import type { MomentEditorValue } from '../types'
import toast from 'react-hot-toast'

interface MomentPublishModalProps {
  isOpen: boolean
  mode?: 'create' | 'edit'
  initialValue?: MomentEditorValue | null
  onClose: () => void
  onPublish: (content: string, imageIds: string[]) => Promise<void> | void
  onSaveEdit?: (content: string, imageIds: string[]) => Promise<void> | void
}

export function MomentPublishModal({
  isOpen,
  mode = 'create',
  initialValue,
  onClose,
  onPublish,
  onSaveEdit,
}: MomentPublishModalProps) {
  const [content, setContent] = useState('')
  const [existingImages, setExistingImages] = useState<StorageInfo[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = mode === 'edit'

  useEffect(() => {
    if (!isOpen) return

    setContent(initialValue?.content || '')
    setExistingImages(initialValue?.resources || [])
    setNewImages([])
  }, [initialValue, isOpen])

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentImageCount = existingImages.length + newImages.length

    if (currentImageCount + files.length > 9) {
      toast.error('最多只能上传 9 张图片')
      return
    }

    const selectedImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setNewImages((prev) => [...prev, ...selectedImages])
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== id))
  }

  const uploadImages = async (): Promise<string[]> => {
    try {
      const uploaded = await storageApi.uploadFiles(
        newImages.map(({ file }) => file),
        {
          appKey: JUST_RIGHT_APP_KEY,
          compression: {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            fileType: "image/jpeg",
          },
          thumbnail: {
            maxWidthOrHeight: 512,
            fileType: 'image/jpeg',
          },
        },
      )
      return uploaded.map((item) => item.resource.id)
    } catch {
      return []
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && existingImages.length === 0 && newImages.length === 0) {
      toast.error('请输入内容或上传图片')
      return
    }

    try {
      setUploading(true)
      const uploadedImageIds = newImages.length > 0 ? await uploadImages() : []
      if (newImages.length > 0 && uploadedImageIds.length === 0) {
        toast.error('图片上传失败')
        return
      }
      const imageIds = [...existingImages.map((item) => item.id), ...uploadedImageIds]

      if (isEditMode) {
        await onSaveEdit?.(content.trim(), imageIds)
        newImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
        setExistingImages([])
        setNewImages([])
        setContent('')
        return
      }

      await onPublish(content.trim(), imageIds)
      newImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
      setExistingImages([])
      setContent('')
      setNewImages([])
    } catch {
      toast.error(isEditMode ? '保存失败' : '发布失败')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (uploading) return
    newImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
    setContent('')
    setExistingImages([])
    setNewImages([])
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#333333] text-[18px]">
                {isEditMode ? '编辑时刻' : '发布时刻'}
              </h3>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享此刻的心情..."
              rows={4}
              className="w-full px-4 py-4 bg-[#F9F9F9] border-none rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#FF9874] resize-none mb-4 text-[15px] text-[#333333] placeholder-gray-400"
              disabled={uploading}
            />

            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[13px] text-[#999999]">当前图片</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F5]"
                    >
                      <img
                        src={image.thumb_url || image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        disabled={uploading}
                        className="absolute right-1.5 top-1.5 rounded-full bg-black/40 p-1 text-white backdrop-blur-md transition-colors hover:bg-black/60 disabled:opacity-50"
                      >
                        <X
                          size={14}
                          strokeWidth={3}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {newImages.map(({ preview }, index) => (
                  <div
                    key={index}
                    className="relative aspect-square"
                  >
                    <img
                      src={preview}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => handleRemoveNewImage(index)}
                      disabled={uploading}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors disabled:opacity-50"
                    >
                      <X
                        size={14}
                        strokeWidth={3}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || existingImages.length + newImages.length >= 9}
                className="flex-1 py-3.5 px-4 bg-[#F5F5F5] text-[#666666] rounded-2xl hover:bg-[#EEEEEE] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ImageIcon size={18} />
                <span className="text-[15px] font-medium">
                  {`图片 (${existingImages.length + newImages.length}/9)`}
                </span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={uploading || (!content.trim() && existingImages.length === 0 && newImages.length === 0)}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#FFB494] to-[#FF9874] text-white rounded-2xl shadow-md shadow-[#FF9874]/30 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    <span className="text-[15px] font-medium">
                      {isEditMode ? '保存中...' : '发布中...'}
                    </span>
                  </>
                ) : (
                  <span className="text-[15px] font-medium tracking-wide">
                    {isEditMode ? '保存' : '发布'}
                  </span>
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
  )
}
