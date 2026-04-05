import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { TodoItemCard, TodoInput } from "../components/TodoItem";
import { MemoCard, MemoCreateModal, MemoGrid } from "../components/MemoCard";
import type { TodoItem, Memo, ListSubTab } from "../types";

// ================= 类型定义 =================
interface ListViewProps {
  todos: TodoItem[];
  memos: Memo[];
  onAddTodo: (content: string) => void;
  onToggleTodo: (id: number, status: "pending" | "completed") => void;
  onDeleteTodo: (id: number) => void;
  onAddMemo: (content: string, images: string[]) => void;
  onDeleteMemo: (id: number) => void;
}

interface TodoSectionProps {
  pendingTodos: TodoItem[];
  completedTodos: TodoItem[];
  onAdd: (content: string) => void;
  onToggle: (id: number, status: "pending" | "completed") => void;
  onDelete: (id: number) => void;
}

interface MemoSectionProps {
  memos: Memo[];
  onAdd: () => void;
  onDelete: (id: number) => void;
}

// ================= 主视图组件 =================
export function ListView({ todos, memos, onAddTodo, onToggleTodo, onDeleteTodo, onAddMemo, onDeleteMemo }: ListViewProps) {
  const [activeTab, setActiveTab] = useState<ListSubTab>("todo");
  const [showMemoModal, setShowMemoModal] = useState(false);

  const pendingTodos = todos.filter((t) => t.status === "pending");
  const completedTodos = todos.filter((t) => t.status === "completed");

  return (
    // 整体背景色采用奶油色背景
    <div className="min-h-full pb-10 bg-[#FAF9F6]">
      {/* 顶部 Tab - 更加圆润且有悬浮感 */}
      <div className="sticky top-0 z-10 pt-4 pb-6 px-6 bg-[#FAF9F6]/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex p-1.5 bg-[#F1EDE4] rounded-[2rem] shadow-sm">
          <button
            onClick={() => setActiveTab("todo")}
            className={cn("relative flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] text-sm font-medium transition-all duration-500", activeTab === "todo" ? "bg-white text-[#5D574E] shadow-sm" : "text-[#A8A297] hover:text-[#8C867A]")}
          >
            <span className="text-lg">✨</span>
            清单
            {pendingTodos.length > 0 && <span className="ml-1 px-2 py-0.5 text-[10px] bg-[#EBD9C1] text-[#8C7355] rounded-full font-bold">{pendingTodos.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab("memo")}
            className={cn("relative flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.75rem] text-sm font-medium transition-all duration-500", activeTab === "memo" ? "bg-white text-[#5D574E] shadow-sm" : "text-[#A8A297] hover:text-[#8C867A]")}
          >
            <span className="text-lg">☁️</span>
            备忘
          </button>
        </div>
      </div>

      {/* 主体内容区（带切换动画） */}
      <div className="px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "todo" ? (
            <motion.div
              key="todo-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TodoSection
                pendingTodos={pendingTodos}
                completedTodos={completedTodos}
                onAdd={onAddTodo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
              />
            </motion.div>
          ) : (
            <motion.div
              key="memo-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <MemoSection
                memos={memos}
                onAdd={() => setShowMemoModal(true)}
                onDelete={onDeleteMemo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 备忘录创建弹窗 */}
      <MemoCreateModal
        open={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        onSubmit={onAddMemo}
      />
    </div>
  );
}

// ================= 清单部分组件 =================
function TodoSection({ pendingTodos, completedTodos, onAdd, onToggle, onDelete }: TodoSectionProps) {
  return (
    <div className="space-y-8">
      {/* 输入框卡片化 */}
      <div className="bg-white/60 rounded-[2rem] border-[#F1EDE4] focus-within:shadow-md transition-shadow">
        <TodoInput onAdd={onAdd} />
      </div>

      {/* 待办列表 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <span className="w-1.5 h-4 bg-[#EBD9C1] rounded-full" />
          <h3 className="text-sm font-bold text-[#7C7467] tracking-wider">我们要一起做</h3>
        </div>

        <div className="grid gap-3">
          {pendingTodos.length > 0 ? (
            pendingTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-[1.5rem] border-[#F1EDE4]/50 hover:border-[#EBD9C1] transition-colors"
              >
                <TodoItemCard
                  item={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-[#F1EDE4]/30 rounded-[2rem] border border-dashed border-[#DCD7CC]">
              <p className="text-[#A8A297] text-sm italic">所有的任务都完成啦，休息一下吧 ☕️</p>
            </div>
          )}
        </div>
      </section>

      {/* 已完成列表 */}
      {completedTodos.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-xs font-bold text-[#A8A297] px-4 uppercase tracking-widest">已达成</h3>
          <div className="grid gap-3 opacity-60">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-[#F1EDE4]/40 rounded-[1.5rem] p-1 border border-transparent"
              >
                <TodoItemCard
                  item={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ================= 备忘录部分组件 =================
function MemoSection({ memos, onAdd, onDelete }: MemoSectionProps) {
  return (
    <div className="space-y-6">
      {/* 灵感触发按钮 */}
      <button
        onClick={onAdd}
        className="w-full group relative overflow-hidden p-6 bg-white rounded-[2rem] border border-[#F1EDE4] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FBF1F1] rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🎨</div>
            <div className="text-left">
              <p className="text-[#5D574E] font-bold text-base">记录此刻灵感</p>
              <p className="text-[#A8A297] text-xs">岁月温柔，值得被收藏</p>
            </div>
          </div>
          <span className="text-[#EBD9C1] text-2xl">+</span>
        </div>
      </button>

      {/* 备忘录瀑布流/网格 */}
      {memos.length > 0 ? (
        <MemoGrid>
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="hover:translate-y-[-4px] transition-transform duration-300"
            >
              <MemoCard
                memo={memo}
                onDelete={onDelete}
              />
            </div>
          ))}
        </MemoGrid>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-[#F1EDE4] rounded-full mx-auto flex items-center justify-center text-4xl mb-4">🍂</div>
          <p className="text-[#A8A297] font-medium text-sm">还没有记录过心情呢...</p>
        </div>
      )}
    </div>
  );
}
