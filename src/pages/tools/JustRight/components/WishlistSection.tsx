import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ExternalLink, Gift, Heart, Loader2, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WishlistFulfillPayload, WishlistItem, WishlistItemPayload, WishlistItemUpdatePayload } from '../types'
import { WishlistAddModal, WishlistFulfillRecordModal } from './WishlistCard'

type FilterType = 'all' | 'mine' | 'partner' | 'uncompleted' | 'preparing' | 'completed'

interface WishlistSectionProps {
  wishlist: WishlistItem[]
  currentUserId: string
  onClaim: (id: string) => Promise<void> | void
  onUnclaim: (id: string) => Promise<void> | void
  onFulfill: (id: string, payload?: WishlistFulfillPayload) => Promise<void> | void
  onAdd?: (item: WishlistItemPayload) => Promise<void> | void
  onUpdate?: (id: string, item: WishlistItemUpdatePayload) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
}

const filters: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'mine', label: '我的心愿' },
  { value: 'partner', label: 'Ta 的心愿' },
  { value: 'uncompleted', label: '待实现' },
  { value: 'preparing', label: '准备中' },
  { value: 'completed', label: '已完成' },
]

const statusOrder: Record<WishlistItem['status'], number> = {
  claimed: 0,
  unclaimed: 1,
  fulfilled: 2,
}

function isOwnedByMe(wish: WishlistItem, currentUserId: string) {
  return Boolean(currentUserId) && wish.creator_uid === currentUserId
}

function isClaimedByMe(wish: WishlistItem, currentUserId: string) {
  return Boolean(currentUserId) && wish.claimer_uid === currentUserId
}

function getVisibleStatus(wish: WishlistItem, currentUserId: string) {
  const mine = isOwnedByMe(wish, currentUserId)

  if (wish.status === 'fulfilled') {
    return {
      label: '心愿已实现',
      helper: '这份期待已经落地啦',
      className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: Check,
    }
  }

  if (mine) {
    return {
      label: '等待 Ta 实现',
      helper: '如果 Ta 已经准备，后端会对你隐藏认领状态来保留惊喜',
      className: 'bg-rose-50 text-rose-500 border-rose-100',
      icon: Heart,
    }
  }

  if (wish.status === 'claimed') {
    return {
      label: isClaimedByMe(wish, currentUserId) ? '你正在准备' : '惊喜准备中',
      helper: isClaimedByMe(wish, currentUserId) ? '可以取消准备，或标记已实现' : '这个心愿已经被认领',
      className: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: Gift,
    }
  }

  return {
    label: '等待实现',
    helper: '还没有人认领这个心愿',
    className: 'bg-stone-50 text-stone-500 border-stone-100',
    icon: Gift,
  }
}

export function WishlistSection({
  wishlist,
  currentUserId,
  onClaim,
  onUnclaim,
  onFulfill,
  onAdd,
  onUpdate,
  onDelete,
}: WishlistSectionProps) {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWish, setEditingWish] = useState<WishlistItem | null>(null)
  const [recordWish, setRecordWish] = useState<WishlistItem | null>(null)
  const [actingWishId, setActingWishId] = useState<string | null>(null)

  const filteredWishlist = useMemo(() => {
    return wishlist
      .filter((wish) => !wish.is_deleted)
      .filter((wish) => {
        const mine = isOwnedByMe(wish, currentUserId)

        switch (filterType) {
          case 'mine':
            return mine
          case 'partner':
            return !mine
          case 'uncompleted':
            return wish.status === 'unclaimed' || (mine && wish.status === 'claimed')
          case 'preparing':
            return !mine && wish.status === 'claimed'
          case 'completed':
            return wish.status === 'fulfilled'
          default:
            return true
        }
      })
      .sort((a, b) => {
        const orderDiff = statusOrder[a.status] - statusOrder[b.status]
        if (orderDiff !== 0) return orderDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [wishlist, filterType, currentUserId])

  const runWishAction = async (id: string, action: () => Promise<void> | void) => {
    try {
      setActingWishId(id)
      await action()
    } catch (error) {
      console.error('Wishlist action failed:', error)
    } finally {
      setActingWishId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar px-2 pb-1 -mx-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterType(filter.value)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all',
              filterType === filter.value
                ? 'bg-[#FFAB84] text-white shadow-md shadow-[#FFAB84]/20'
                : 'border border-[#FFF0E6] bg-white text-[#A3968C] hover:bg-[#FFF9F5]',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredWishlist.map((wish) => {
            const mine = isOwnedByMe(wish, currentUserId)
            const claimedByMe = isClaimedByMe(wish, currentUserId)
            const fulfilled = wish.status === 'fulfilled'
            const claimed = wish.status === 'claimed'
            const status = getVisibleStatus(wish, currentUserId)
            const StatusIcon = status.icon
            const isActing = actingWishId === wish.id
            const ActionIcon = isActing ? Loader2 : null

            return (
              <motion.article
                key={wish.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FFF7F2] to-[#FFF0E6] p-5 shadow-sm border border-[#FFF0E6]"
              >
                <div className="absolute -right-6 -top-8 text-[#FFAB84]/10">
                  <Gift size={118} />
                </div>

                <div className="relative z-10 space-y-4">
                  {wish.image_url && (
                    <img
                      src={wish.image_url}
                      alt={wish.title}
                      className="h-36 w-full rounded-3xl object-cover"
                      loading="lazy"
                    />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="mb-1 line-clamp-2 text-lg font-bold text-[#4A4036]">{wish.title}</h3>
                      <p className="text-[13px] leading-relaxed text-[#A3968C]">{status.helper}</p>
                    </div>

                    <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold', status.className)}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    {wish.price != null && (
                      <span className="rounded-full bg-white/70 px-3 py-1.5 font-bold text-rose-500">
                        ¥{wish.price}
                      </span>
                    )}

                    {mine ? (
                      <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium text-[#D98A6C]">我的心愿</span>
                    ) : (
                      <span className="rounded-full bg-white/70 px-3 py-1.5 font-medium text-[#D98A6C]">Ta 的心愿</span>
                    )}

                    {wish.url && (
                      <a
                        href={wish.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 font-medium text-[#D98A6C]"
                      >
                        查看链接 <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {fulfilled && (wish.fulfilled_note || wish.fulfilled_resource_ids?.length || wish.fulfilled_at) && (
                    <div className="rounded-2xl bg-white/60 p-4 text-[13px] leading-relaxed text-[#8A817A]">
                      {wish.fulfilled_note && <p className="mb-2 line-clamp-3">{wish.fulfilled_note}</p>}
                      <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[#B7AAA1]">
                        {wish.fulfilled_at && <span>完成于 {new Date(wish.fulfilled_at).toLocaleDateString('zh-CN')}</span>}
                        {Boolean(wish.fulfilled_resource_ids?.length) && <span>{wish.fulfilled_resource_ids?.length} 张记录照片</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {mine && !fulfilled && onUpdate && (
                      <button
                        onClick={() => setEditingWish(wish)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium text-[#7A6B61] transition-colors hover:bg-white"
                      >
                        <Pencil size={14} />
                        编辑
                      </button>
                    )}

                    {mine && !fulfilled && onDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm(`确定取消心愿「${wish.title}」吗？`)) {
                            runWishAction(wish.id, () => onDelete(wish.id))
                          }
                        }}
                        disabled={isActing}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium text-rose-500 transition-colors hover:bg-white"
                      >
                        {ActionIcon ? <ActionIcon size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        取消心愿
                      </button>
                    )}

                    {!mine && !claimed && !fulfilled && (
                      <button
                        onClick={() => runWishAction(wish.id, () => onClaim(wish.id))}
                        disabled={isActing}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#FFAB84] px-5 py-2 text-[13px] font-medium text-white shadow-sm shadow-[#FFAB84]/30 transition-transform active:scale-95"
                      >
                        {ActionIcon ? <ActionIcon size={14} className="animate-spin" /> : <Gift size={14} />}
                        帮 Ta 实现
                      </button>
                    )}

                    {!mine && claimed && claimedByMe && !fulfilled && (
                      <>
                        <button
                          onClick={() => runWishAction(wish.id, () => onUnclaim(wish.id))}
                          disabled={isActing}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium text-[#7A6B61] transition-colors hover:bg-white"
                        >
                          {ActionIcon ? <ActionIcon size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                          取消准备
                        </button>
                        <button
                          onClick={() => runWishAction(wish.id, () => onFulfill(wish.id))}
                          disabled={isActing}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-[13px] font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                        >
                          {ActionIcon ? <ActionIcon size={14} className="animate-spin" /> : <Check size={14} />}
                          直接完成
                        </button>
                        <button
                          onClick={() => setRecordWish(wish)}
                          disabled={isActing}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#FFAB84] px-5 py-2 text-[13px] font-medium text-white shadow-sm shadow-[#FFAB84]/30 transition-transform active:scale-95"
                        >
                          <Heart size={14} />
                          完成并记录
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>

        {filteredWishlist.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-[#FFE4D7] bg-white/60 py-12 text-center text-sm text-[#D4C9C1]">
            没有符合条件的心愿呢
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onAdd && setShowAddModal(true)}
        disabled={!onAdd}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFAB84] text-white shadow-lg shadow-[#FFAB84]/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus
          size={24}
          strokeWidth={2.5}
        />
      </motion.button>

      <WishlistAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(item) => onAdd?.(item)}
      />

      <WishlistAddModal
        open={Boolean(editingWish)}
        mode="edit"
        initialValue={editingWish}
        onClose={() => setEditingWish(null)}
        onSubmit={(item) => {
          if (!editingWish) return
          return onUpdate?.(editingWish.id, item)
        }}
      />

      <WishlistFulfillRecordModal
        open={Boolean(recordWish)}
        onClose={() => setRecordWish(null)}
        onSubmit={(payload) => {
          if (!recordWish) return
          return onFulfill(recordWish.id, payload)
        }}
      />
    </div>
  )
}
