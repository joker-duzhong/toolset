// JustRight 主入口
// 恰好 - 温馨恋爱小工具
import { useState, useCallback, useEffect } from "react";
import { BottomNav } from "./components/BottomNav";
import { HomeView } from "./views/HomeView";
import { ListsView } from "./views/ListsView";
import { UsView } from "./views/UsView";
import { MomentsView } from "./views/MomentsView";
import { AnniversaryManageView } from "./views/AnniversaryManageView";
import { motion } from "framer-motion";
import type {
  MainTab,
  LegacyTab,
  TodoItem,
  // Memo,  // TODO: 备忘录功能暂时不用
  UserManual,
  // RouletteOption,  // TODO: 转盘功能暂时不用
  WishlistItem,
  WishlistFulfillPayload,
  WishlistItemPayload,
  WishlistItemUpdatePayload,
  HomeData,
  UserState,
} from "./types";
import {
  homeApi,
  todoApi,
  // memoApi,  // TODO: 备忘录功能暂时不用
  manualApi,
  // rouletteApi,  // TODO: 转盘功能暂时不用
  wishlistApi,
  coupleStateApi,
  coupleApi,
} from "./services/api";
import { CoupleBindView } from "./views/CoupleBindView";

// ============ Tab 兼容性处理 ============
const normalizeTab = (tab: string | null): MainTab => {
  if (!tab) return "home";

  const legacyMap: Record<LegacyTab, MainTab> = {
    list: "lists",
    manual: "us",
    wish: "lists",
  };

  return (legacyMap[tab as LegacyTab] || tab) as MainTab;
};

// ============ 空数据默认值 ============
const emptyHomeData: HomeData = {
  couple: {
    id: "",
    user1_id: "",
    user2_id: null,
    invite_code: "",
    status: "pending",
    created_at: "",
    updated_at: "",
  },
  together_days: 0,
  upcoming_anniversaries: [],
  state: {
    couple_id: "",
    fridge_note: "",
    user1: { uid: "", updated_at: "" },
    user2: { uid: "", updated_at: "" },
    updated_at: "",
  },
  manuals: {
    mine: { uid: "", created_at: "", updated_at: "" },
    ta: { uid: "", created_at: "", updated_at: "" },
  },
  stats: {
    completed_todos: 0,
    total_memos: 0,
    fulfilled_wishes: 0,
    mood_logs_count: 0,
  },
  pending_todos: 0,
  upcoming_wishes: 0,
};

function normalizeUserState(state: UserState | null | undefined): UserState {
  return {
    uid: state?.uid || "",
    mood: state?.mood,
    note: state?.note ?? state?.mood_note ?? null,
    mood_note: state?.mood_note ?? state?.note ?? null,
    updated_at: state?.updated_at || "",
  };
}

function normalizeHomeData(data: HomeData | null | undefined): HomeData {
  if (!data) return emptyHomeData;

  return {
    ...emptyHomeData,
    ...data,
    state: {
      ...emptyHomeData.state,
      ...data.state,
      user1: normalizeUserState(data.state?.user1),
      user2: normalizeUserState(data.state?.user2),
    },
    manuals: {
      mine: data.manuals?.mine || emptyHomeData.manuals.mine,
      ta: data.manuals?.ta || emptyHomeData.manuals.ta,
    },
    stats: data.stats || emptyHomeData.stats,
    pending_todos: data.pending_todos ?? emptyHomeData.pending_todos,
    upcoming_wishes: data.upcoming_wishes ?? emptyHomeData.upcoming_wishes,
  };
}

// ============ 主组件 ============
export function JustRightPage() {
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    // 从 URL 参数或 localStorage 读取，支持旧 Tab 值
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    const storedTab = localStorage.getItem("justright_active_tab");
    return normalizeTab(urlTab || storedTab);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBound, setIsBound] = useState<boolean | null>(null); // null 表示未检查
  const [showAnniversaryManage, setShowAnniversaryManage] = useState(false); // 纪念日管理页面
  const [hideBottomNav, setHideBottomNav] = useState(false);

  // 保存 activeTab 到 localStorage
  useEffect(() => {
    localStorage.setItem("justright_active_tab", activeTab);
  }, [activeTab]);

  // 状态数据
  const [homeData, setHomeData] = useState<HomeData>(emptyHomeData);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  // const [memos, setMemos] = useState<Memo[]>([])  // TODO: 备忘录功能暂时不用
  // const [rouletteOptions, setRouletteOptions] = useState<RouletteOption[]>([])  // TODO: 转盘功能暂时不用
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // 当前用户 ID (用于判断身份)
  const currentUserId = homeData.manuals.mine.uid;

  // 判断当前用户是 user1 还是 user2
  const isUser1 = homeData.couple.user1_id === currentUserId;
  const myState = (isUser1 ? homeData.state.user1 : homeData.state.user2) || emptyHomeData.state.user1;
  const partnerState = (isUser1 ? homeData.state.user2 : homeData.state.user1) || emptyHomeData.state.user1;

  // 加载数据
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 先检查情侣绑定状态
      const coupleRes = await coupleApi.get();

      if (!String(coupleRes.code).startsWith("2") || !coupleRes.data) {
        setIsBound(false);
        setLoading(false);
        return;
      }

      const couple = coupleRes.data;

      // 判断是否已绑定（status 为 active 且有 user2_id）
      if (couple.status !== "active" || !couple.user2_id) {
        setIsBound(false);
        setLoading(false);
        return;
      }

      setIsBound(true);

      // 并行加载所有数据
      const [homeRes, todoRes, wishRes] = await Promise.all([
        homeApi.get(),
        todoApi.list(),
        // memoApi.list(),  // TODO: 备忘录功能暂时不用
        // rouletteApi.list(),  // TODO: 转盘功能暂时不用
        wishlistApi.list(),
      ]);

      setHomeData(normalizeHomeData(homeRes.data));
      setTodos(todoRes.data || []);
      // setMemos(memoRes.data?.items || [])
      // setRouletteOptions(rouletteRes.data || [])
      setWishlist(wishRes.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("加载数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // TODO 操作
  const handleAddTodo = useCallback(async (content: string) => {
    try {
      const res = await todoApi.create(content);
      if (res.data) {
        setTodos((prev) => [res.data!, ...prev]);
        setHomeData((prev) => ({ ...prev, pending_todos: (prev.pending_todos ?? 0) + 1 }));
      }
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  }, []);

  const handleToggleTodo = useCallback(async (id: string, status: "pending" | "completed") => {
    try {
      const res = await todoApi.updateStatus(id, status);
      if (res.data) {
        setTodos((prev) => prev.map((t) => (t.id === id ? res.data! : t)));
        setHomeData((prev) => ({
          ...prev,
          pending_todos: status === "completed" ? Math.max(0, (prev.pending_todos || 0) - 1) : (prev.pending_todos || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  }, []);

  const handleDeleteTodo = useCallback(async (id: string) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  }, []);

  // TODO: 备忘录功能暂时不用
  /*
  // 备忘录操作
  const handleAddMemo = useCallback(async (content: string, imageIds: string[]) => {
    try {
      const res = await memoApi.create(content, imageIds)
      if (res.data) {
        setMemos((prev) => [res.data!, ...prev])
      }
    } catch (err) {
      console.error('Failed to add memo:', err)
    }
  }, [])

  const handleDeleteMemo = useCallback(async (id: number) => {
    try {
      await memoApi.delete(id)
      setMemos((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error('Failed to delete memo:', err)
    }
  }, [])
  */

  // 说明书操作
  const handleUpdateManual = useCallback(async (data: Partial<UserManual>) => {
    try {
      const res = await manualApi.update(data);
      if (res.data) {
        setHomeData((prev) => ({
          ...prev,
          manuals: { ...prev.manuals, mine: res.data! },
        }));
      }
    } catch (err) {
      console.error("Failed to update manual:", err);
    }
  }, []);

  // TODO: 转盘功能暂时不用
  /*
  // 转盘操作
  const handleAddRouletteOption = useCallback(
    async (title: string, category: 'food' | 'place' | 'other') => {
      try {
        const res = await rouletteApi.add(title, category)
        if (res.data) {
          setRouletteOptions((prev) => [...prev, res.data!])
        }
      } catch (err) {
        console.error('Failed to add roulette option:', err)
      }
    },
    []
  )

  const handleDeleteRouletteOption = useCallback(async (id: number) => {
    try {
      await rouletteApi.delete(id)
      setRouletteOptions((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      console.error('Failed to delete roulette option:', err)
    }
  }, [])
  */

  // 心愿单操作
  const handleAddWish = useCallback(async (item: WishlistItemPayload) => {
    try {
      const res = await wishlistApi.add(item);
      if (res.data) {
        setWishlist((prev) => [res.data!, ...prev]);
        setHomeData((prev) => ({ ...prev, upcoming_wishes: (prev.upcoming_wishes || 0) + 1 }));
      }
    } catch (err) {
      console.error("Failed to add wish:", err);
    }
  }, []);

  const handleUpdateWish = useCallback(async (id: string, item: WishlistItemUpdatePayload) => {
    try {
      const res = await wishlistApi.update(id, item);
      if (res.data) {
        setWishlist((prev) => prev.map((w) => (w.id === id ? res.data! : w)));
      }
    } catch (err) {
      console.error("Failed to update wish:", err);
    }
  }, []);

  const handleClaimWish = useCallback(async (id: string) => {
    try {
      const res = await wishlistApi.claim(id);
      if (res.data) {
        setWishlist((prev) => prev.map((w) => (w.id === id ? res.data! : w)));
      }
    } catch (err) {
      console.error("Failed to claim wish:", err);
    }
  }, []);

  const handleUnclaimWish = useCallback(async (id: string) => {
    try {
      const res = await wishlistApi.unclaim(id);
      if (res.data) {
        setWishlist((prev) => prev.map((w) => (w.id === id ? res.data! : w)));
      }
    } catch (err) {
      console.error("Failed to unclaim wish:", err);
    }
  }, []);

  const handleFulfillWish = useCallback(async (id: string, payload?: WishlistFulfillPayload) => {
    try {
      const note = payload?.note?.trim();
      const resourceIds = payload?.resource_ids?.filter(Boolean);
      const hasRecord = Boolean(note || resourceIds?.length);
      const res = hasRecord
        ? await wishlistApi.fulfillWithRecord(id, {
            note: note || null,
            resource_ids: resourceIds?.length ? resourceIds : null,
          })
        : await wishlistApi.fulfill(id);

      if (res.data) {
        setWishlist((prev) => prev.map((w) => (w.id === id ? res.data! : w)));
        setHomeData((prev) => ({ ...prev, upcoming_wishes: Math.max(0, (prev.upcoming_wishes || 0) - 1) }));
      }
    } catch (err) {
      console.error("Failed to fulfill wish:", err);
    }
  }, []);

  const handleDeleteWish = useCallback(async (id: string) => {
    try {
      await wishlistApi.delete(id);
      setWishlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Failed to delete wish:", err);
    }
  }, []);

  // 心情更新
  const handleUpdateMood = useCallback(
    async (mood: UserState["mood"], moodNote?: string) => {
      try {
        await coupleStateApi.updateMood(mood, moodNote);
        setHomeData((prev) => {
          const stateKey = isUser1 ? "user1" : "user2";
          return {
            ...prev,
            state: {
              ...prev.state,
              [stateKey]: {
                ...prev.state[stateKey],
                mood,
                mood_note: moodNote,
                updated_at: new Date().toISOString(),
              },
            },
          };
        });
      } catch (err) {
        console.error("Failed to update mood:", err);
      }
    },
    [isUser1],
  );

  // 冰箱贴留言更新
  const handleUpdateFridgeNote = useCallback(async (note: string) => {
    try {
      await coupleStateApi.updateFridgeNote(note);
      setHomeData((prev) => ({
        ...prev,
        state: { ...prev.state, fridge_note: note },
      }));
    } catch (err) {
      console.error("Failed to update fridge note:", err);
    }
  }, []);

  // 绑定成功后重新加载数据
  const handleBindSuccess = useCallback(() => {
    setIsBound(null); // 重置为未检查状态
    loadInitialData();
  }, []);

  // 加载状态
  if (loading) {
    return (
      <div className="h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
        {/* 背景柔和光晕装饰 (营造温暖氛围) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#FFF0E5] rounded-full blur-[80px] opacity-70 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* 大图标：爱心轨道环绕加载动画 (纯手绘SVG) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 drop-shadow-sm"
          >
            <svg
              width="140"
              height="140"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 外圈虚线轨道 */}
              <motion.circle
                cx="60"
                cy="60"
                r="45"
                stroke="#FFB6C1"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                fill="none"
                opacity="0.6"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                style={{ originX: "60px", originY: "60px" }}
              />

              {/* 中心跳动的主爱心 */}
              <motion.g
                animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ originX: "60px", originY: "60px" }}
              >
                <path
                  d="M60 82C60 82 28 55 28 35C28 23 37 15 48 15C55 15 60 20 60 20C60 20 65 15 72 15C83 15 92 23 92 35C92 55 60 82 60 82Z"
                  fill="url(#heartGradient)"
                />
              </motion.g>

              {/* 绕轨道飞行的小爱心 */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                style={{ originX: "60px", originY: "60px" }}
              >
                {/* 放置在顶部轨道上 */}
                <g transform="translate(60, 15)">
                  <path
                    d="M0 8C0 8 -8 2 -8 -3.5C-8 -6 -6 -8 -3.5 -8C-1.5 -8 0 -6.5 0 -6.5C0 -6.5 1.5 -8 3.5 -8C6 -8 8 -6 8 -3.5C8 2 0 8 0 8Z"
                    fill="#FF7A59"
                  />
                </g>
              </motion.g>

              {/* 逆向绕轨道飞行的小星星 */}
              <motion.g
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{ originX: "60px", originY: "60px" }}
              >
                {/* 放置在左侧轨道上 */}
                <g transform="translate(15, 60)">
                  <path
                    d="M0 -5L1.5 -1.5L5 0L1.5 1.5L0 5L-1.5 1.5L-5 0L-1.5 -1.5L0 -5Z"
                    fill="#FFD166"
                  />
                </g>
              </motion.g>

              {/* 定义中心爱心的柔和渐变色 */}
              <defs>
                <linearGradient
                  id="heartGradient"
                  x1="28"
                  y1="15"
                  x2="92"
                  y2="82"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FF9A8B" />
                  <stop
                    offset="1"
                    stopColor="#FF7A59"
                  />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* 动态加载提示文案 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-[16px] font-bold text-[#333] mb-2 tracking-wide flex items-center justify-center">
              正在翻阅你们的记录
              {/* 动态省略号 */}
              <span className="w-4 text-left inline-block">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
                >
                  ...
                </motion.span>
              </span>
            </h3>
            <p className="text-[#999] text-[13px] tracking-widest">让爱意有迹可循</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
        {/* 背景柔和光晕装饰 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FFE8E3] rounded-full blur-[80px] opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* 大图标：贴着创可贴的爱心 (纯手绘SVG) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="mb-4 drop-shadow-sm"
          >
            <motion.svg
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              width="140"
              height="140"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 心形底框 */}
              <path
                d="M60 105C60 105 15 73.5 15 41.25C15 24.55 28.55 11 45.25 11C55.09 11 60 18 60 18C60 18 64.91 11 74.75 11C91.45 11 105 24.55 105 41.25C105 73.5 60 105 60 105Z"
                fill="#FFF6F4"
                stroke="#FF7A59"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 断裂线 */}
              <path
                d="M60 18L52 42L68 62L58 88"
                stroke="#FF7A59"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 创可贴 */}
              <g transform="rotate(-15 65 50)">
                <rect
                  x="42"
                  y="42"
                  width="46"
                  height="20"
                  rx="10"
                  fill="#FFB6C1"
                  stroke="#FF7A59"
                  strokeWidth="4"
                />
                <rect
                  x="57"
                  y="42"
                  width="16"
                  height="20"
                  fill="#FF7A59"
                  opacity="0.15"
                />
                <circle
                  cx="61"
                  cy="48"
                  r="1.5"
                  fill="#FF7A59"
                />
                <circle
                  cx="69"
                  cy="48"
                  r="1.5"
                  fill="#FF7A59"
                />
                <circle
                  cx="61"
                  cy="56"
                  r="1.5"
                  fill="#FF7A59"
                />
                <circle
                  cx="69"
                  cy="56"
                  r="1.5"
                  fill="#FF7A59"
                />
              </g>

              {/* 闪烁的装饰小星星 */}
              <motion.path
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                d="M100 20L102 26L108 28L102 30L100 36L98 30L92 28L98 26L100 20Z"
                fill="#FFD166"
              />
              <motion.path
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                d="M20 80L21.5 84.5L26 86L21.5 87.5L20 92L18.5 87.5L14 86L18.5 84.5L20 80Z"
                fill="#FFD166"
              />
            </motion.svg>
          </motion.div>

          {/* 错误提示文案与按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-[17px] font-bold text-[#333] mb-2 tracking-wide">哎呀，信号走丢了</h3>
            <p className="text-[#999] text-[13px] mb-8 max-w-[240px] leading-relaxed mx-auto">{error || "获取数据失败，请检查网络后重试哦"}</p>

            {/* 重试按钮 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={loadInitialData}
              className="px-10 py-3.5 bg-gradient-to-r from-[#FF8A65] to-[#FF7A59] text-white font-bold rounded-[1.25rem] shadow-[0_8px_20px_rgba(255,122,89,0.25)] hover:shadow-[0_4px_10px_rgba(255,122,89,0.3)] transition-all active:translate-y-1"
            >
              重新连接
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 未绑定状态 - 显示绑定界面
  if (isBound === false) {
    return (
      <div className="h-full">
        <CoupleBindView onBindSuccess={handleBindSuccess} />
      </div>
    );
  }

  // 显示纪念日管理页面
  if (showAnniversaryManage) {
    return (
      <AnniversaryManageView
        onBack={() => {
          setShowAnniversaryManage(false);
          loadInitialData(); // 重新加载数据以更新首页的纪念日倒计时
        }}
      />
    );
  }

  // 渲染当前视图
  const renderView = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            data={homeData}
            myState={myState}
            partnerState={partnerState}
            myManual={homeData.manuals.mine}
            partnerManual={homeData.manuals.ta}
            onUpdateMood={handleUpdateMood}
            onUpdateFridgeNote={handleUpdateFridgeNote}
            onUpdateManual={handleUpdateManual}
            onManageAnniversaries={() => setShowAnniversaryManage(true)}
          />
        );
      case "moments":
        return (
          <MomentsView
            currentUserId={String(currentUserId || "")}
            onDetailModeChange={setHideBottomNav}
          />
        );
      case "lists":
        return (
          <ListsView
            todos={todos}
            wishlist={wishlist}
            currentUserId={currentUserId}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onAddWish={handleAddWish}
            onUpdateWish={handleUpdateWish}
            onClaimWish={handleClaimWish}
            onUnclaimWish={handleUnclaimWish}
            onFulfillWish={handleFulfillWish}
            onDeleteWish={handleDeleteWish}
          />
        );
      case "us":
        return (
          <UsView
            homeData={homeData}
            myManual={homeData.manuals.mine}
            partnerManual={homeData.manuals.ta}
            onUpdateManual={handleUpdateManual}
            onManageAnniversaries={() => setShowAnniversaryManage(true)}
          />
        );
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-amber-50/50 to-rose-50/30 flex flex-col">
      {/* 主内容区域 */}
      <main className="pb-20">{renderView()}</main>

      {/* 底部导航 */}
      {!hideBottomNav && (
        <BottomNav
          active={activeTab}
          onChange={setActiveTab}
        />
      )}
    </div>
  );
}

export default JustRightPage;
