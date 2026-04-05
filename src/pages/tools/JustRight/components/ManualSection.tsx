import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Edit2, Check, X, Ruler, Utensils, Heart } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { UserManual, DietPreferences } from '../types'

interface ManualCardProps {
  manual?: UserManual
  isOwner?: boolean
  onUpdate?: (data: Partial<UserManual>) => void
}

// 修复点 4: 显式声明 Variants 类型，解决 TS 将 ease: "easeOut" 推断为普通 string 的问题
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.4, ease: 'easeOut' },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

// --- 尺码档案部分 ---
function SizeSection({
  manual = {} as UserManual,
  editing,
  onChange,
}: {
  manual?: UserManual
  editing: boolean
  onChange: (field: keyof UserManual, value: string) => void
}) {
  const fields = [
    { key: 'shoe_size' as const, label: '鞋码', emoji: '👟' },
    { key: 'clothes_size' as const, label: '衣服', emoji: '👕' },
    { key: 'pants_size' as const, label: '裤子', emoji: '👖' },
    { key: 'ring_size' as const, label: '戒指', emoji: '💍' },
  ]

  return (
    <motion.div variants={itemVariants} className="bg-[#FFFAF3] rounded-3xl p-5 shadow-sm shadow-orange-900/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-orange-100 rounded-full text-orange-500">
          <Ruler size={16} />
        </div>
        <h4 className="font-semibold text-stone-700 tracking-wide">尺码档案</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label, emoji }) => (
          <div key={key} className="flex flex-col bg-white/60 p-3 rounded-2xl border border-orange-50/50">
            <span className="text-xs text-stone-400 font-medium mb-1.5">
              {emoji} {label}
            </span>
            {editing ? (
              <input
                type="text"
                value={manual?.[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder="未填写"
                className="w-full px-2 py-1.5 text-sm bg-white rounded-xl border-none ring-1 ring-orange-100 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
              />
            ) : (
              <span className="text-sm font-medium text-stone-700">{manual?.[key] || '-'}</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// 修复点 2 & 3: 将 TagGroup 提到外部并提供强类型，避免在 Render 中创建组件和使用 any
interface TagGroupProps {
  title: string
  icon: string
  items: string[]
  category: keyof DietPreferences
  activeColor: string
  editing: boolean
  isSelected: (category: keyof DietPreferences, item: string) => boolean
  toggleItem: (category: keyof DietPreferences, item: string) => void
}

function TagGroup({ title, icon, items, category, activeColor, editing, isSelected, toggleItem }: TagGroupProps) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs text-stone-500 font-medium mb-2 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const selected = isSelected(category, item)
          return (
            <motion.button
              whileTap={editing ? { scale: 0.95 } : {}}
              key={item}
              onClick={() => editing && toggleItem(category, item)}
              disabled={!editing}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-300',
                selected ? activeColor : 'bg-white text-stone-400 shadow-sm shadow-black/5',
                editing ? 'hover:shadow-md cursor-pointer ring-1 ring-transparent hover:ring-stone-200' : 'cursor-default'
              )}
            >
              {item}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// --- 饮食偏好部分 ---
function DietSection({
  manual = {} as UserManual,
  editing,
  onChange,
}: {
  manual?: UserManual
  editing: boolean
  onChange: (field: 'diet_preferences', value: DietPreferences) => void
}) {
  const diet = manual?.diet_preferences || {}

  const commonFavorites = ['火锅', '烧烤', '日料', '西餐', '甜品', '奶茶']
  const commonDislikes = ['不吃辣', '不吃香菜', '不吃葱蒜', '少吃油腻', '不吃内脏']
  const commonAllergies = ['海鲜', '花生', '芒果', '牛奶', '鸡蛋']

  const toggleItem = (category: keyof DietPreferences, item: string) => {
    const currentList = diet[category] || []
    const updatedList = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item]
    onChange('diet_preferences', { ...diet, [category]: updatedList })
  }

  const isSelected = (category: keyof DietPreferences, item: string) => {
    return diet[category]?.includes(item) ?? false
  }

  return (
    <motion.div variants={itemVariants} className="bg-[#F8FCF8] rounded-3xl p-5 shadow-sm shadow-green-900/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-green-100 rounded-full text-green-600">
          <Utensils size={16} />
        </div>
        <h4 className="font-semibold text-stone-700 tracking-wide">饮食偏好</h4>
      </div>

      <TagGroup 
        title="喜欢的食物" icon="😋" items={commonFavorites} category="favorites" 
        activeColor="bg-orange-100 text-orange-700 ring-1 ring-orange-200"
        editing={editing} isSelected={isSelected} toggleItem={toggleItem}
      />
      <TagGroup 
        title="不吃 / 少吃" icon="🙅" items={commonDislikes} category="dislikes" 
        activeColor="bg-stone-200 text-stone-700 ring-1 ring-stone-300"
        editing={editing} isSelected={isSelected} toggleItem={toggleItem}
      />
      <TagGroup 
        title="过敏 / 忌口" icon="⚠️" items={commonAllergies} category="allergies" 
        activeColor="bg-rose-100 text-rose-700 ring-1 ring-rose-200"
        editing={editing} isSelected={isSelected} toggleItem={toggleItem}
      />
    </motion.div>
  )
}

// --- 情绪指南部分 ---
function EmotionalSection({
  manual = {} as UserManual,
  editing,
  onChange,
}: {
  manual?: UserManual
  editing: boolean
  onChange: (field: keyof NonNullable<UserManual['emotional_guide']>, value: string) => void
}) {
  const guide = manual?.emotional_guide || {}

  const fields = [
    { key: 'when_sad' as const, label: '难过时', emoji: '🥺', placeholder: '抱抱我，给我买杯奶茶...' },
    { key: 'when_angry' as const, label: '生气时', emoji: '😤', placeholder: '先让我冷静十分钟，然后...' },
    { key: 'when_stressed' as const, label: '压力大时', emoji: '😫', placeholder: '陪我散散步，听我吐槽...' },
  ]

  return (
    <motion.div variants={itemVariants} className="bg-[#FFF6F7] rounded-3xl p-5 shadow-sm shadow-rose-900/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-rose-100 rounded-full text-rose-500">
          <Heart size={16} />
        </div>
        <h4 className="font-semibold text-stone-700 tracking-wide">情绪指南</h4>
      </div>

      <div className="space-y-4">
        {fields.map(({ key, label, emoji, placeholder }) => (
          <div key={key}>
            <p className="text-xs text-stone-500 font-medium mb-1.5 flex items-center gap-1.5">
              <span>{emoji}</span> {label}
            </p>
            {editing ? (
              <textarea
                value={guide[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 text-sm bg-white rounded-2xl border-none ring-1 ring-rose-100 focus:ring-2 focus:ring-rose-300 outline-none resize-none transition-all shadow-sm shadow-rose-900/5"
                rows={2}
              />
            ) : (
              <div className="text-sm text-stone-600 bg-white/70 rounded-2xl p-3.5 leading-relaxed shadow-sm shadow-rose-900/5 border border-rose-50/50">
                {guide[key] || <span className="text-stone-400 italic">等待解锁说明...</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// --- 头像切换器 ---
export function AvatarSwitcher({ current, onChange }: { current: 'mine' | 'partner', onChange: (who: 'mine' | 'partner') => void }) {
  return (
    <div className="flex justify-center items-center gap-8 py-6">
      {[
        { id: 'mine', label: '我', emoji: '🙋‍♀️', color: 'from-orange-100 to-amber-50' },
        { id: 'partner', label: 'Ta', emoji: '💁‍♂️', color: 'from-sky-100 to-blue-50' }
      ].map((item) => {
        const isActive = current === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id as 'mine' | 'partner')}
            className="relative flex flex-col items-center gap-2 outline-none group"
          >
            <motion.div
              animate={{ scale: isActive ? 1.1 : 0.9, opacity: isActive ? 1 : 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm z-10',
                isActive ? `bg-gradient-to-br ${item.color} ring-4 ring-white` : 'bg-stone-100 grayscale-[30%]'
              )}
            >
              {item.emoji}
            </motion.div>
            <span className={cn("text-xs font-medium transition-colors", isActive ? "text-stone-700" : "text-stone-400")}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// --- 主卡片组件 ---
// --- 主卡片组件 ---
export function ManualCard({ manual, isOwner, onUpdate }: ManualCardProps) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<UserManual>>(manual || {})
  
  const [prevManual, setPrevManual] = useState(manual)
  if (manual !== prevManual) {
    setPrevManual(manual)
    setEditData(manual || {})
    setEditing(false)
  }

  const handleFieldChange = (field: keyof UserManual, value: string | DietPreferences) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEmotionalChange = (field: keyof NonNullable<UserManual['emotional_guide']>, value: string) => {
    setEditData((prev) => ({
      ...prev,
      emotional_guide: { ...(prev.emotional_guide || {}), [field]: value },
    }))
  }

  const handleSave = () => {
    onUpdate?.(editData)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditData(manual || {})
    setEditing(false)
  }

  const isEmptyData = !manual || Object.keys(manual).length === 0

  if (!isOwner && isEmptyData) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 bg-[#FDFBF7] rounded-[2rem] border border-stone-100"
      >
        <div className="text-5xl mb-4 opacity-80 grayscale-[20%]">☁️</div>
        <h3 className="text-stone-600 font-medium mb-2 text-lg">Ta 还没有填写说明书哦</h3>
        <p className="text-stone-400 text-sm">提醒 Ta 来完善一下吧 ~</p>
      </motion.div>
    )
  }

  const displayManual = editing ? (editData as UserManual) : (manual || {} as UserManual)

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-[#FDFBF7] min-h-screen p-4 pb-20 font-sans relative"
    >
      {/* 头部区域 - 悬浮吸顶设计 */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-2 py-3 -mx-2 mb-4 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-orange-900/5 transition-all">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl shadow-sm shadow-orange-900/5">📖</div>
          <h3 className="font-bold text-lg text-stone-800 tracking-wide">
            {isOwner ? '我的使用说明书' : 'Ta的使用说明书'}
          </h3>
        </div>
        
        {isOwner && (
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div 
                key="editing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-2"
              >
                <button onClick={handleCancel} className="p-2.5 text-stone-400 bg-white rounded-full shadow-sm hover:text-stone-600 active:scale-95 transition-all border border-stone-100">
                  <X size={18} />
                </button>
                <button onClick={handleSave} className="p-2.5 text-white bg-orange-400 rounded-full shadow-md shadow-orange-400/30 active:scale-95 transition-all">
                  <Check size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="viewing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setEditing(true)}
                className="p-2.5 text-stone-500 bg-white rounded-full shadow-sm shadow-orange-900/5 hover:text-orange-500 active:scale-95 transition-all border border-stone-100/50"
              >
                <Edit2 size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* 各部分内容卡片 */}
      <div className="space-y-5 mt-2">
        <SizeSection manual={displayManual} editing={editing} onChange={handleFieldChange} />
        <DietSection manual={displayManual} editing={editing} onChange={handleFieldChange} />
        <EmotionalSection manual={displayManual} editing={editing} onChange={handleEmotionalChange} />
      </div>

      {/* 底部温柔提示 */}
      <AnimatePresence>
        {isOwner && !editing && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-stone-400 text-center flex items-center justify-center gap-1 pt-6 pb-8"
          >
            <span>💡</span> 随时更新说明书，让爱意有迹可循
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}