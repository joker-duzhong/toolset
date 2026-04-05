// 转盘组件
import { useState, useMemo } from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { RouletteOption } from "../types";

const categoryConfig = {
  food: { label: "吃什么", emoji: "🍽️", color: "from-amber-400 to-orange-500" },
  place: { label: "去哪里", emoji: "📍", color: "from-sky-400 to-blue-500" },
  other: { label: "玩什么", emoji: "🎮", color: "from-violet-400 to-purple-500" },
};

const wheelColors = ["#fcd34d", "#f97316", "#fb923c", "#fbbf24", "#f59e0b", "#ea580c", "#facc15", "#eab308"];

interface RouletteWheelProps {
  options: RouletteOption[];
  category: "food" | "place" | "other";
  onSpinEnd?: (option: RouletteOption) => void;
}

export function RouletteWheel({ options, category, onSpinEnd }: RouletteWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<RouletteOption | null>(null);

  const config = categoryConfig[category];
  const validOptions = useMemo(() => options.filter((o) => o.category === category), [options, category]);

  // 生成转盘渐变背景
  const wheelBackground = useMemo(() => {
    if (validOptions.length === 0) return "rgb(245 245 244)";
    const segmentAngle = 360 / validOptions.length;
    const stops = validOptions
      .map((opt, i) => {
        const color = opt.color || wheelColors[i % wheelColors.length];
        return `${color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`;
      })
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [validOptions]);

  const spin = () => {
    if (spinning || validOptions.length < 2) return;

    setSpinning(true);
    setResult(null);

    const randomIndex = Math.floor(Math.random() * validOptions.length);
    const selectedOption = validOptions[randomIndex];

    // 逻辑修正：
    // 1. 每个扇区的角度宽度
    const segmentAngle = 360 / validOptions.length;
    // 2. 目标选项的中点角度（相对于0度顺时针）
    const targetMidAngle = randomIndex * segmentAngle + segmentAngle / 2;
    // 3. 旋转逻辑：为了让目标中点对准正上方（0度/360度）
    // 需要将转盘顺时针旋转 (360 - targetMidAngle)
    const extraRotations = 8 * 360; // 多转几圈保证视觉效果
    const finalRotation = rotation + extraRotations + (360 - (rotation % 360)) + (360 - targetMidAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(selectedOption);
      onSpinEnd?.(selectedOption);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* 指针 - 固定在正上方 */}
      <div className="relative z-1 -mb-2">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-stone-800 drop-shadow-md" />
      </div>

      {/* 转盘容器 */}
      <div className="relative w-72 h-72">
        <div
          className="w-full h-full rounded-full shadow-2xl border-4 border-white overflow-hidden relative transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.15, 0, 0.15, 1)" : "none",
            background: wheelBackground,
          }}
        >
          {validOptions.length > 0 &&
            validOptions.map((option, index) => {
              const segmentAngle = 360 / validOptions.length;
              const rotateAngle = index * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={option.id}
                  className="absolute top-0 left-1/2 -ml-[1px] w-[2px] h-1/2 origin-bottom flex justify-center"
                  style={{ transform: `rotate(${rotateAngle}deg)` }}
                >
                  {/* 选项文字 */}
                  <span
                    className="mt-6 text-sm font-bold text-stone-800 whitespace-nowrap"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {option.title}
                  </span>
                  {/* 扇区分隔线 */}
                  <div
                    className="absolute top-0 h-full w-[1px] bg-black/10 origin-bottom"
                    style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                  />
                </div>
              );
            })}

          {validOptions.length === 0 && <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">添加选项开始</div>}
        </div>

        {/* 中心按钮 */}
        <button
          onClick={spin}
          disabled={spinning || validOptions.length < 2}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full shadow-xl z-30 flex items-center justify-center transition-all border-4 border-white",
            spinning ? "bg-stone-200 text-stone-400" : `bg-gradient-to-br ${config.color} text-white hover:scale-105 active:scale-95`,
          )}
        >
          <Play
            size={24}
            fill="currentColor"
            className={spinning ? "" : "ml-1"}
          />
        </button>
      </div>

      {/* 结果展示 */}
      <div className="h-24 mt-6">
        {result && (
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 text-center animate-bounce-in min-w-[160px]">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">SELECTED</p>
            <p className="text-xl font-bold text-stone-800">{result.title}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

// 转盘选项管理
interface RouletteOptionsProps {
  options: RouletteOption[];
  category: "food" | "place" | "other";
  onAdd: (title: string) => void;
  onDelete: (id: number) => void;
}

export function RouletteOptions({ options, category, onAdd, onDelete }: RouletteOptionsProps) {
  const [newOption, setNewOption] = useState("");
  const filteredOptions = options.filter((o) => o.category === category);
  const config = categoryConfig[category];

  const handleAdd = () => {
    if (newOption.trim()) {
      onAdd(newOption.trim());
      setNewOption("");
    }
  };

  return (
    <div className="mt-8">
      <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
        <span className="text-xl">{config.emoji}</span>
        {config.label}清单 ({filteredOptions.length})
      </h4>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="输入新选项..."
          className="flex-1 px-4 py-3 bg-stone-100 rounded-xl border-none focus:ring-2 focus:ring-amber-200 outline-none text-sm transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!newOption.trim()}
          className={cn("px-5 py-3 rounded-xl text-white transition-all shadow-sm active:scale-95 disabled:opacity-30", `bg-gradient-to-r ${config.color}`)}
        >
          <Plus
            size={20}
            strokeWidth={3}
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredOptions.map((option: any) => (
          <div
            key={option.id}
            className="flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-white rounded-lg border border-stone-200 text-sm text-stone-600 transition-colors group"
          >
            {option.title}
            <button
              onClick={() => onDelete(option.id)}
              className="text-stone-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 类别选择器
interface CategorySelectorProps {
  value: "food" | "place" | "other";
  onChange: (category: "food" | "place" | "other") => void;
}
export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="flex gap-1.5 p-1.5 bg-stone-100 rounded-2xl mb-4">
      {(Object.entries(categoryConfig) as [keyof typeof categoryConfig, typeof categoryConfig.food][]).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            // 默认 flex-col (上下排列)，在 sm (大于640px) 屏幕上 flex-row (左右排列)
            "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl transition-all",
            value === key ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
          )}
        >
          {/* Emoji */}
          <span className="text-base sm:text-sm leading-none">
            {config.emoji}
          </span>
          {/* 文本：加上 whitespace-nowrap 保证绝对不换行，并适当减小手机端字号 */}
          <span className="whitespace-nowrap text-xs sm:text-sm font-medium">
            {config.label}
          </span>
        </button>
      ))}
    </div>
  );
}
