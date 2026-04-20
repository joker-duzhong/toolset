import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { BoardMessage } from '../types';
import { Triangle, Square, Circle, Hexagon, UserRound, Activity } from 'lucide-react';

interface DebateBubbleProps {
  message: BoardMessage;
}

// 身份标识与色调映射
const ROLE_THEMES: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  CEO: { color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-200', icon: UserRound, label: '发起人' },
  PM: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: Triangle, label: '产品经理' },
  Architect: { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Square, label: '架构师' },
  Designer: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Circle, label: '设计师' },
  QA: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Hexagon, label: '测试专家' },
  System: { color: 'text-slate-500', bg: 'bg-transparent', border: 'border-transparent', icon: Activity, label: '系统' },
};

function getRoleTheme(role: string) {
  // Try exact match
  if (ROLE_THEMES[role]) return ROLE_THEMES[role];
  
  // Generic mappings for unknowns if any
  if (role.toLowerCase().includes('pm')) return ROLE_THEMES.PM;
  if (role.toLowerCase().includes('你') || role.toLowerCase() === 'user' || role === 'CEO') return ROLE_THEMES.CEO;
  
  // Default fallback
  const charCode = role.charCodeAt(0) || 0;
  const fallbacks = [ROLE_THEMES.Architect, ROLE_THEMES.Designer, ROLE_THEMES.QA, ROLE_THEMES.PM];
  return fallbacks[charCode % fallbacks.length];
}

export function DebateBubble({ message }: DebateBubbleProps) {
  const isMe = message.role === 'CEO' || message.role.toLowerCase() === 'user';
  const theme = getRoleTheme(message.role);
  const Icon = theme.icon;

  if (message.role === 'System') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <span className="text-xs text-slate-400 bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/50">
          {message.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={cn(
        "flex w-full gap-3 my-2",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      {!isMe && (
        <div className={cn(
          "size-9 flex-shrink-0 rounded-xl flex items-center justify-center border shadow-sm mt-1",
          theme.bg, theme.border, theme.color
        )}>
          <Icon className="size-5" />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[85%] md:max-w-[75%]",
        isMe ? "items-end" : "items-start"
      )}>
        <span className="text-xs font-semibold text-slate-500 pl-1">
          {isMe ? '我' : message.role} <span className="font-normal opacity-70 ml-1">({theme.label})</span>
        </span>
        
        <div className={cn(
          "px-4 py-3 text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap",
          isMe 
            ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm" 
            : cn("rounded-2xl rounded-tl-sm border", theme.bg, theme.border, "text-slate-800")
        )}>
          {message.content}
          
          {/* 打字机闪烁光标效果 (如果是 AI 正在生成的非完结气泡) */}
          {!message.is_finalized && !isMe && (
            <span className="inline-block w-1.5 h-3.5 bg-slate-400 ml-1 animate-pulse align-middle" />
          )}
        </div>
        
        {/* 分数和打分理由展示（如果有） */}
        {message.meta_data?.scores && !isMe && (
           <div className="flex gap-2 flex-wrap mt-1 px-1">
              {Object.entries(message.meta_data.scores).map(([r, s], i) => (
                <div key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-500 shadow-sm flex items-center gap-1">
                  <span className="font-semibold text-slate-700">{r}</span>
                  <span className={cn("font-bold", s.score >= 80 ? "text-emerald-600" : s.score < 60 ? "text-rose-600" : "text-amber-600")}>
                    {s.score}分
                  </span>
                </div>
              ))}
           </div>
        )}
      </div>

    </motion.div>
  );
}
