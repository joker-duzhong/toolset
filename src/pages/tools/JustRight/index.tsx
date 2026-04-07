// JustRight 主入口
// 恰好 - 温馨恋爱小工具
import { useState, useCallback, useEffect } from 'react'
import { BottomNav } from './components/BottomNav'
import { HomeView } from './views/HomeView'
import { ListView } from './views/ListView'
import { ManualView } from './views/ManualView'
import { WishView } from './views/WishView'
import type {
  MainTab,
  TodoItem,
  Memo,
  UserManual,
  RouletteOption,
  WishlistItem,
  HomeData,
  UserState,
} from './types'
import {
  homeApi,
  todoApi,
  memoApi,
  manualApi,
  rouletteApi,
  wishlistApi,
  coupleStateApi,
  coupleApi,
} from './services/api'
import { CoupleBindView } from './views/CoupleBindView'

// ============ 空数据默认值 ============
const emptyHomeData: HomeData = {
  couple: {
    id: 0,
    user1_id: 0,
    user2_id: 0,
    invite_code: '',
    status: 'pending',
    created_at: '',
    updated_at: '',
  },
  together_days: 0,
  upcoming_anniversaries: [],
  state: {
    couple_id: 0,
    fridge_note: '',
    user1: { uid: 0, white_flag: { raised: false }, updated_at: '' },
    user2: { uid: 0, white_flag: { raised: false }, updated_at: '' },
    updated_at: '',
  },
  manuals: {
    mine: { uid: 0, created_at: '', updated_at: '' },
    ta: { uid: 0, created_at: '', updated_at: '' },
  },
  pending_todos: 0,
  upcoming_wishes: 0,
}

// ============ 主组件 ============
export function JustRightPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('home')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBound, setIsBound] = useState<boolean | null>(null) // null 表示未检查

  // 状态数据
  const [homeData, setHomeData] = useState<HomeData>(emptyHomeData)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [memos, setMemos] = useState<Memo[]>([])
  const [rouletteOptions, setRouletteOptions] = useState<RouletteOption[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // 当前用户 ID (用于判断身份)
  const currentUserId = homeData.manuals.mine.uid

  // 判断当前用户是 user1 还是 user2
  const isUser1 = homeData.couple.user1_id === currentUserId
  const myState = isUser1 ? homeData.state.user1 : homeData.state.user2
  const partnerState = isUser1 ? homeData.state.user2 : homeData.state.user1

  // 加载数据
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 先检查情侣绑定状态
      const coupleRes = await coupleApi.get()

      if (!String(coupleRes.code).startsWith('2') || !coupleRes.data) {
        setIsBound(false)
        setLoading(false)
        return
      }

      const couple = coupleRes.data

      // 判断是否已绑定（status 为 active 且有 user2_id）
      if (couple.status !== 'active' || !couple.user2_id) {
        setIsBound(false)
        setLoading(false)
        return
      }

      setIsBound(true)

      // 并行加载所有数据
      const [homeRes, todoRes, memoRes, rouletteRes, wishRes] = await Promise.all([
        homeApi.get(),
        todoApi.list(),
        memoApi.list(),
        rouletteApi.list(),
        wishlistApi.list(),
      ])

      setHomeData(homeRes.data || emptyHomeData)
      setTodos(todoRes.data || [])
      setMemos(memoRes.data?.items || [])
      setRouletteOptions(rouletteRes.data || [])
      setWishlist(wishRes.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // TODO 操作
  const handleAddTodo = useCallback(async (content: string) => {
    try {
      const res = await todoApi.create(content)
      if (res.data) {
        setTodos((prev) => [res.data!, ...prev])
        setHomeData((prev) => ({ ...prev, pending_todos: prev.pending_todos + 1 }))
      }
    } catch (err) {
      console.error('Failed to add todo:', err)
    }
  }, [])

  const handleToggleTodo = useCallback(async (id: number, status: 'pending' | 'completed') => {
    try {
      const res = await todoApi.updateStatus(id, status)
      if (res.data) {
        setTodos((prev) => prev.map((t) => (t.id === id ? res.data! : t)))
        setHomeData((prev) => ({
          ...prev,
          pending_todos:
            status === 'completed' ? Math.max(0, prev.pending_todos - 1) : prev.pending_todos + 1,
        }))
      }
    } catch (err) {
      console.error('Failed to update todo:', err)
    }
  }, [])

  const handleDeleteTodo = useCallback(async (id: number) => {
    try {
      await todoApi.delete(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Failed to delete todo:', err)
    }
  }, [])

  // 备忘录操作
  const handleAddMemo = useCallback(async (content: string, images: string[]) => {
    try {
      const res = await memoApi.create(content, images)
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

  // 说明书操作
  const handleUpdateManual = useCallback(async (data: Partial<UserManual>) => {
    try {
      const res = await manualApi.update(data)
      if (res.data) {
        setHomeData((prev) => ({
          ...prev,
          manuals: { ...prev.manuals, mine: res.data! },
        }))
      }
    } catch (err) {
      console.error('Failed to update manual:', err)
    }
  }, [])

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

  // 心愿单操作
  const handleAddWish = useCallback(
    async (item: { title: string; url?: string; price?: number; image_url?: string; description?: string }) => {
      try {
        const res = await wishlistApi.add({
          ...item,
          couple_id: homeData.couple.id,
          creator_uid: currentUserId,
        })
        if (res.data) {
          console.log("Added Wish:", res.data);
          setWishlist((prev) => [res.data!, ...(prev)])
          setHomeData((prev) => ({ ...prev, upcoming_wishes: prev.upcoming_wishes + 1 }))
        }
        console.log("Current Wishlist Count:", wishlist.length);
       } catch (err) {
        console.error('Failed to add wish:', err)
      }
    },
    [homeData.couple.id, currentUserId]
  )

  const handleClaimWish = useCallback(async (id: number) => {
    try {
      const res = await wishlistApi.claim(id)
      if (res.data) {
        setWishlist((prev) => prev.map((w) => (w.id === id ? res.data! : w)))
      }
    } catch (err) {
      console.error('Failed to claim wish:', err)
    }
  }, [])

  const handleFulfillWish = useCallback(async (id: number) => {
    try {
      const res = await wishlistApi.fulfill(id)
      if (res.data) {
        setWishlist((prev) => prev.map((w) => (w.id === id ? res.data! : w)))
      }
    } catch (err) {
      console.error('Failed to fulfill wish:', err)
    }
  }, [])

  const handleDeleteWish = useCallback(async (id: number) => {
    try {
      await wishlistApi.delete(id)
      setWishlist((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Failed to delete wish:', err)
    }
  }, [])

  // 心情更新
  const handleUpdateMood = useCallback(async (mood: UserState['mood'], moodNote?: string) => {
    try {
      await coupleStateApi.updateMood(mood, moodNote)
      setHomeData((prev) => {
        const stateKey = isUser1 ? 'user1' : 'user2'
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
        }
      })
    } catch (err) {
      console.error('Failed to update mood:', err)
    }
  }, [isUser1])

  // 冰箱贴留言更新
  const handleUpdateFridgeNote = useCallback(async (note: string) => {
    try {
      await coupleStateApi.updateFridgeNote(note)
      setHomeData((prev) => ({
        ...prev,
        state: { ...prev.state, fridge_note: note },
      }))
    } catch (err) {
      console.error('Failed to update fridge note:', err)
    }
  }, [])

  // 白旗操作
  const handleRaiseFlag = useCallback(async () => {
    try {
      await coupleStateApi.raiseWhiteFlag()
      setHomeData((prev) => {
        const stateKey = isUser1 ? 'user1' : 'user2'
        return {
          ...prev,
          state: {
            ...prev.state,
            [stateKey]: {
              ...prev.state[stateKey],
              white_flag: {
                raised: true,
                raised_at: new Date().toISOString(),
              },
            },
          },
        }
      })
    } catch (err) {
      console.error('Failed to raise white flag:', err)
    }
  }, [isUser1])

  const handleLowerFlag = useCallback(async () => {
    try {
      await coupleStateApi.lowerWhiteFlag()
      setHomeData((prev) => {
        const stateKey = isUser1 ? 'user1' : 'user2'
        return {
          ...prev,
          state: {
            ...prev.state,
            [stateKey]: { ...prev.state[stateKey], white_flag: { raised: false } },
          },
        }
      })
    } catch (err) {
      console.error('Failed to lower white flag:', err)
    }
  }, [isUser1])

  // 绑定成功后重新加载数据
  const handleBindSuccess = useCallback(() => {
    setIsBound(null) // 重置为未检查状态
    loadInitialData()
  }, [])

  // 加载状态
  if (loading) {
    return (
      <div className="h-full bg-gradient-to-b from-amber-50/50 to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💕</div>
          <p className="text-stone-500">加载中...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-full bg-gradient-to-b from-amber-50/50 to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">😢</div>
          <p className="text-stone-500">{error}</p>
          <button
            onClick={loadInitialData}
            className="mt-4 px-4 py-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  // 未绑定状态 - 显示绑定界面
  if (isBound === false) {
    return (
      <div className="h-full">
        <CoupleBindView onBindSuccess={handleBindSuccess} />
      </div>
    )
  }

  // 渲染当前视图
  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            data={homeData}
            myState={myState}
            partnerState={partnerState}
            onUpdateMood={handleUpdateMood}
            onUpdateFridgeNote={handleUpdateFridgeNote}
            onRaiseFlag={handleRaiseFlag}
            onLowerFlag={handleLowerFlag}
          />
        )
      case 'list':
        return (
          <ListView
            todos={todos}
            memos={memos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onAddMemo={handleAddMemo}
            onDeleteMemo={handleDeleteMemo}
          />
        )
      case 'manual':
        return (
          <ManualView
            myManual={homeData.manuals.mine}
            partnerManual={homeData.manuals.ta}
            onUpdate={handleUpdateManual}
          />
        )
      case 'wish':
        return (
          <WishView
            wishlist={wishlist}
            rouletteOptions={rouletteOptions}
            currentUserId={currentUserId}
            onAddWish={handleAddWish}
            onClaimWish={handleClaimWish}
            onFulfillWish={handleFulfillWish}
            onDeleteWish={handleDeleteWish}
            onAddRouletteOption={handleAddRouletteOption}
            onDeleteRouletteOption={handleDeleteRouletteOption}
          />
        )
    }
  }

  return (
    <div className="h-full bg-gradient-to-b from-amber-50/50 to-rose-50/30 flex flex-col">
      {/* 主内容区域 */}
      <main className="pb-20">{renderView()}</main>

      {/* 底部导航 */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default JustRightPage
