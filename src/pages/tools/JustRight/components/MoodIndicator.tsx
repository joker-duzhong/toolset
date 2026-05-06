import { cn } from "@/utils/cn";
import { Smile, Frown, Flame, MoonStar, Thermometer, Heart, Droplets, Flag, type LucideIcon } from "lucide-react";

type MoodType = "happy" | "sad" | "angry" | "tired" | "sick" | "love" | "period" | "forgive";

interface MoodIndicatorProps {
  mood?: MoodType;
  note?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

// 使用高度定制的图标代替简单 emoji，色彩更符合暖色主调
const moodConfig: Record<MoodType, { icon: LucideIcon; label: string; color: string; bg: string; fill: string }> = {
  happy: { icon: Smile, label: "开心", color: "text-[#FF8A65]", bg: "bg-[#FFF3EE]", fill: "fill-[#FF8A65]/20" },
  sad: { icon: Frown, label: "难过", color: "text-[#8BA7D5]", bg: "bg-[#F4F8FF]", fill: "fill-[#8BA7D5]/20" },
  angry: { icon: Flame, label: "生气", color: "text-[#FA705A]", bg: "bg-[#FFF0ED]", fill: "fill-[#FA705A]/20" },
  tired: { icon: MoonStar, label: "好累", color: "text-[#A8A29E]", bg: "bg-[#F5F5F4]", fill: "fill-[#A8A29E]/20" },
  sick: { icon: Thermometer, label: "生病", color: "text-[#7CB342]", bg: "bg-[#F4F9F0]", fill: "fill-[#7CB342]/20" },
  love: { icon: Heart, label: "想你", color: "text-[#F44380]", bg: "bg-[#FFF2F6]", fill: "fill-[#F44380]/20" },
  period: { icon: Droplets, label: "姨妈期", color: "text-[#E53935]", bg: "bg-[#FFEBEE]", fill: "fill-[#E53935]/20" },
  forgive: { icon: Flag, label: "求原谅", color: "text-[#FA705A]", bg: "bg-[#FFF3EE]", fill: "fill-[#FA705A]/15" },
};

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
};

const iconSizes = { sm: 20, md: 28, lg: 40 };

export function getMoodLabel(mood?: MoodType) {
  return mood ? moodConfig[mood]?.label || mood : "";
}

export function isForgiveMood(mood?: MoodType) {
  return mood === "forgive";
}

export function MoodIndicator({ mood, note, size = "md", showLabel = false }: MoodIndicatorProps) {
  if (!mood) return null;

  const config = moodConfig[mood];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("rounded-full flex items-center justify-center shadow-sm relative", sizeClasses[size], config.bg)}>
        <Icon
          size={iconSizes[size]}
          className={cn(config.color, config.fill)}
          strokeWidth={2}
        />
      </div>
      {showLabel && <span className={cn("text-sm font-bold", config.color)}>{config.label}</span>}
      {note && <span className="text-[10px] text-stone-400 truncate max-w-[100px] text-center">{note}</span>}
    </div>
  );
}

interface MoodPickerProps {
  value?: MoodType;
  onChange: (mood: MoodType) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const moods = Object.entries(moodConfig) as [MoodType, typeof moodConfig.happy][];

  return (
    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
      {moods.map(([key, config]) => {
        const Icon = config.icon;
        const isSelected = value === key;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex flex-col items-center gap-2 group outline-none"
          >
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-out", isSelected ? `${config.bg} shadow-[0_0_20px_rgba(0,0,0,0.08)] scale-110 ring-4 ring-white` : "bg-stone-50 hover:bg-stone-100")}>
              <Icon
                size={28}
                className={cn("transition-colors duration-300", isSelected ? cn(config.color, config.fill) : "text-stone-300 fill-transparent")}
                strokeWidth={isSelected ? 2.5 : 2}
              />
            </div>
            <span className={cn("text-[11px] font-bold transition-colors", isSelected ? config.color : "text-stone-400")}>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
