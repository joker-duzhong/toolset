import { Wrench } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ToolCard } from "@/components/ToolCard";
import { useToolSearch } from "@/hooks/useToolSearch";

export function HomePage() {
  const { query, setQuery, activeCategory, setActiveCategory, filteredTools } = useToolSearch();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg-secondary)" }}
    >
      {/* 顶部 Hero */}
      <div
        className="px-4 pt-12 pb-6 text-white"
        style={{
          background: "linear-gradient(135deg, #0d99ff 0%, #0b87e0 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="size-5 opacity-80" />
          <span className="text-sm opacity-80 font-medium">实用工具箱</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">工具箱</h1>
        <p className="text-sm opacity-70">精选实用小工具，随手即用</p>

        {/* 搜索框 */}
        <div className="mt-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="搜索工具名称、功能…"
            className="[&_input]:bg-white/20 [&_input]:text-white [&_input]:placeholder:text-white/60 [&_input]:focus:ring-white/40 [&_input]:focus:bg-white/30"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div
        className="px-4 py-3 sticky top-0 z-10 border-b"
        style={{
          backgroundColor: "var(--color-bg-base)",
          borderColor: "var(--color-border-light)",
        }}
      >
        <CategoryFilter
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* 工具列表 */}
      <main className="flex-1 px-4 py-4">
        {filteredTools.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-sm">没有找到相关工具</p>
            <button
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
              }}
              className="mt-3 text-xs underline"
              style={{ color: "var(--color-primary)" }}
            >
              清空筛选
            </button>
          </div>
        ) : (
          <>
            <p
              className="text-xs mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              共 {filteredTools.length} 个工具
              {query && <span>，搜索「{query}」</span>}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <div className="text-center">v1.0.0</div>
      {/* 底部留白（避免被手势条遮挡） */}
      <div className="h-6" />
    </div>
  );
}
