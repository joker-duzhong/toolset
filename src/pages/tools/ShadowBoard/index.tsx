import { useState } from 'react';
import { SessionListView } from './views/SessionListView';
import { BoardroomView } from './views/BoardroomView';
import { AnimatePresence, motion } from 'framer-motion';

export function ShadowBoardPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<string | null>(null);

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setNewTopic(null);
  };

  const handleNewSession = (topic: string) => {
    // 这里并没有立刻生成 sessionId，而是将它作为 initialTopic 传递给 BoardroomView
    // 到了内部真正发送第一条消息时，再拿到后端返回的 sessionId
    // 为 UI 连贯，我们使用一个伪造的临时 ID，让界面先切入会议室
    setNewTopic(topic);
    setActiveSessionId(`temp_new_${Date.now()}`);
  };

  const handleBack = () => {
    setActiveSessionId(null);
    setNewTopic(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!activeSessionId ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full absolute inset-0 overflow-y-auto"
          >
            <SessionListView 
              onSelectSession={handleSelectSession} 
              onNewSession={handleNewSession}
            />
          </motion.div>
        ) : (
          <motion.div
            key="room"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-[100dvh] absolute inset-0 z-10"
          >
            <BoardroomView 
              sessionId={activeSessionId.startsWith('temp_new_') ? '' : activeSessionId} 
              initialTopic={newTopic || undefined}
              onBack={handleBack} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
