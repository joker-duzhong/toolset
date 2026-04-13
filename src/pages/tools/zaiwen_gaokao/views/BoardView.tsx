import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  Sparkles,
  ChevronRight,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { boardApi } from '../services/api';
import type { BoardPost } from '../types';
import { cn } from '@/utils/cn';

export function BoardView() {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'hot'>('new');

  useEffect(() => {
    fetchList();
  }, [sortBy]);

  const fetchList = async (schoolName?: string) => {
    setLoading(true);
    try {
      const res = await boardApi.getList({ 
        school_name: schoolName, 
        sort_by: sortBy 
      });
      if (res.code === 200 && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList(search);
  };

  const handleVote = async (postId: string, option: 'red' | 'green') => {
    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId ? { 
        ...p, 
        red_count: option === 'red' ? p.red_count + 1 : p.red_count,
        green_count: option === 'green' ? p.green_count + 1 : p.green_count,
      } : p
    ));
    
    try {
      const res = await boardApi.vote({ post_id: postId, option });
      if (res.code !== 200) {
        // Rollback
        setPosts(prev => prev.map(p => 
          p.id === postId ? { 
            ...p, 
            red_count: option === 'red' ? p.red_count - 1 : p.red_count,
            green_count: option === 'green' ? p.green_count - 1 : p.green_count,
          } : p
        ));
      }
    } catch (err) {
      console.error(err);
      // Rollback on network error
      setPosts(prev => prev.map(p => 
        p.id === postId ? { 
          ...p, 
          red_count: option === 'red' ? p.red_count - 1 : p.red_count,
          green_count: option === 'green' ? p.green_count - 1 : p.green_count,
        } : p
      ));
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 overflow-x-hidden bg-gray-50/30">
      {/* Header & Search */}
      <div className="px-6 pt-8 pb-6 bg-white border-b border-gray-100">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
           志愿逻辑 <span className="text-rose-500">红</span><span className="text-emerald-500">黑</span> 榜
        </h1>
        <p className="text-gray-400 text-sm font-bold mb-6">为你揭开“官方名片”下的真实经验</p>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="搜学校，看真相..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </form>

        <div className="flex gap-2 mt-4">
          {(['new', 'hot'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                sortBy === s ? "bg-slate-900 text-white shadow-lg" : "bg-gray-50 text-gray-400"
              )}
            >
              {s === 'new' ? '最新收录' : '热议核心'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 22 }}
                  className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col"
                >
                   {/* School & Major Card Header */}
                   <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                         <div className="text-xl font-black text-slate-900 truncate tracking-tight">
                           {post.school_name}
                         </div>
                         <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded-lg inline-block truncate max-w-full">
                           {post.major_name}
                         </div>
                      </div>
                      <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                   </div>

                   <div className="text-gray-600 text-[14px] leading-relaxed mb-6 font-medium line-clamp-3 italic">
                     “ {post.content} ”
                   </div>

                   {/* AI Insight Peek */}
                   {post.has_ai_summary && (
                     <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <Sparkles className="size-4 text-amber-500 shrink-0" />
                        <div className="text-[11px] font-bold text-slate-500 line-clamp-1">
                          AI 总结：{post.ai_summary}
                        </div>
                        <ChevronRight className="size-3 text-slate-300 ml-auto" />
                     </div>
                   )}

                   <div className="mt-auto">
                      {/* Progress Indicator */}
                      <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2 px-1 uppercase tracking-widest">
                         <span>RED (踩坑 ({post.red_count}))</span>
                         <span>GREEN (避雷 ({post.green_count}))</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(post.red_count / (post.red_count + post.green_count || 1)) * 100}%` }}
                            className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" 
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(post.green_count / (post.red_count + post.green_count || 1)) * 100}%` }}
                            className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                          />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVote(post.id, 'red')}
                          className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-100 bg-rose-50/30 text-rose-600 font-black text-xs transition-colors hover:bg-rose-50"
                        >
                          <ThumbsDown className="size-3.5" />
                          🔴 踩坑预警
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVote(post.id, 'green')}
                          className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-emerald-100 bg-emerald-50/30 text-emerald-600 font-black text-xs transition-colors hover:bg-emerald-50"
                        >
                          <ThumbsUp className="size-3.5" />
                          🟢 逻辑通过
                        </motion.button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
