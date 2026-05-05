// 纪念日表单模态框
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Repeat, Moon, Sun } from 'lucide-react'
import type { Anniversary } from '../types'

interface AnniversaryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Anniversary, 'id' | 'couple_id' | 'is_deleted' | 'created_at' | 'updated_at'>) => void
  initialData?: Anniversary
}

const ICONS = ['🎂', '💝', '🎉', '🌹', '💍', '🎁', '✨', '💕', '🎈', '🌟']

export function AnniversaryFormModal({ isOpen, onClose, onSubmit, initialData }: AnniversaryFormModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [targetDate, setTargetDate] = useState(initialData?.target_date || '')
  const [type, setType] = useState<'countup' | 'countdown'>(initialData?.type || 'countdown')
  const [repeatType, setRepeatType] = useState<'yearly' | 'monthly' | 'once'>(initialData?.repeat_type || 'yearly')
  const [isLunar, setIsLunar] = useState(initialData?.is_lunar || false)
  const [icon, setIcon] = useState(initialData?.icon || '🎂')
  const [description, setDescription] = useState(initialData?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !targetDate) {
      return
    }

    onSubmit({
      title: title.trim(),
      target_date: targetDate,
      type,
      repeat_type: repeatType,
      is_lunar: isLunar,
      icon,
      description: description.trim() || undefined,
    })

    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[60]"
          />

          {/* 表单模态框 */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-800 text-lg">
                {initialData ? '编辑纪念日' : '添加纪念日'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 bg-stone-50 rounded-full text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  纪念日名称
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：我们的第一次约会"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                  required
                />
              </div>

              {/* 日期 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  日期
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                  required
                />
              </div>

              {/* 农历/阳历切换 */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  {isLunar ? <Moon size={18} className="text-amber-600" /> : <Sun size={18} className="text-amber-600" />}
                  <span className="text-sm font-medium text-stone-700">
                    {isLunar ? '农历日期' : '阳历日期'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLunar(!isLunar)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isLunar ? 'bg-amber-400' : 'bg-stone-300'
                  }`}
                >
                  <motion.div
                    layout
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ left: isLunar ? '28px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* 类型选择 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  纪念日类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('countdown')}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      type === 'countdown'
                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Calendar size={20} className="mx-auto mb-1" />
                    <span className="text-sm font-medium">倒计时</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('countup')}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      type === 'countup'
                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Repeat size={20} className="mx-auto mb-1" />
                    <span className="text-sm font-medium">正计时</span>
                  </button>
                </div>
              </div>

              {/* 重复类型 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  重复频率
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['yearly', 'monthly', 'once'] as const).map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setRepeatType(rt)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        repeatType === rt
                          ? 'bg-rose-400 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {rt === 'yearly' ? '每年' : rt === 'monthly' ? '每月' : '仅一次'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 图标选择 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  选择图标
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-3 rounded-xl text-2xl transition-all ${
                        icon === ic
                          ? 'bg-rose-100 ring-2 ring-rose-400'
                          : 'bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* 描述（可选） */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="添加一些特别的回忆..."
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
                />
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all shadow-lg shadow-rose-200"
              >
                {initialData ? '保存修改' : '添加纪念日'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
