import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SegmentedControl } from '../components/SegmentedControl'
import { TodoSection } from '../components/TodoSection'
import { WishlistSection } from '../components/WishlistSection'
import type { TodoItem, WishlistFulfillPayload, WishlistItem, WishlistItemPayload, WishlistItemUpdatePayload } from '../types'

type ListTab = 'todo' | 'wish'

interface ListsViewProps {
  todos: TodoItem[]
  wishlist: WishlistItem[]
  currentUserId: string
  onAddTodo: (content: string) => void
  onToggleTodo: (id: string, status: 'pending' | 'completed') => void
  onDeleteTodo: (id: string) => void
  onAddWish: (item: WishlistItemPayload) => Promise<void> | void
  onUpdateWish: (id: string, item: WishlistItemUpdatePayload) => Promise<void> | void
  onClaimWish: (id: string) => Promise<void> | void
  onUnclaimWish: (id: string) => Promise<void> | void
  onFulfillWish: (id: string, payload?: WishlistFulfillPayload) => Promise<void> | void
  onDeleteWish: (id: string) => Promise<void> | void
}

export function ListsView({
  todos,
  wishlist,
  currentUserId,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onAddWish,
  onUpdateWish,
  onClaimWish,
  onUnclaimWish,
  onFulfillWish,
  onDeleteWish,
}: ListsViewProps) {
  const [activeTab, setActiveTab] = useState<ListTab>('todo')

  return (
    <div className="min-h-full bg-[#FFFDFB] pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-99 bg-[#FFFDFB]/90 backdrop-blur-md pb-4 pt-8">
        <div className="px-6 flex flex-col items-center">
          {/* <h1 className="font-bold text-[#4A4036] text-lg mb-6">清单</h1> */}

          {/* 分段控制器 - 完全按照设计图还原 */}
          <div className="w-full px-4">
            <SegmentedControl
              options={[
                { value: 'todo', label: '日常待办' },
                { value: 'wish', label: '惊喜心愿' },
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-6 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'todo' ? (
            <motion.div
              key="todo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TodoSection
                todos={todos}
                onAdd={onAddTodo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
              />
            </motion.div>
          ) : (
            <motion.div
              key="wish"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <WishlistSection
                wishlist={wishlist}
                currentUserId={currentUserId}
                onAdd={onAddWish}
                onUpdate={onUpdateWish}
                onClaim={onClaimWish}
                onUnclaim={onUnclaimWish}
                onFulfill={onFulfillWish}
                onDelete={onDeleteWish}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
