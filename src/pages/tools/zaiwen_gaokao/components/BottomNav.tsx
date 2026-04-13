import { MessageCircle, ShieldCheck, DoorClosed, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GkTabKey, LucideIcon } from '../types';

interface Tab {
  key: GkTabKey;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { key: 'treehole', label: '树洞', icon: MessageCircle },
  { key: 'board', label: '红黑榜', icon: ShieldCheck },
  { key: 'rooms', label: '战友屋', icon: DoorClosed },
  { key: 'user', label: '我的', icon: User },
];

interface BottomNavProps {
  active: GkTabKey;
  onChange: (key: GkTabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 flex items-center justify-around px-2 py-2 safe-area-bottom"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative flex flex-col items-center gap-1 px-4 py-1.5 transition-colors duration-300 ${
              isActive ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className={`size-6 ${isActive ? 'fill-indigo-50/50' : ''}`} />
            </motion.div>
            <span className="text-[10px] font-bold tracking-wider">{label}</span>
            
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
