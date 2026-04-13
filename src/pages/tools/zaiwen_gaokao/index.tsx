import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from './components/BottomNav';
import { TreeholeView } from './views/TreeholeView';
import { BoardView } from './views/BoardView';
import { RoomsView } from './views/RoomsView';
import { ProfileView } from './views/ProfileView';
import type { GkTabKey } from './types';

export function ZaiwenGaokaoPage() {
  const [activeTab, setActiveTab] = useState<GkTabKey>('treehole');
  const [showPublish, setShowPublish] = useState(false);

  const renderView = () => {
    switch (activeTab) {
      case 'treehole':
        return <TreeholeView />;
      case 'board':
        return <BoardView />;
      case 'rooms':
        return <RoomsView />;
      case 'user':
        return <ProfileView />;
      default:
        return <TreeholeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Dynamic Header */}
      <PageHeader 
        title={
          activeTab === 'treehole' ? '双面树洞' : 
          activeTab === 'board' ? '红黑逻辑' : 
          activeTab === 'rooms' ? '瞬时战友' : 
          activeTab === 'user' ? '个人中心' : '在问高考'
        } 
        showBack={true}
      />

      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto relative px-safe-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28, duration: 0.3 }}
            className="w-full h-full"
          >
            <Suspense fallback={<ViewLoading />}>
               {renderView()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistence Floating UI (Optional) */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Persistent Floating Action Button */}
      {(activeTab === 'treehole' || activeTab === 'board') && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPublish(true)}
          className="fixed bottom-24 right-6 size-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl z-40"
        >
          <Plus className="size-7" />
        </motion.button>
      )}

      {/* Publish Overlay Portal (Draft) */}
      <AnimatePresence>
        {showPublish && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPublish(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            {activeTab === 'treehole' ? (
              <TreeholePublish onClose={() => setShowPublish(false)} />
            ) : (
              <BoardPublish onClose={() => setShowPublish(false)} />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { mutate } from 'swr';
// ... existing ViewLoading ...

/** --- Publish Components (Internal to file for now or moved to components later) --- */

import { X, SendHorizontal, Loader2 } from 'lucide-react';
import { treeholeApi, boardApi } from './services/api';
import { cn } from '@/utils/cn';

function TreeholePublish({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'emo' | 'help'>('emo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (content.length < 10) return alert('再多写一点吧，至少 10 个字');
    setLoading(true);
    try {
      const res = await treeholeApi.createPost({ content, type });
      if (res.code === 200) {
        onClose();
        mutate(key => typeof key === 'string' && key.startsWith('/treehole/feed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">此刻的想法</h3>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400"><X /></button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['emo', 'help'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "px-5 py-2 rounded-2xl text-sm font-semibold transition-all",
              type === t ? (t === 'emo' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600") : "bg-gray-50 text-gray-400"
            )}
          >
            {t === 'emo' ? '🌙 Emo 宣泄' : '💡 打听求助'}
          </button>
        ))}
      </div>

      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={type === 'emo' ? "最近压力真的好大..." : "有没有学长学姐知道..."}
        className="w-full h-48 bg-gray-50 rounded-3xl p-5 text-gray-800 focus:ring-2 focus:ring-indigo-100 outline-none resize-none mb-6 border-none"
      />

      <button
        disabled={loading || content.length < 10}
        onClick={handleSubmit}
        className="w-full h-14 bg-slate-900 rounded-2xl text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <SendHorizontal size={20} />}
        发布到宇宙
      </button>
    </motion.div>
  );
}

function BoardPublish({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ school: '', major: '', content: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.school || !form.major || !form.content) return;
    setLoading(true);
    try {
      const res = await boardApi.createPost({ 
        school_name: form.school, 
        major_name: form.major, 
        content: form.content 
      });
      if (res.code === 200) {
        onClose();
        mutate(key => typeof key === 'string' && key.startsWith('/board/feed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">建立红黑档案</h3>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400"><X /></button>
      </div>

      <div className="space-y-4 mb-6">
        <input 
          placeholder="学校名称 (如：XX大学)"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          className="w-full h-12 bg-gray-50 rounded-2xl px-5 border-none focus:ring-2 focus:ring-rose-100"
        />
        <input 
          placeholder="专业名称 (如：计算机科学)"
          value={form.major}
          onChange={(e) => setForm({ ...form, major: e.target.value })}
          className="w-full h-12 bg-gray-50 rounded-2xl px-5 border-none focus:ring-2 focus:ring-rose-100"
        />
        <textarea
          placeholder="请描述推荐或避雷的理由..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full h-32 bg-gray-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-rose-100 resize-none"
        />
      </div>

      <button
        disabled={loading || !form.school || !form.major || !form.content}
        onClick={handleSubmit}
        className="w-full h-14 bg-rose-500 rounded-2xl text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : '收录档案'}
      </button>
    </motion.div>
  );
}

function ViewLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
