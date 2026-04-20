import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, SendHorizontal, Loader2, StopCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useBoardDebate } from '../hooks/useBoardDebate';
import { DebateBubble } from '../components/DebateBubble';
import { cn } from '@/utils/cn';

interface BoardroomViewProps {
  sessionId: string;
  onBack: () => void;
  initialTopic?: string;
}

export function BoardroomView({ sessionId, onBack, initialTopic }: BoardroomViewProps) {
  const { messages, status, sessionInfo, isLoading, error, sendMessage, retry } = useBoardDebate(sessionId);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const isBusy = status === 'speaking' || status === 'scoring';
  const hasError = status === 'error' || !!error;

  // 自动滚动到底部
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    
    // 如果没有 sessionId，意味着这是一个全新的临时房间，应该带上 initialTopic。
    // 但是这里 sessionId 肯定有，因为 ListView 的 onNewSession 会先调用 create API，或我们在外层控制。
    // 假设父组件或 hook 内部处理好了。
    await sendMessage(input, initialTopic);
    setInput('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ ease: "circOut", duration: 0.3 }}
      className="flex flex-col h-[100dvh] bg-slate-50 w-full"
    >
      {/* 顶部导航 - 毛玻璃 */}
      <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
          >
            <ChevronLeft className="size-6" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1 max-w-[200px] md:max-w-md">
              {sessionInfo?.topic || initialTopic || '新的议题'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
               ShadowBoard Room
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/50 shadow-sm">
          {hasError ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest hidden md:inline-block">Error</span>
            </>
          ) : isBusy ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest hidden md:inline-block">Engine Running</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline-block">Standby</span>
            </>
          )}
        </div>
      </header>

      {/* 聊天内容区 */}
      <main className="flex-1 overflow-y-auto px-4 py-6 content-area">
        <div className="max-w-4xl mx-auto flex flex-col gap-2 relative min-h-full">
          {isLoading && messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center h-full text-slate-300 opacity-50 absolute inset-0">
               <Loader2 className="size-10 animate-spin mb-4" />
               <span className="font-medium tracking-widest text-sm uppercase">Loading Data...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                 <DebateBubble key={msg.id || i} message={msg} />
              ))}

              {/* 错误提示卡片 */}
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 text-sm mb-1">任务执行失败</h3>
                    <p className="text-red-600 text-sm">{error || '董事会讨论出现异常，请重试'}</p>
                  </div>
                  <button
                    onClick={retry}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="size-4" />
                    重试
                  </button>
                </motion.div>
              )}

              <div ref={endRef} className="h-10" />
            </>
          )}
        </div>
      </main>

      {/* 底部输入框 */}
      <footer className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 safe-area-bottom">
        <div className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
           <form onSubmit={handleSubmit} className="flex relative z-10 w-full items-end p-2 bg-slate-50/50">
             <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isBusy) handleSubmit(e);
                  }
                }}
                disabled={isBusy}
                placeholder="Give your orders or thoughts to the board..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[44px] py-3 px-4 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal disabled:text-slate-400"
                rows={1}
             />
             <button 
               type="submit"
               disabled={!input.trim() || isBusy}
               className={cn(
                 "p-3 rounded-xl ml-2 shrink-0 transition-all flex items-center justify-center size-12",
                 input.trim() && !isBusy ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700" : "bg-slate-200 text-slate-400"
               )}
             >
               {isBusy ? <StopCircle className="size-5" /> : <SendHorizontal className="size-5" />}
             </button>
           </form>

           {/* 毛玻璃遮罩（正在辩论中） */}
           {isBusy && (
             <div className="absolute inset-0 z-20 bg-slate-50/60 backdrop-blur-[2px] flex items-center justify-center border-t border-white/50 cursor-not-allowed">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 rounded-full shadow-sm border border-slate-200/50 text-slate-600 font-semibold text-sm">
                 <Loader2 className="size-4 animate-spin text-indigo-500" />
                 高管正在激烈讨论中，请稍候...
               </div>
             </div>
           )}
        </div>
      </footer>
    </motion.div>
  );
}
