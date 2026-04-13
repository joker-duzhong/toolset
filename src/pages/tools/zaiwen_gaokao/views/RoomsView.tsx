import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { roomsApi } from '../services/api';
import type { Room } from '../types';
import { cn } from '@/utils/cn';

export function RoomsView() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await roomsApi.getList();
      if (res.code === 200 && res.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (roomId: string) => {
    try {
      const res = await roomsApi.join(roomId);
      if (res.code === 200) {
        // Handle joining logic (e.g., transition to chat room)
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20 overflow-x-hidden bg-white">
      <div className="px-6 py-10 bg-gradient-to-tr from-white to-gray-50 border-b border-gray-100">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
           48小时 <br/>限时战友屋
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-3">寻找那些能陪你熬过黎明前黑夜的人</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {rooms.map((room, idx) => {
                const isFull = room.member_count >= room.max_members;
                return (
                  <motion.div
                    key={room.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "bg-white rounded-[2.5rem] p-6 border border-gray-200 transition-all active:scale-[0.98]",
                      isFull ? "opacity-60 saturate-50" : "hover:border-indigo-200 hover:shadow-md"
                    )}
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1.5">
                           <div className="text-xl font-black text-slate-900 tracking-tight">{room.title}</div>
                           <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{room.description || "无描述"}</div>
                        </div>

                        <div className={cn(
                           "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                           isFull ? "bg-gray-100 text-gray-400" : "bg-indigo-50 text-indigo-600"
                        )}>
                           <Users className="size-3" />
                           {room.member_count} / {room.max_members}
                        </div>
                     </div>

                     <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(room.member_count / room.max_members) * 100}%` }}
                          className={cn("h-full", isFull ? "bg-slate-400" : "bg-indigo-500")} 
                        />
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs uppercase italic">
                           <Clock className="size-4" />
                           剩 32:41
                        </div>

                        <motion.button
                           whileTap={{ scale: 0.95 }}
                           onClick={() => !isFull && handleJoin(room.id)}
                           disabled={isFull}
                           className={cn(
                              "flex items-center gap-2 pl-6 pr-4 py-3 rounded-2xl font-black text-sm transition-all",
                              isFull ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-indigo-600"
                           )}
                        >
                           {isFull ? "已满员" : "立即加入"}
                           <ArrowRight className="size-4" />
                        </motion.button>
                     </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
