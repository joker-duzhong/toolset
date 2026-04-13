import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { treeholeApi } from '../services/api';
import type { TreeholePost, PostType } from '../types';
import { cn } from '@/utils/cn';

export function TreeholeView() {
  const [posts, setPosts] = useState<TreeholePost[]>([]);
  const [activeTab, setActiveTab] = useState<PostType>('emo');
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadingState = useRef({ loading, isFetchingMore, hasMore, cursor });

  useEffect(() => {
    loadingState.current = { loading, isFetchingMore, hasMore, cursor };
  }, [loading, isFetchingMore, hasMore, cursor]);

  useEffect(() => {
    fetchFeed(true);
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const state = loadingState.current;
        if (entries[0].isIntersecting && state.hasMore && !state.loading && !state.isFetchingMore) {
          fetchFeedRef.current(false, state.cursor);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchFeedRef = useRef(async (_refresh: boolean, _currentCursor?: string) => {});

  const fetchFeed = async (refresh = false) => {
    if (refresh) setLoading(true);
    else setIsFetchingMore(true);
    
    try {
      const currentCursor = refresh ? undefined : loadingState.current.cursor;
      const res = await treeholeApi.getFeed(currentCursor);
      if (res.code === 200 && res.data) {
        // filter by type
        const filtered = res.data.filter(p => p.type === activeTab);
        
        if (refresh) {
          setPosts(filtered);
        } else {
          setPosts(prev => [...prev, ...filtered]);
        }
        
        setHasMore(res.data.length > 0);
        if (res.data.length > 0) {
          setCursor(res.data[res.data.length - 1].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  fetchFeedRef.current = fetchFeed;

  // AI Reply Polling
  useEffect(() => {
    const pendingAiPosts = posts.filter(p => p.has_ai_reply === false);
    if (pendingAiPosts.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await treeholeApi.getFeed();
        if (res.code === 200 && res.data) {
          const updated = res.data.filter(p => 
            pendingAiPosts.some(pending => pending.id === p.id) && p.has_ai_reply === true
          );
          
          if (updated.length > 0) {
            setPosts(current => current.map(p => {
              const u = updated.find(up => up.id === p.id);
              return u ? { ...p, ...u } : p;
            }));
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [posts]);

  const handleHug = async (postId: string) => {
    // Optimistic Update
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, hug_count: p.hug_count + 1 } : p
    ));
    
    try {
      const res = await treeholeApi.hugPost(postId);
      if (res.code !== 200) {
        // Rollback on failure
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, hug_count: p.hug_count - 1 } : p
        ));
      }
    } catch (err) {
      console.error(err);
      // Rollback on network error
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, hug_count: p.hug_count - 1 } : p
      ));
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 overflow-x-hidden">
      {/* Header Tabs with LayoutTransition */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-md px-6 py-4 flex gap-6 border-b border-gray-100">
        {(['emo', 'help'] as PostType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative px-2 py-2 text-base font-black tracking-tight transition-all duration-300",
              activeTab === tab ? "text-slate-900" : "text-gray-300"
            )}
          >
            {tab === 'emo' ? 'Emo 宣泄' : '求助打听'}
            {activeTab === tab && (
              <motion.div
                layoutId="tab-underline-treehole"
                className={cn(
                  "absolute -bottom-1 left-0 right-0 h-1 rounded-full",
                  tab === 'emo' ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]" : "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                )}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="p-4 space-y-5 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
             <p className="text-gray-400 font-medium animate-pulse text-sm">正在打捞星光...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white rounded-[2rem] p-6 border border-gray-100/80 shadow-sm"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl overflow-hidden border border-gray-100">
                    <img src={post.author?.avatar_url} alt="" className="size-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">{post.author?.nickname}</span>
                      <span className="text-sm">{post.author?.status_emoji}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(post.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-gray-800 leading-relaxed text-[15px] mb-5 font-medium px-1">
                  {post.content}
                </div>

                {/* AI Reply Area */}
                <div className="mb-5">
                  {post.has_ai_reply && post.ai_reply ? (
                    <motion.div 
                      key="ai-reply"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border border-indigo-100/50 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-20 transition-opacity group-hover:opacity-40">
                         <Sparkles className="size-12 text-indigo-400" />
                      </div>
                      <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs mb-2">
                        <div className="size-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                           <Sparkles size={12} />
                        </div>
                        <span>AI 守护灵的来信</span>
                      </div>
                      <p className="text-indigo-900/80 text-sm leading-relaxed relative z-10 font-medium">
                        {post.ai_reply.content}
                      </p>
                    </motion.div>
                  ) : post.has_ai_reply === false ? (
                    <div className="p-5 rounded-3xl bg-gray-50/50 border border-gray-100 flex items-center gap-3 relative overflow-hidden">
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                      />
                      <Loader2 className="size-4 text-gray-400 animate-spin" />
                      <span className="text-xs text-gray-400 font-medium">AI 守护灵正在赶来为你写信...</span>
                    </div>
                  ) : null}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleHug(post.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold text-sm",
                      "bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-500"
                    )}
                  >
                    <Heart className={cn("size-4", post.hug_count > 0 && "fill-rose-400 text-rose-400")} />
                    <span>{post.hug_count > 0 ? post.hug_count : '抱抱'}</span>
                  </motion.button>

                  <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                    <MessageSquare size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Infinite Scroll Sentinel */}
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {isFetchingMore && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-xs font-medium">正在探寻深处的树洞...</span>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
             <div className="text-gray-300 text-xs font-medium py-10">
               - 已经到达树洞的最深处 -
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
