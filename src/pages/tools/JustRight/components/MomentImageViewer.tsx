import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { StorageInfo } from '@/common/api/storage'

interface MomentImageViewerProps {
  open: boolean
  images: StorageInfo[]
  initialIndex: number
  onClose: () => void
}

export function MomentImageViewer({ open, images, initialIndex, onClose }: MomentImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) {
      const safeIndex = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0))
      setCurrentIndex(safeIndex)
    }
  }, [images.length, initialIndex, open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') setCurrentIndex((prev) => Math.max(prev - 1, 0))
      if (event.key === 'ArrowRight') setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, onClose, open])

  const currentImage = images[currentIndex]
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < images.length - 1

  return (
    <AnimatePresence>
      {open && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/95"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md"
          >
            <X size={20} />
          </button>

          <div className="absolute top-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-sm text-white/85 backdrop-blur-md">
            {currentIndex + 1} / {images.length}
          </div>

          <div
            className="flex h-full items-center justify-center px-4"
            onClick={onClose}
          >
            <motion.img
              key={currentImage.id}
              initial={{ opacity: 0.35, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.35, scale: 0.98 }}
              src={currentImage.url}
              alt=""
              className="max-h-full max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => canGoPrev && setCurrentIndex((prev) => prev - 1)}
                disabled={!canGoPrev}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md disabled:opacity-30"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={() => canGoNext && setCurrentIndex((prev) => prev + 1)}
                disabled={!canGoNext}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md disabled:opacity-30"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
