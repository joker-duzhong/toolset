import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { BoardSession } from '../types';
import { Activity, CircleCheck } from 'lucide-react';

interface BentoCardProps {
  session: BoardSession;
  onClick: () => void;
  layoutId?: string;
}

export function BentoCard({ session, onClick, layoutId }: BentoCardProps) {
  const isRunning = session.status === 'scoring' || session.status === 'speaking';
  
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 leading-tight">
          {session.topic || '未命名议题'}
        </h3>
        <div className="flex-shrink-0">
          {isRunning ? (
            <Activity className="size-5 text-indigo-500 animate-pulse" />
          ) : session.status === 'done' ? (
            <CircleCheck className="size-5 text-emerald-500" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block mt-1.5" />
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-auto text-sm text-slate-500 font-medium">
        <div className="flex -space-x-2 mr-2">
          {session.roles_config?.slice(0, 3).map((role, idx) => (
            <div 
              key={idx} 
              className="size-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm"
              title={role}
            >
              {role.substring(0, 1)}
            </div>
          ))}
          {(session.roles_config?.length || 0) > 3 && (
            <div className="size-7 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
              +{(session.roles_config.length - 3)}
            </div>
          )}
        </div>
        
        <span className="ml-auto text-xs bg-slate-100/50 px-2 py-1 rounded-md">
          {/* eslint-disable-next-line react-hooks/purity */}
          {formatDistanceToNow(new Date(session.updated_at || session.created_at || Date.now()), { locale: zhCN, addSuffix: true })}
        </span>
      </div>
      
      {isRunning && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/50 block group-hover:w-full w-1/3 transition-all duration-500 ease-out" />
      )}
    </motion.div>
  );
}
