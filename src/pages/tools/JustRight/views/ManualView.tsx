// 说明书视图
import { useState } from 'react'
import { ManualCard } from '../components/ManualSection'
import type { UserManual } from '../types'

interface ManualViewProps {
  myManual: UserManual
  partnerManual: UserManual
  onUpdate: (data: Partial<UserManual>) => void
}

export function ManualView({
  myManual,
  partnerManual,
  onUpdate,
}: ManualViewProps) {
  const [currentView, setCurrentView] = useState<'mine' | 'partner'>('mine')

  const isMine = currentView === 'mine'
  const currentManual = isMine ? myManual : partnerManual

  return (
    <div className="min-h-full pb-6">
      <div className="bg-gradient-to-b from-violet-50 to-transparent pt-4 pb-6">
        <div className="mx-auto flex w-fit rounded-full bg-white/80 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setCurrentView('mine')}
            className={`rounded-full px-4 py-2 text-sm ${isMine ? 'bg-stone-900 text-white' : 'text-stone-500'}`}
          >
            我的
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('partner')}
            className={`rounded-full px-4 py-2 text-sm ${!isMine ? 'bg-stone-900 text-white' : 'text-stone-500'}`}
          >
            Ta 的
          </button>
        </div>
      </div>

      {/* 说明书内容 */}
      <div className="px-4">
        <ManualCard
          manual={currentManual}
          isOwner={isMine}
          onClose={() => undefined}
          onUpdate={onUpdate}
        />
      </div>

      {/* 装饰 */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2 text-xs text-stone-300">
          <span>📖</span>
          <span>了解彼此，珍惜彼此</span>
          <span>💕</span>
        </div>
      </div>
    </div>
  )
}
