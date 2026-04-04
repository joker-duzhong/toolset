// 心愿单卡片组件
import { useState } from 'react'
import { ExternalLink, Gift, Check, Trash2, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WishlistItem } from '../types'

interface WishlistCardProps {
  item: WishlistItem
  isMine: boolean // 是否是我创建的
  onClaim: (id: number) => void
  onFulfill: (id: number) => void
  onDelete: (id: number) => void
}

export function WishlistCard({ item, isMine, onClaim, onFulfill, onDelete }: WishlistCardProps) {
  const isClaimed = item.status === 'claimed'
  const isFulfilled = item.status === 'fulfilled'

  // 如果是我创建的，且被认领了，不显示"Ta已准备"的详细信息，保持惊喜
  const showClaimedHint = isMine && isClaimed

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300',
        isFulfilled ? 'border-green-200 bg-green-50/50' : 'border-stone-100'
      )}
    >
      {/* 图片 */}
      {item.image_url && (
        <div className="aspect-video bg-stone-100 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* 内容 */}
      <div className="p-4">
        <h4 className="font-medium text-stone-700 line-clamp-2">{item.title}</h4>

        {item.price && (
          <p className="text-amber-600 font-medium mt-1">¥{item.price}</p>
        )}

        {/* 状态标签 */}
        <div className="flex items-center justify-between mt-3">
          {showClaimedHint ? (
            <span className="flex items-center gap-1 text-xs text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
              <Gift size={12} />
              Ta 已暗中准备 🤫
            </span>
          ) : isFulfilled ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
              <Check size={12} />
              已实现 ✨
            </span>
          ) : isClaimed ? (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <Gift size={12} />
              准备中...
            </span>
          ) : null}

          {/* 外部链接 */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* 操作按钮 - 只对非创建者显示认领按钮 */}
        {!isMine && !isClaimed && !isFulfilled && (
          <button
            onClick={() => onClaim(item.id)}
            className="w-full mt-3 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            🎁 我来准备这个惊喜
          </button>
        )}

        {/* 完成按钮 - 认领者可以标记为已完成 */}
        {!isMine && isClaimed && !isFulfilled && (
          <button
            onClick={() => onFulfill(item.id)}
            className="w-full mt-3 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            ✅ 已准备好啦
          </button>
        )}

        {/* 删除按钮 - 只有创建者可以删除 */}
        {isMine && !isClaimed && (
          <button
            onClick={() => onDelete(item.id)}
            className="w-full mt-3 py-2 text-stone-400 hover:text-red-400 hover:bg-red-50 rounded-xl text-sm transition-colors"
          >
            <Trash2 size={14} className="inline mr-1" />
            删除
          </button>
        )}
      </div>
    </div>
  )
}

// 心愿添加弹窗
interface WishlistAddModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (item: {
    title: string
    url?: string
    price?: number
    image_url?: string
  }) => void
}

export function WishlistAddModal({ open, onClose, onSubmit }: WishlistAddModalProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        url: url.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
      })
      setTitle('')
      setUrl('')
      setPrice('')
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-stone-800">添加心愿</h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="想要什么？"
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none"
          />

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="商品链接（选填）"
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none"
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="价格（选填）"
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full mt-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
        >
          添加到心愿单 💫
        </button>

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

// 浮动添加按钮
export function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all"
    >
      <Plus size={24} />
    </button>
  )
}
