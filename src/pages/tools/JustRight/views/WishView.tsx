// 心愿单与转盘视图
import { useState } from 'react'
import { cn } from '@/utils/cn'
import {
  WishlistCard,
  WishlistAddModal,
  FloatingAddButton,
} from '../components/WishlistCard'
import {
  RouletteWheel,
  RouletteOptions,
  CategorySelector,
} from '../components/RouletteWheel'
import type { WishlistItem, RouletteOption } from '../types'

type SubTab = 'wish' | 'roulette'

interface WishViewProps {
  wishlist: WishlistItem[]
  rouletteOptions: RouletteOption[]
  currentUserId: number
  onAddWish: (item: {
    title: string
    url?: string
    price?: number
    image_url?: string
    description?: string
  }) => void
  onClaimWish: (id: number) => void
  onFulfillWish: (id: number) => void
  onDeleteWish: (id: number) => void
  onAddRouletteOption: (title: string, category: 'food' | 'place' | 'other') => void
  onDeleteRouletteOption: (id: number) => void
}

export function WishView({
  wishlist,
  rouletteOptions,
  currentUserId,
  onAddWish,
  onClaimWish,
  onFulfillWish,
  onDeleteWish,
  onAddRouletteOption,
  onDeleteRouletteOption,
}: WishViewProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('wish')
  const [showAddWishModal, setShowAddWishModal] = useState(false)
  const [rouletteCategory, setRouletteCategory] = useState<'food' | 'place' | 'other'>('food')

  // 未实现的心愿
  const activeWishes = wishlist.filter(
    (w) => w.status === 'unclaimed' || w.status === 'claimed'
  )

  return (
    <div className="min-h-full pb-6">
      {/* 顶部 Tab 切换 */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-pink-50 to-transparent pt-2 pb-4 px-4">
        <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('wish')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === 'wish'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md'
                : 'text-stone-500'
            )}
          >
            <span>🎁</span>
            心愿单
          </button>
          <button
            onClick={() => setActiveTab('roulette')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === 'roulette'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
                : 'text-stone-500'
            )}
          >
            <span>🎡</span>
            随机转盘
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4">
        {activeTab === 'wish' ? (
          <WishSection
            wishes={activeWishes}
            currentUserId={currentUserId}
            onClaim={onClaimWish}
            onFulfill={onFulfillWish}
            onDelete={onDeleteWish}
          />
        ) : (
          <RouletteSection
            options={rouletteOptions}
            category={rouletteCategory}
            onCategoryChange={setRouletteCategory}
            onAddOption={onAddRouletteOption}
            onDeleteOption={onDeleteRouletteOption}
          />
        )}
      </div>

      {/* 添加心愿按钮 */}
      {activeTab === 'wish' && (
        <FloatingAddButton onClick={() => setShowAddWishModal(true)} />
      )}

      {/* 添加心愿弹窗 */}
      <WishlistAddModal
        open={showAddWishModal}
        onClose={() => setShowAddWishModal(false)}
        onSubmit={onAddWish}
      />
    </div>
  )
}

// 心愿单部分
interface WishSectionProps {
  wishes: WishlistItem[]
  currentUserId: number
  onClaim: (id: number) => void
  onFulfill: (id: number) => void
  onDelete: (id: number) => void
}

function WishSection({ wishes, currentUserId, onClaim, onFulfill, onDelete }: WishSectionProps) {
  return (
    <div>
      {/* 提示 */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-100">
        <p className="text-sm text-stone-600">
          💡 添加心愿单，让 Ta 知道你想要什么～
        </p>
        <p className="text-xs text-stone-400 mt-1">
          认领后会保持神秘，给对方一个惊喜！
        </p>
      </div>

      {/* 心愿列表 */}
      {wishes.length > 0 ? (
        <div className="grid gap-4">
          {wishes.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              isMine={item.creator_uid === currentUserId}
              onClaim={onClaim}
              onFulfill={onFulfill}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-stone-400">心愿单是空的</p>
          <p className="text-sm text-stone-300 mt-1">添加一个心愿吧～</p>
        </div>
      )}
    </div>
  )
}

// 转盘部分
interface RouletteSectionProps {
  options: RouletteOption[]
  category: 'food' | 'place' | 'other'
  onCategoryChange: (category: 'food' | 'place' | 'other') => void
  onAddOption: (title: string, category: 'food' | 'place' | 'other') => void
  onDeleteOption: (id: number) => void
}

function RouletteSection({
  options,
  category,
  onCategoryChange,
  onAddOption,
  onDeleteOption,
}: RouletteSectionProps) {
  return (
    <div>
      {/* 提示 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-100">
        <p className="text-sm text-stone-600">
          🎲 纠结吃什么/去哪里/玩什么？让转盘来决定！
        </p>
      </div>

      {/* 类别选择 */}
      <CategorySelector value={category} onChange={onCategoryChange} />

      {/* 转盘 */}
      <div className="mt-6">
        <RouletteWheel options={options} category={category} />
      </div>

      {/* 选项管理 */}
      <RouletteOptions
        options={options}
        category={category}
        onAdd={(title) => onAddOption(title, category)}
        onDelete={onDeleteOption}
      />
    </div>
  )
}
