import { useState, useRef, useEffect } from "react";
import { PenLine } from "lucide-react";
import { cn } from "@/utils/cn";

interface FridgeNoteProps {
  content: string;
  author?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

// 采用更柔和、有纸张质感的莫兰迪色系
const noteColors = [
  "bg-[#FFFDF7] border-[#F2E5D0] text-stone-700", // 米白
  "bg-[#FFF0F0] border-[#F7DADA] text-[#A65C5C]", // 浅粉
  "bg-[#F0F7FF] border-[#DCEAFC] text-[#5C7BA6]", // 浅蓝
  "bg-[#F2FAF5] border-[#DCEEE2] text-[#5CA676]", // 浅绿
];

export function FridgeNote({ content, author, onChange, readOnly }: FridgeNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorIndex = Math.abs((author || "").charCodeAt(0) || 0) % noteColors.length;
  const theme = noteColors[colorIndex];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onChange && value !== content) {
      onChange(value);
    }
  };

  return (
    <div className={cn("relative w-full min-h-[150px] p-5 pt-8 rounded-lg border shadow-[2px_4px_12px_rgba(0,0,0,0.04)] transform transition-all duration-300", "hover:-translate-y-1 hover:shadow-[4px_8px_16px_rgba(0,0,0,0.08)]", theme)}>
      {/* 精致的 SVG 立体图钉 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 针 */}
          <path
            d="M12 14v8"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 阴影 */}
          <ellipse
            cx="12"
            cy="14"
            rx="5"
            ry="2"
            fill="rgba(0,0,0,0.1)"
          />
          {/* 图钉头 */}
          <path
            d="M6 8c0-3.314 2.686-6 6-6s6 2.686 6 6v4H6V8z"
            fill="#FF7468"
          />
          <path
            d="M6 12h12v2c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2v-2z"
            fill="#E65A4F"
          />
          {/* 高光 */}
          <path
            d="M9 5c1.5-1 3.5-1 5 0"
            stroke="#FFB0A8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 内容区域 */}
      {isEditing && !readOnly ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="写下你想说的话..."
          className="w-full min-h-[104px] bg-transparent placeholder-stone-400 resize-none focus:outline-none text-[15px] leading-relaxed font-medium"
          style={{ fontFamily: '"Kaiti SC", "STKaiti", serif' }} // 偏手写的字体感
        />
      ) : (
        <div
          onClick={() => !readOnly && setIsEditing(true)}
          className={cn("min-h-[60px] text-[15px] leading-relaxed whitespace-pre-wrap font-medium", !readOnly && "cursor-pointer", !content && "text-stone-400/70")}
          style={{ fontFamily: '"Kaiti SC", "STKaiti", serif' }}
        >
          {content || (
            <div className="flex flex-col items-center justify-center gap-2 py-2 opacity-60">
              <PenLine size={20} />
              <span className="text-xs">留个言吧</span>
            </div>
          )}
        </div>
      )}

      {/* 作者栏 */}
      {author && (
        <div className="mt-4 pt-3 flex items-center justify-between text-xs opacity-70 font-bold border-t border-current/10">
          <span>{author}</span>
        </div>
      )}
    </div>
  );
}

export function FridgeBoard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full">
      {/* 便签区域 */}
      {children}
    </div>
  );
}
