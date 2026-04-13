import React, { useEffect, useState } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { 
  Dices, 
  ShieldAlert, 
  Trash2, 
  Clock, 
  Heart, 
  Send,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import * as api from '../services/api';
import type { ProfileMeData } from '../types';

// Digital counter animation
function CountUp({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue}</span>;
}

// Bento Box Card Wrapper
function BentoCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "bg-white/60 backdrop-blur-xl border border-gray-100 rounded-3xl p-5 shadow-sm overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function ProfileView() {
  const [data, setData] = useState<ProfileMeData | null>(null);
  const [treeholes, setTreeholes] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'votes'>('posts');
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(5);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfileMe();
      if (res.code === 200 && res.data) {
        setData(res.data);
      }
      const [thRes, auRes] = await Promise.all([
        api.getMyTreeholes(),
        api.getMyAudits()
      ]);
      if (thRes.code === 200) setTreeholes(thRes.data || []);
      if (auRes.code === 200) setAudits(auRes.data || []);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    let timer: any;
    if (showWipeModal && wipeConfirm > 0) {
      timer = setInterval(() => setWipeConfirm(v => v - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showWipeModal, wipeConfirm]);

  const handleRandomize = async () => {
    if (isRandomizing) return;
    setIsRandomizing(true);
    try {
      const res = await api.randomizeProfile();
      if (res.code === 200 && res.data && data) {
        setData({ ...data, persona: res.data });
      }
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleWipe = async () => {
    if (wipeConfirm > 0) return;
    try {
      const res = await api.wipeProfile();
      if (res.code === 200) {
        setShowWipeModal(false);
        setWipeConfirm(5);
        fetchProfile();
      }
    } catch (err) {
      console.error('Wipe failed', err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('确定要从宇宙中抹除这条痕迹吗？')) return;
    try {
      const res = await api.treeholeApi.deletePost(id);
      if (res.code === 200) {
        setTreeholes(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
       <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-full pb-32 bg-gray-50/20">
      <div className="p-6">
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[420px]">
          {/* Avatar & Info Card */}
          <BentoCard className="col-span-2 row-span-2 flex flex-col items-center justify-center relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <UserCircle size={120} />
            </div>
            
            <motion.div 
              key={data?.persona.id}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative"
            >
              <div className="size-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-4xl shadow-inner border-2 border-white overflow-hidden mb-4">
                <img src={data?.persona.avatar_url} alt="" className="size-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-white shadow-sm flex items-center justify-center text-lg border border-gray-100">
                {data?.persona.status_emoji}
              </div>
            </motion.div>

            <h2 className="text-xl font-black text-slate-900 mt-2">{data?.persona.nickname}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Cyber Identity</p>
            
            <button 
              onClick={handleRandomize}
              disabled={isRandomizing}
              className="mt-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Dices size={14} className={cn(isRandomizing && "animate-spin")} />
              <span>重塑马甲</span>
            </button>
          </BentoCard>

          {/* Stats Cards */}
          <BentoCard className="col-span-2 flex flex-col justify-center items-center bg-rose-50/50 border-rose-100/50" delay={0.1}>
            <div className="text-rose-500 mb-1"><Heart size={20} fill="currentColor" /></div>
            <div className="text-3xl font-black text-slate-900"><CountUp value={data?.received_hugs || 0} /></div>
            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">收到抱抱</div>
          </BentoCard>

          <BentoCard className="col-span-2 flex flex-col justify-center items-center bg-indigo-50/50 border-indigo-100/50" delay={0.2}>
            <div className="text-indigo-500 mb-1"><Send size={20} /></div>
            <div className="text-3xl font-black text-slate-900"><CountUp value={data?.sent_hugs || 0} /></div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">传递温暖</div>
          </BentoCard>
        </div>

        {/* My Archives Section */}
        <div className="mt-8 bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm overflow-hidden">
          <div className="flex gap-4 mb-6">
            {(['posts', 'votes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-2xl text-sm font-black transition-all",
                  activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-gray-400 hover:text-slate-900"
                )}
              >
                {tab === 'posts' ? '夏日树洞存档' : '红黑质询记录'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 min-h-[300px]"
            >
              {activeTab === 'posts' ? (
                treeholes.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {treeholes.map(item => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, x: -100 }}
                        className="group p-5 rounded-3xl bg-gray-50 border border-gray-100 flex items-start gap-4 transition-all hover:bg-gray-100/50 relative overflow-hidden"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 italic">“ {item.content} ”</div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase">
                            <span>{item.type}</span>
                            <span>•</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeletePost(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <Clock size={48} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold">还没有在这片土地留下痕迹</p>
                  </div>
                )
              ) : (
                audits.length > 0 ? audits.map(vote => (
                  <div key={vote.id} className="p-5 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-8 rounded-xl flex items-center justify-center text-white font-black text-xs",
                          vote.option === 'red' ? "bg-rose-500" : "bg-emerald-500"
                        )}>
                          {vote.option === 'red' ? '踩' : '顶'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">对 {vote.post?.school_name || '某学校'} 的投票</div>
                          <div className="text-[10px] text-slate-400 font-bold">{new Date(vote.created_at).toLocaleString()}</div>
                        </div>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <ShieldAlert size={48} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold">尚未参与任何红黑对抗</p>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 mb-20 px-4">
          <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert size={14} />
            危险操作区
          </h3>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWipeModal(true)}
            className="w-full h-16 rounded-3xl border-2 border-rose-100 bg-white text-rose-500 font-black text-sm flex items-center justify-center gap-3 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={18} />
            彻底抹除我在社区的所有痕迹 (斩断前缘)
          </motion.button>
        </div>
      </div>

      {/* Wipe Modal Overlay */}
      <AnimatePresence>
        {showWipeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWipeModal(false)}
              className="absolute inset-0 bg-rose-950/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-rose-100"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trash2 size={120} className="text-rose-600" />
              </div>

              <div className="size-16 rounded-3xl bg-rose-100 flex items-center justify-center text-rose-600 mb-6">
                <ShieldAlert size={32} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">确定要退出<br/>这个时空吗？</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                该操作将永久删除你发布的所有树洞、评论和投票记录。一旦完成，你将以一个全新的随机身份重生。这不可撤销。
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowWipeModal(false)}
                  className="flex-1 h-14 rounded-2xl bg-gray-50 text-slate-600 font-bold text-sm"
                >
                  先留着
                </button>
                <button 
                  onClick={handleWipe}
                  disabled={wipeConfirm > 0}
                  className="flex-1 h-14 rounded-2xl bg-rose-600 text-white font-black text-sm relative overflow-hidden disabled:bg-rose-200"
                >
                  <span className="relative z-10">
                    {wipeConfirm > 0 ? `等待 ${wipeConfirm}s` : '确认焚毁'}
                  </span>
                  {wipeConfirm > 0 && (
                    <motion.div 
                      className="absolute inset-0 bg-rose-700/20 origin-left"
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ComplianceLinks />
    </div>
  );
}

function ComplianceLinks() {
  const [activeDrawer, setActiveDrawer] = useState<'rules' | 'ai' | 'sos' | null>(null);

  const CONTENT = {
    rules: {
      title: '社区生存法则',
      icon: '🛡️',
      text: [
        { h: '绝对的匿名，绝对的边界', p: '你在这里是安全的。但请不要试图去挖掘他人的真实身份，严禁发布个人隐私信息。' },
        { h: '情绪可以宣泄，但不能变成子弹', p: '对于任何涉及人身攻击、网暴、诽谤他人的言论，我们将毫不犹豫地清除。' },
        { h: '法律底线不可触碰', p: '严禁讨论任何违法违法、作弊等相关内容。' }
      ]
    },
    ai: {
      title: 'AI 免责声明',
      icon: '⚠️',
      text: [
        { h: '主观经验 ≠ 客观事实', p: '红黑榜中所有评价均来自匿名用户主观经验，请独立判断其参考价值。' },
        { h: 'AI 总结的局限性', p: 'AI 总结是对用户留言的聚合，可能存在事实错误、幻觉。不代表官方立场。' },
        { h: '为你自己的未来负责', p: '请务必通过官方渠道核实志愿信息。平台不承担由于决策导致的后果。' }
      ]
    },
    sos: {
      title: '如果你需要帮助',
      icon: '🫂',
      text: [
        { h: '请停下来，深呼吸', p: '你不孤单，这个世界上有很多人愿意倾听你。哪怕只是哭一场。' },
        { h: '希望 24h 热线', p: '400-161-9995' },
        { h: '全国青少年心理咨询热线', p: '12355' }
      ]
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 px-8 pb-10 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">
        <div className="w-8 h-0.5 bg-gray-100 mb-2" />
        <button onClick={() => setActiveDrawer('rules')} className="hover:text-slate-600 transition-colors cursor-pointer">《社区生存法则》</button>
        <button onClick={() => setActiveDrawer('ai')} className="hover:text-slate-600 transition-colors cursor-pointer">《志愿红黑榜 AI 免责声明》</button>
        <button onClick={() => setActiveDrawer('sos')} className="hover:text-rose-400 transition-colors cursor-pointer">《🆘 紧急援助专线》</button>
      </div>

      <AnimatePresence>
        {activeDrawer && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawer(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[3rem] p-10 pb-[env(safe-area-inset-bottom,2rem)] shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <div className="size-16 rounded-[2rem] bg-gray-50 flex items-center justify-center text-3xl mb-6 mx-auto">
                {CONTENT[activeDrawer].icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 text-center mb-8">{CONTENT[activeDrawer].title}</h3>
              <div className="space-y-8">
                {CONTENT[activeDrawer].text.map((item, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                       <div className="size-1.5 rounded-full bg-slate-900" />
                       {item.h}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed pl-3.5 border-l border-gray-100">{item.p}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold mt-10"
              >
                我已知晓并理解
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

