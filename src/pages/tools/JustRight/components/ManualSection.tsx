import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { DietPreferences, EmotionalGuide, ExtraInfo, UserManual } from '../types'

interface ManualCardProps {
  manual: UserManual
  isOwner: boolean
  onClose?: () => void
  onUpdate: (data: Partial<UserManual>) => Promise<void> | void
}

const Tabs = ['尺码档案', '饮食偏好', '情绪指南'] as const
type TabType = typeof Tabs[number]
type ManualStringField = 'shoe_size' | 'clothes_size' | 'pants_size' | 'ring_size'
type ManualChange = <K extends keyof UserManual>(field: K, value: UserManual[K]) => void

const toText = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').join('，')
  return typeof value === 'string' ? value : ''
}

const parseTags = (value: unknown) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
  if (typeof value === 'string') return value.split(/[,，\s]+/).filter(Boolean)
  return []
}

const getExtraText = (data: Partial<UserManual>, key: keyof ExtraInfo, fallbackKey?: ManualStringField) => {
  const extraValue = data.extra_info?.[key]
  if (typeof extraValue === 'string' || Array.isArray(extraValue)) return toText(extraValue)
  return fallbackKey ? toText(data[fallbackKey]) : ''
}

const buildManualPayload = (manual: Partial<UserManual>): Partial<UserManual> => ({
  shoe_size: manual.shoe_size,
  clothes_size: manual.clothes_size,
  pants_size: manual.pants_size,
  ring_size: manual.ring_size,
  diet_preferences: manual.diet_preferences,
  emotional_guide: manual.emotional_guide,
  extra_info: manual.extra_info,
})

export function ManualCard({ manual, isOwner, onClose, onUpdate }: ManualCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('尺码档案')
  const [localManual, setLocalManual] = useState<Partial<UserManual>>(manual || {})
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    setLocalManual(manual || {})
    setSaveStatus('idle')
  }, [manual])

  const handleChange: ManualChange = (field, value) => {
    setLocalManual((prev) => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
  }

  const handleExtraInfoChange = (field: keyof ExtraInfo, value: string) => {
    setLocalManual((prev) => ({
      ...prev,
      extra_info: {
        ...(prev.extra_info || {}),
        [field]: value,
      },
    }))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    if (!isOwner || isSaving) return

    try {
      setIsSaving(true)
      setSaveStatus('idle')
      await onUpdate(buildManualPayload(localManual))
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save manual:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#FAFAFA] overflow-y-auto"
    >
      {/* 头部导航 */}
      <div className="sticky top-0 bg-[#FAFAFA]/90 backdrop-blur-md z-10 px-4 pt-12 pb-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2 text-[#666]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h3 className="font-bold text-[#333] text-lg">
          {isOwner ? '我的说明书' : 'Ta的说明书'}
        </h3>
        <div className="w-10" /> {/* 占位符保持居中 */}
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center px-2">
          {Tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm transition-colors relative ${
                activeTab === tab ? 'text-[#FF7A59] font-bold' : 'text-[#999] font-medium'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tabLine" className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#FF7A59] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-5 pb-20">
        {activeTab === '尺码档案' && (
          <SizeTab data={localManual} isOwner={isOwner} onChange={handleChange} onExtraInfoChange={handleExtraInfoChange} />
        )}
        {activeTab === '饮食偏好' && (
          <DietTab data={localManual} isOwner={isOwner} onChange={handleChange} />
        )}
        {activeTab === '情绪指南' && (
          <EmotionalGuideTab data={localManual} isOwner={isOwner} onChange={handleChange} />
        )}

        <NotesSection data={localManual} isOwner={isOwner} onChange={handleExtraInfoChange} />

        {isOwner && (
          <div className="mt-8 space-y-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 rounded-full bg-[#FFF0E5] text-[#FF7A59] font-bold text-sm hover:opacity-80 transition disabled:opacity-60"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
            {saveStatus === 'saved' && <p className="text-center text-xs text-[#65A30D]">已保存</p>}
            {saveStatus === 'error' && <p className="text-center text-xs text-[#DC2626]">保存失败，请稍后重试</p>}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// --- 尺码档案 Tab ---
function SizeTab({
  data,
  isOwner,
  onChange,
  onExtraInfoChange,
}: {
  data: Partial<UserManual>
  isOwner: boolean
  onChange: ManualChange
  onExtraInfoChange: (key: keyof ExtraInfo, value: string) => void
}) {
  const fields: Array<
    | { source: 'manual'; key: ManualStringField; label: string; placeholder: string }
    | { source: 'extra'; key: keyof ExtraInfo; label: string; placeholder: string; fallbackKey?: ManualStringField }
  > = [
    { source: 'extra', key: 'height_weight', label: '身高/体重', placeholder: '165cm / 52kg' },
    { source: 'manual', key: 'clothes_size', label: '上衣尺码', placeholder: 'M' },
    { source: 'manual', key: 'pants_size', label: '裤子尺码', placeholder: '26 (M)' },
    { source: 'manual', key: 'shoe_size', label: '鞋子尺码', placeholder: '38' },
    { source: 'extra', key: 'underwear_size', label: '内衣尺码', placeholder: '75B', fallbackKey: 'ring_size' },
  ]

  const getFieldValue = (field: (typeof fields)[number]) =>
    field.source === 'manual' ? toText(data[field.key]) : getExtraText(data, field.key, field.fallbackKey)

  const handleCopy = async () => {
    const content = fields.map((field) => `${field.label}：${getFieldValue(field) || '-'}`).join('\n')
    try {
      await navigator.clipboard.writeText(content)
      alert('已复制所有尺码信息')
    } catch {
      alert('复制失败，请手动复制')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="font-bold text-[#333] text-lg">尺码档案</h2>
      
      <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-6">
        {fields.map((field) => (
          <div key={field.label} className="flex justify-between items-center border-b border-[#F5F5F5] pb-4 last:border-0 last:pb-0">
            <span className="text-[#666] text-sm">{field.label}</span>
            {isOwner ? (
              <input
                type="text"
                value={getFieldValue(field)}
                onChange={(e) => {
                  if (field.source === 'manual') {
                    onChange(field.key, e.target.value)
                    return
                  }
                  onExtraInfoChange(field.key, e.target.value)
                }}
                placeholder={field.placeholder}
                className="text-right text-[#333] font-medium text-sm outline-none w-1/2"
              />
            ) : (
              <span className="text-[#333] font-medium text-sm">{getFieldValue(field) || '-'}</span>
            )}
          </div>
        ))}

        {!isOwner && (
          <button 
            type="button"
            onClick={handleCopy}
            className="w-full mt-4 py-3 rounded-full bg-[#FFF0E5] text-[#FF7A59] font-bold text-sm hover:opacity-80 transition"
          >
            一键复制
          </button>
        )}
      </div>
    </motion.div>
  )
}

// --- 饮食偏好 Tab ---
function DietTab({ data, isOwner, onChange }: { data: Partial<UserManual>, isOwner: boolean, onChange: ManualChange }) {
  const diet: DietPreferences = data.diet_preferences || {}
  const favorites = parseTags(diet.favorites)
  const dislikes = parseTags(diet.dislikes)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* 喜欢 */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h3 className="font-bold text-[#333] mb-4 flex items-center gap-2">
          喜欢 <span className="text-xl">👍</span>
        </h3>
        
        {isOwner ? (
           <textarea
             value={toText(diet.favorites)}
             onChange={(e) => onChange('diet_preferences', { ...diet, favorites: e.target.value })}
             placeholder="输入喜欢的食物，用逗号隔开"
             className="w-full text-sm bg-[#F0FDF4] p-3 rounded-xl outline-none resize-none text-[#15803D]"
             rows={3}
           />
        ) : (
          <div className="flex flex-wrap gap-3">
            {favorites.length > 0 ? favorites.map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-sm font-medium">
                {tag}
              </span>
            )) : <span className="text-[#999] text-sm">Ta还没有填写哦</span>}
          </div>
        )}
      </div>

      {/* 讨厌/过敏 */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h3 className="font-bold text-[#333] mb-4 flex items-center gap-2">
          过敏 / 讨厌 <span className="text-xl">👎</span>
        </h3>
        
        {isOwner ? (
           <textarea
             value={toText(diet.dislikes)}
             onChange={(e) => onChange('diet_preferences', { ...diet, dislikes: e.target.value })}
             placeholder="输入讨厌的食物，用逗号隔开"
             className="w-full text-sm bg-[#FEF2F2] p-3 rounded-xl outline-none resize-none text-[#B91C1C]"
             rows={3}
           />
        ) : (
          <div className="flex flex-wrap gap-3">
            {dislikes.length > 0 ? dislikes.map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-[#FFEBEE] text-[#C62828] rounded-full text-sm font-medium">
                {tag}
              </span>
            )) : <span className="text-[#999] text-sm">Ta还没有填写哦</span>}
          </div>
        )}
      </div>

    </motion.div>
  )
}

// --- 情绪指南 Tab ---
function EmotionalGuideTab({ data, isOwner, onChange }: { data: Partial<UserManual>, isOwner: boolean, onChange: ManualChange }) {
  const guide: EmotionalGuide = data.emotional_guide || {}
  const textFields: Array<{ key: keyof EmotionalGuide; label: string; placeholder: string; className: string }> = [
    { key: 'when_sad', label: '难过时', placeholder: '比如：先抱抱我，不急着讲道理', className: 'bg-[#F5F8FF] text-[#2563EB]' },
    { key: 'when_angry', label: '生气时', placeholder: '比如：给我一点时间冷静，再好好说', className: 'bg-[#FEF2F2] text-[#B91C1C]' },
    { key: 'when_stressed', label: '压力大时', placeholder: '比如：帮我拆小任务，陪我散步', className: 'bg-[#FFF7ED] text-[#C2410C]' },
    { key: 'love_languages', label: '爱的语言', placeholder: '比如：陪伴，肯定的话，仪式感', className: 'bg-[#FFF0F6] text-[#BE185D]' },
    { key: 'comfort_items', label: '安慰小物', placeholder: '比如：热奶茶，毛毯，喜欢的歌单', className: 'bg-[#F0FDF4] text-[#15803D]' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="font-bold text-[#333] text-lg">情绪指南</h2>

      {textFields.map((field) => {
        const value = guide[field.key]
        const tags = parseTags(value)

        return (
          <div key={field.key} className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-[#333] mb-3">{field.label}</h3>
            {isOwner ? (
              <textarea
                value={toText(value)}
                onChange={(e) => onChange('emotional_guide', { ...guide, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className={`w-full text-sm p-3 rounded-xl outline-none resize-none ${field.className}`}
                rows={3}
              />
            ) : tags.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span key={`${field.key}-${index}`} className={`px-3 py-1.5 rounded-full text-sm font-medium ${field.className}`}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#333] text-sm leading-relaxed bg-[#FAFAFA] p-3 rounded-xl">
                {toText(value) || 'Ta还没有填写哦'}
              </p>
            )}
          </div>
        )
      })}
    </motion.div>
  )
}

function NotesSection({
  data,
  isOwner,
  onChange,
}: {
  data: Partial<UserManual>
  isOwner: boolean
  onChange: (key: keyof ExtraInfo, value: string) => void
}) {
  const notes = toText(data.extra_info?.notes)

  return (
    <div className="mt-8">
      <h3 className="text-[#666] text-sm mb-3">其他备注</h3>
      {isOwner ? (
        <textarea
          value={notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="写下更多需要 Ta 记住的小细节"
          className="w-full text-[#333] text-sm bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] outline-none resize-none"
          rows={3}
        />
      ) : (
        <p className="text-[#333] text-sm bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          {notes || 'Ta还没有填写备注哦'}
        </p>
      )}
    </div>
  )
}
