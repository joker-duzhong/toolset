import type { StorageInfo } from '@/common/api/storage'
import { cn } from '@/utils/cn'

interface MomentMediaGridProps {
  images: StorageInfo[]
  onImageClick?: (index: number) => void
}

export function MomentMediaGrid({ images, onImageClick }: MomentMediaGridProps) {
  if (images.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-2 overflow-hidden',
        images.length === 1 && 'grid-cols-1',
        images.length === 2 && 'grid-cols-2',
        images.length === 3 && 'grid-cols-3',
        images.length === 4 && 'grid-cols-2 w-2/3',
        images.length >= 5 && 'grid-cols-3',
      )}
    >
      {images.slice(0, 9).map((img, idx) => (
        <button
          key={img.id || `${img.url}_${idx}`}
          type="button"
          onClick={() => onImageClick?.(idx)}
          className={cn(
            'relative overflow-hidden rounded-xl bg-gray-50 text-left',
            images.length === 1 ? 'aspect-[16/9] max-h-[260px] w-full' : 'aspect-square',
          )}
        >
          <img
            src={img.thumb_url || img.url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  )
}
