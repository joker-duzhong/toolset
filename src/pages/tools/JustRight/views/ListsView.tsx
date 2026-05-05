// 清单视图 - 整合待办和心愿单
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListChecks, Gift } from 'lucide-react'
import { SegmentedControl } from '../components/SegmentedControl'
import { TodoSection } from '../components/TodoSection'
import { WishlistSection } from '../components/WishlistSection'
import type { TodoItem, WishlistItem } from '../types'

type ListTab = 'todo' | 'wish'

interface ListsViewProps {
  todos: TodoItem[]
  wishlist: WishlistItem[]
  currentUserId: number
  onAddTodo: (content: string) => void
  onToggleTodo: (id: string, status: 'pending' | 'completed') => void
  onDeleteTodo: (id: string) => void
  onAddWish: (item: { title: string; url?: string; price?: number; image_url?: string; description?: string }) => void
  onClaimWish: (id: number) => void
  onFulfillWish: (id: number) => void
  onDeleteWish: (id: number) => void
}

export function ListsView({
  todos,
  wishlist,
  currentUserId,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onAddWish,
  onClaimWish,
  onFulfillWish,
  onDeleteWish,
}: ListsViewProps) {
  const [activeTab, setActiveTab] = useState<ListTab>('todo')

  return (
    <div className="min-h-full bg-[#FDFBF7] pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="px-4 py-4">
          <h1 className="font-bold text-stone-800 mb-4">清单</h1>

          {/* 分段控制器 */}
          <SegmentedControl
            options={[
              {
                value: 'todo' as ListTab,
                label: '日常待办',
                icon: <ListChecks size={18} />,
              },
              {
                value: 'wish' as ListTab,
                label: '惊喜心愿',
                icon: <Gift size={18} />,
              },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'todo' ? (
            <motion.div
              key="todo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <WishlistSection
                wishlist={wishlist}
                currentUserId={currentUserId}
                onAdd={onAddWish}
                onClaim={onClaimWish}
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
