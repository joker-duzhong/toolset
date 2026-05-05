// 心愿单区域组件
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Plus, Sparkles } from 'lucide-react'
import type { WishlistItem } from '../types'
import { WishlistCard, WishlistAddModal } from './WishlistCard'

interface WishlistSectionProps {
  wishlist: WishlistItem[]
  currentUserId: number
  onAdd: (item: { title: string; url?: string; price?: number; image_url?: string; description?: string }) => void
  onClaim: (id: number) => void
  onFulfill: (id: number) => void
  onDelete: (id: number) => void
}

export function WishlistSection({
  wishlist,
  currentUserId,
  onAdd,
  onClaim,
  onFulfill,
  onDelete,
}: WishlistSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  // 分组：我的心愿 vs Ta 的心愿
  const myWishes = wishlist.filter((w) => w.creator_uid === currentUserId)
  const partnerWishes = wishlist.filter((w) => w.creator_uid !== currentUserId)

  return (
    <div className="space-y-6">
      {/* 添加心愿按钮 */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowCreateModal(true)}
        className="w-full py-4 px-6 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-3xl hover:from-rose-500 hover:to-pink-500 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        <span className="font-bold">添加心愿</span>
      </motion.button>

      {/* 我的心愿 */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Gift size={18} className="text-rose-400" />
          <h3 className="text-sm font-bold text-stone-700">我的心愿</h3>
          <span className="text-xs text-stone-400">({myWishes.length})</span>
        </div>

        {myWishes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-stone-100">
            <Sparkles size={32} className="mx-auto text-stone-300 mb-2" />
            <p className="text-stone-400 text-sm">还没有心愿</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {myWishes.map((wish) => (
                <WishlistCard
                  key={wish.id}
                  item={wish}
                  isMine={true}
                  onClaim={onClaim}
                  onFulfill={onFulfill}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Ta 的心愿 */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Gift size={18} className="text-amber-400" />
          <h3 className="text-sm font-bold text-stone-700">Ta 的心愿</h3>
          <span className="text-xs text-stone-400">({partnerWishes.length})</span>
        </div>

        {partnerWishes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-stone-100">
            <Sparkles size={32} className="mx-auto text-stone-300 mb-2" />
            <p className="text-stone-400 text-sm">Ta 还没有心愿</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {partnerWishes.map((wish) => (
                <WishlistCard
                  key={wish.id}
                  item={wish}
                  isMine={false}
                  onClaim={onClaim}
                  onFulfill={onFulfill}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 创建心愿弹窗 */}
      <WishlistAddModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(item) => {
          onAdd(item)
          setShowCreateModal(false)
        }}
      />
    </div>
  )
}
