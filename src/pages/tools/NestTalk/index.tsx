import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { HomeView } from './views/HomeView'
import { ChatModal } from './components/ChatModal'
import { RadarView } from './views/RadarView'
import { BottomNav } from './components/BottomNav'

type ViewType = 'home' | 'radar'

export function NestTalkPage() {
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [chatModalOpen, setChatModalOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 overflow-hidden">
      <PageHeader title="语筑" />
      <main className="flex-1 overflow-y-auto w-full relative">
        {currentView === 'home' && <HomeView onNavigate={() => setChatModalOpen(true)} />}
        {currentView === 'radar' && <RadarView />}
      </main>
      <BottomNav active={currentView} onChange={(v: string) => setCurrentView(v as ViewType)} />

      <ChatModal isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)} />
    </div>
  )
}
