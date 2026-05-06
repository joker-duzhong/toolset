import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Moon, Repeat, X } from 'lucide-react'
import type { Anniversary, AnniversaryPayload } from '../types'
import { cn } from '@/utils/cn'

interface AnniversaryFormModalProps {
  isOpen: boolean
  initialValue?: Anniversary | null
  onClose: () => void
  onSubmit: (data: AnniversaryPayload) => Promise<void> | void
}

const ICONS = ['🎂', '💝', '✈️', '🏠', '🎁', '💍', '✨']

const repeatOptions: Array<{ value: NonNullable<AnniversaryPayload['repeat_type']>; label: string }> = [
  { value: 'yearly', label: '每年' },
  { value: 'monthly', label: '每月' },
  { value: 'once', label: '仅一次' },
]

export function AnniversaryFormModal({ isOpen, initialValue, onClose, onSubmit }: AnniversaryFormModalProps) {
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState('🎂')
  const [isLunar, setIsLunar] = useState(false)
  const [repeatType, setRepeatType] = useState<NonNullable<AnniversaryPayload['repeat_type']>>('yearly')
  const [submitting, setSubmitting] = useState(false)
  const isEditMode = Boolean(initialValue)

  useEffect(() => {
    if (!isOpen) return

    setTitle(initialValue?.title || '')
    setTargetDate(initialValue?.target_date || '')
    setIcon(initialValue?.icon || '🎂')
    setIsLunar(Boolean(initialValue?.is_lunar))
    setRepeatType(initialValue?.repeat_type || 'yearly')
  }, [initialValue, isOpen])

  const resetForm = () => {
    setTitle('')
    setTargetDate('')
    setIcon('🎂')
    setIsLunar(false)
    setRepeatType('yearly')
  }

  const handleClose = () => {
    if (submitting) return
    resetForm()
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle || !targetDate) return

    try {
      setSubmitting(true)
      await onSubmit({
        title: trimmedTitle,
        target_date: targetDate,
        is_lunar: isLunar,
        repeat_type: repeatType,
        icon,
      })
      resetForm()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#FAFAFA] rounded-t-[32px] p-6 pb-12 z-[70] shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-[#E5E5E5] rounded-full mx-auto mb-6" />

            <div className="mb-6 flex items-center justify-between">
              <div className="w-8" />
              <h3 className="font-bold text-[#333] text-lg text-center">{isEditMode ? '编辑纪念日' : '添加纪念日'}</h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-full bg-white p-2 text-[#999] shadow-sm disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#F5F5F5]">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="纪念日名称 (如：第一次旅行)"
                  maxLength={100}
                  className="w-full bg-transparent text-[#333] font-medium outline-none placeholder-[#999]"
                  required
                />
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#F5F5F5]">
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-transparent text-[#333] font-medium outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666] mb-3 ml-1">重复方式</label>
                <div className="grid grid-cols-3 gap-2">
                  {repeatOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRepeatType(option.value)}
                      className={cn(
                        'inline-flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-bold transition',
                        repeatType === option.value
                          ? 'border-[#FFB199] bg-[#FFF0E5] text-[#FF7A59]'
                          : 'border-[#F5F5F5] bg-white text-[#8A817A]',
                      )}
                    >
                      <Repeat size={14} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLunar((value) => !value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl border p-4 text-sm font-bold transition',
                  isLunar ? 'border-[#FFB199] bg-[#FFF0E5] text-[#FF7A59]' : 'border-[#F5F5F5] bg-white text-[#8A817A]',
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Moon size={16} />
                  按农历日期提醒
                </span>
                <span className="text-xs">{isLunar ? '已开启' : '未开启'}</span>
              </button>

              <div>
                <label className="block text-sm font-medium text-[#666] mb-3 ml-1">选择专属图标</label>
                <div className="flex justify-between">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={cn(
                        'text-2xl p-2 rounded-xl transition',
                        icon === ic ? 'bg-[#FFF0E5] scale-110' : 'grayscale-[50%] opacity-60',
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!title.trim() || !targetDate || submitting}
                className="w-full mt-8 py-4 bg-[#FF7A59] text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(255,122,89,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {submitting ? '保存中...' : isEditMode ? '保存修改' : '确认添加'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
