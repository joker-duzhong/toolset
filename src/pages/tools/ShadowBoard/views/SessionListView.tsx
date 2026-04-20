import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoCard } from '../components/BentoCard';
import { useBoardSessions } from '../hooks/useBoardSessions';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SessionListViewProps {
  onSelectSession: (id: string) => void;
  onNewSession: (topic: string) => void;
}

export function SessionListView({ onSelectSession, onNewSession }: SessionListViewProps) {
  const { sessions, loading, refresh } = useBoardSessions();
  const [topicInput, setTopicInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    onNewSession(topicInput.trim());
    setTopicInput('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-12 md:mb-20 text-center flex flex-col items-center"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full mb-6 shadow-sm">
          <Sparkles className="size-3.5" /> ShadowBoard Engine
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight mb-4 selection:bg-slate-200">
          Not your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 line-through">yes-men</span>.
          <br/> Great products are born <br/> from great debates.
        </h1>
        <p className="text-slate-500 max-w-xl text-lg md:text-xl font-medium mt-2">
          抛出一个危险的想法，一支由 AI 构建的顶配高管团队将为你展开无情的辩论与撕逼。
        </p>
      </motion.div>

      {/* 新建议题区 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-16 relative z-10"
      >
        <form onSubmit={handleCreate} className={cn(
          "w-full max-w-2xl bg-white/80 backdrop-blur-xl p-2 rounded-3xl border transition-all duration-300 flex items-center shadow-lg",
          isFocused ? "border-indigo-400 ring-4 ring-indigo-50" : "border-slate-200/60"
        )}>
          <div className="pl-4 pr-3 text-indigo-400">
            <Plus className="size-6" />
          </div>
          <input 
            type="text" 
            placeholder="Propose a dangerous idea... (e.g. 给 App 加一个盲盒抽奖功能)"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent border-none outline-none text-lg py-4 text-slate-700 placeholder:text-slate-300 font-medium"
          />
          <button 
            type="submit"
            disabled={!topicInput.trim()}
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 px-6 py-4 rounded-2xl font-bold transition-all ml-2"
          >
            召开董事会
          </button>
        </form>
      </motion.div>

      {/* 历史议题列表 Bento Box */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            最近的想法 (Recent Ideas) 
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{sessions.length}</span>
          </h2>
          <button onClick={refresh} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 cursor-pointer">
            <Loader2 className={cn("size-5", loading && "animate-spin")} />
          </button>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="py-20 flex justify-center">
             <Loader2 className="size-10 text-indigo-200 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400">
             这里还没有议题，赶紧抛出一个引发战争的想法吧。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
               {sessions.map(session => (
                 <BentoCard 
                    key={session.id} 
                    session={session} 
                    layoutId={`session-card-${session.id}`}
                    onClick={() => onSelectSession(session.id)}
                 />
               ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
