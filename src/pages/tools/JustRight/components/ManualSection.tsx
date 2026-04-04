// 说明书组件
import { useState } from 'react'
import { Edit2, Check, X, Ruler, Utensils, Heart } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { UserManual, DietPreferences } from '../types'

interface ManualCardProps {
  manual: UserManual
  isOwner?: boolean
  onUpdate?: (data: Partial<UserManual>) => void
}

// 尺码档案部分
function SizeSection({
  manual,
  editing,
  onChange,
}: {
  manual: UserManual
  editing: boolean
  onChange: (field: keyof UserManual, value: string) => void
}) {
  const fields = [
    { key: 'shoe_size' as const, label: '鞋码', emoji: '👟' },
    { key: 'clothes_size' as const, label: '衣服尺码', emoji: '👕' },
    { key: 'pants_size' as const, label: '裤子尺码', emoji: '👖' },
    { key: 'ring_size' as const, label: '戒指尺码', emoji: '💍' },
  ]

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-100">
      <div className="flex items-center gap-2 mb-3">
        <Ruler size={18} className="text-sky-500" />
        <h4 className="font-medium text-stone-700">尺码档案</h4>
      </div>
      <div className="space-y-2">
        {fields.map(({ key, label, emoji }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-stone-500">
              {emoji} {label}
            </span>
            {editing ? (
              <input
                type="text"
                value={manual[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder="未填写"
                className="w-24 px-2 py-1 text-sm text-right bg-white rounded-lg border border-sky-200 focus:border-sky-400 outline-none"
              />
            ) : (
              <span className="text-sm text-stone-700">{manual[key] || '-'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 饮食偏好部分
function DietSection({
  manual,
  editing,
  onChange,
}: {
  manual: UserManual
  editing: boolean
  onChange: (field: 'diet_preferences', value: DietPreferences) => void
}) {
  const diet = manual.diet_preferences || {}

  const commonFavorites = ['火锅', '烧烤', '日料', '西餐', '甜品', '奶茶']
  const commonDislikes = ['不吃辣', '不吃香菜', '不吃葱蒜', '少吃油腻', '不吃内脏']
  const commonAllergies = ['海鲜', '花生', '芒果', '牛奶', '鸡蛋']

  const toggleItem = (
    category: keyof DietPreferences,
    item: string
  ) => {
    const currentList = diet[category] || []
    const updatedList = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item]
    onChange('diet_preferences', {
      ...diet,
      [category]: updatedList,
    })
  }

  const isSelected = (category: keyof DietPreferences, item: string) => {
    return diet[category]?.includes(item) ?? false
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
      <div className="flex items-center gap-2 mb-3">
        <Utensils size={18} className="text-amber-500" />
        <h4 className="font-medium text-stone-700">饮食偏好</h4>
      </div>

      {/* 喜欢的食物 */}
      <div className="mb-3">
        <p className="text-xs text-stone-400 mb-2">❤️ 喜欢的食物</p>
        <div className="flex flex-wrap gap-1.5">
          {commonFavorites.map((item) => {
            const selected = isSelected('favorites', item)
            return (
              <button
                key={item}
                onClick={() => editing && toggleItem('favorites', item)}
                disabled={!editing}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-colors',
                  selected
                    ? 'bg-amber-200 text-amber-700'
                    : 'bg-white text-stone-400 border border-stone-200',
                  editing && 'hover:border-amber-300 cursor-pointer',
                  !editing && 'cursor-default'
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      {/* 饮食习惯/不喜欢 */}
      <div className="mb-3">
        <p className="text-xs text-stone-400 mb-2">🙅 不吃/少吃</p>
        <div className="flex flex-wrap gap-1.5">
          {commonDislikes.map((item) => {
            const selected = isSelected('dislikes', item)
            return (
              <button
                key={item}
                onClick={() => editing && toggleItem('dislikes', item)}
                disabled={!editing}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-colors',
                  selected
                    ? 'bg-stone-200 text-stone-600'
                    : 'bg-white text-stone-400 border border-stone-200',
                  editing && 'hover:border-stone-300 cursor-pointer',
                  !editing && 'cursor-default'
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      {/* 过敏食物 */}
      <div>
        <p className="text-xs text-stone-400 mb-2">⚠️ 过敏/忌口</p>
        <div className="flex flex-wrap gap-1.5">
          {commonAllergies.map((item) => {
            const selected = isSelected('allergies', item)
            return (
              <button
                key={item}
                onClick={() => editing && toggleItem('allergies', item)}
                disabled={!editing}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-colors',
                  selected
                    ? 'bg-red-100 text-red-600'
                    : 'bg-white text-stone-400 border border-stone-200',
                  editing && 'hover:border-red-300 cursor-pointer',
                  !editing && 'cursor-default'
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 情绪指南部分
function EmotionalSection({
  manual,
  editing,
  onChange,
}: {
  manual: UserManual
  editing: boolean
  onChange: (field: keyof NonNullable<UserManual['emotional_guide']>, value: string) => void
}) {
  const guide = manual.emotional_guide || {}

  const fields = [
    { key: 'when_sad' as const, label: '难过时', emoji: '😢', placeholder: '怎么哄我...' },
    { key: 'when_angry' as const, label: '生气时', emoji: '😤', placeholder: '怎么安抚我...' },
    { key: 'when_stressed' as const, label: '压力大时', emoji: '😫', placeholder: '怎么支持我...' },
  ]

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={18} className="text-pink-500" />
        <h4 className="font-medium text-stone-700">情绪指南</h4>
      </div>

      <div className="space-y-3">
        {fields.map(({ key, label, emoji, placeholder }) => (
          <div key={key}>
            <p className="text-xs text-stone-400 mb-1">
              {emoji} {label}
            </p>
            {editing ? (
              <textarea
                value={guide[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-pink-200 focus:border-pink-400 outline-none resize-none"
                rows={2}
              />
            ) : (
              <p className="text-sm text-stone-600 bg-white/50 rounded-xl p-2">
                {guide[key] || '暂无说明'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 主卡片组件
export function ManualCard({ manual, isOwner, onUpdate }: ManualCardProps) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<UserManual>>(manual)

  const handleFieldChange = (field: keyof UserManual, value: string | DietPreferences) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEmotionalChange = (
    field: keyof NonNullable<UserManual['emotional_guide']>,
    value: string
  ) => {
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
    setEditData(manual)
    setEditing(false)
  }

  const displayManual = editing ? (editData as UserManual) : manual

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <h3 className="font-medium text-stone-800">
            {isOwner ? '我的说明书' : 'Ta的说明书'}
          </h3>
        </div>
        {isOwner && (
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X size={18} />
              </button>
              <button
                onClick={handleSave}
                className="p-2 text-green-500 hover:bg-green-50 rounded-full"
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-full"
            >
              <Edit2 size={18} />
            </button>
          )
        )}
      </div>

      {/* 各部分内容 */}
      <SizeSection
        manual={displayManual}
        editing={editing}
        onChange={handleFieldChange}
      />
      <DietSection
        manual={displayManual}
        editing={editing}
        onChange={handleFieldChange}
      />
      <EmotionalSection
        manual={displayManual}
        editing={editing}
        onChange={handleEmotionalChange}
      />

      {/* 提示 */}
      {isOwner && !editing && (
        <p className="text-xs text-stone-400 text-center">
          💡 完善说明书，让 Ta 更懂你
        </p>
      )}
    </div>
  )
}

// 头像切换器
interface AvatarSwitcherProps {
  current: 'mine' | 'partner'
  onChange: (who: 'mine' | 'partner') => void
}

export function AvatarSwitcher({ current, onChange }: AvatarSwitcherProps) {
  return (
    <div className="flex justify-center gap-6 py-4">
      <button
        onClick={() => onChange('mine')}
        className={cn(
          'flex flex-col items-center gap-2 transition-all',
          current === 'mine' ? 'scale-110' : 'opacity-50'
        )}
      >
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2',
            current === 'mine'
              ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300'
              : 'bg-stone-100 border-stone-200'
          )}
        >
          😊
        </div>
        <span className="text-xs text-stone-600">我</span>
      </button>

      <div className="flex items-center">
        <span className="text-xl">💕</span>
      </div>

      <button
        onClick={() => onChange('partner')}
        className={cn(
          'flex flex-col items-center gap-2 transition-all',
          current === 'partner' ? 'scale-110' : 'opacity-50'
        )}
      >
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2',
            current === 'partner'
              ? 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-300'
              : 'bg-stone-100 border-stone-200'
          )}
        >
          🥰
        </div>
        <span className="text-xs text-stone-600">Ta</span>
      </button>
    </div>
  )
}
