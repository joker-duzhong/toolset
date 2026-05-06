import { useState, useEffect } from "react";
import { coupleApi } from "../services/api";
import { InvitePoster } from "../components/InvitePoster";
import { copyToClipboard } from "../utils/copy";

interface CoupleBindViewProps {
  onBindSuccess: () => void;
  initialInviteCode?: string;
}

export function CoupleBindView({ onBindSuccess, initialInviteCode = "" }: CoupleBindViewProps) {
  // step: 'main' 为首页(生成/输入)，'success' 为绑定成功页
  const [step, setStep] = useState<"main" | "success">("main");
  const [inviteCode, setInviteCode] = useState(initialInviteCode.toUpperCase());
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

  // 从 URL 参数中自动填充邀请码
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("invite_code");
    if (codeFromUrl) {
      setInputCode(codeFromUrl.toUpperCase());
    }
  }, []);

  useEffect(() => {
    const loadInviteCode = async () => {
      try {
        const res = await coupleApi.get();
        if (res.data?.invite_code) {
          setInviteCode(res.data.invite_code.toUpperCase());
        }
      } catch (err) {
        console.error("Failed to load invite code:", err);
      }
    };

    loadInviteCode();
  }, []);

  useEffect(() => {
    if (initialInviteCode) {
      setInviteCode(initialInviteCode.toUpperCase());
    }
  }, [initialInviteCode]);

  // 清理错误提示
  useEffect(() => {
    if (inputCode) setError(null);
  }, [inputCode]);

  // 创建情侣关系
  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await coupleApi.create();

      if (!String(res.code).startsWith("2")) {
        setError(res.message || "生成失败，请重试");
        return;
      }

      if (res.data?.invite_code) {
        setInviteCode(res.data.invite_code);
      } else {
        setError("生成失败，未获取邀请码");
      }
    } catch (err) {
      console.error("Failed to create couple:", err);
      setError("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 复制邀请码
  const handleCopyCode = async () => {
    try {
      await copyToClipboard(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // 通过邀请码加入
  const handleJoin = async () => {
    if (!inputCode.trim()) {
      setError("请输入邀请码");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await coupleApi.join(inputCode.trim());
      if (!String(res.code).startsWith("2")) {
        setError(res.message || "邀请码无效或已过期");
        return;
      }
      // 绑定成功，进入成功页
      setStep("success");
    } catch (err) {
      console.error("Failed to join couple:", err);
      setError("邀请码无效或已过期");
    } finally {
      setLoading(false);
    }
  };

  // 插画组件 (CSS还原设计图的拼图小人)
  const Illustration = () => (
    <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
      {/* 背景圈 */}
      <div className="absolute inset-0 bg-rose-50/60 rounded-full scale-110"></div>
      {/* 漂浮的心 */}
      <div className="absolute top-4 left-6 text-rose-300 text-sm rotate-12">♥</div>
      <div className="absolute top-8 right-8 text-rose-300 text-xs -rotate-12">♥</div>
      <div className="absolute bottom-6 left-10 text-rose-300 text-xs">♥</div>

      {/* 拼图 (纯CSS示意) */}
      <div className="relative flex items-center justify-center w-full h-full">
        <svg
          viewBox="0 0 200 150"
          className="w-full h-full drop-shadow-md z-10"
        >
          <path
            d="M100 40 C100 20, 80 10, 60 20 C40 30, 30 50, 30 70 C30 100, 60 120, 95 120 L95 90 C110 90, 110 70, 95 70 L95 40 Z"
            fill="#FCA5A5"
          />
          <path
            d="M100 40 C100 20, 120 10, 140 20 C160 30, 170 50, 170 70 C170 100, 140 120, 105 120 L105 90 C90 90, 90 70, 105 70 L105 40 Z"
            fill="#93C5FD"
          />
          {/* 表情 */}
          <circle
            cx="65"
            cy="65"
            r="3"
            fill="#4B5563"
          />
          <circle
            cx="80"
            cy="65"
            r="3"
            fill="#4B5563"
          />
          <path
            d="M 68 75 Q 72 78 77 75"
            stroke="#4B5563"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          <circle
            cx="120"
            cy="65"
            r="3"
            fill="#4B5563"
          />
          <circle
            cx="135"
            cy="65"
            r="3"
            fill="#4B5563"
          />
          <path
            d="M 123 75 Q 127 78 132 75"
            stroke="#4B5563"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#FFF7F4] flex flex-col p-6">
        <button
          onClick={() => setStep("main")}
          className="text-stone-500 hover:text-stone-800 transition-colors p-2 -ml-2 mb-12"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center mt-10">
          <Illustration />

          <h1 className="text-2xl font-bold text-stone-800 mb-3 mt-4">
            配对成功！<span className="text-2xl">🎉</span>
          </h1>
          <p className="text-[#A39994] text-sm mb-16">欢迎来到你们的专属空间</p>

          <button
            onClick={onBindSuccess}
            className="w-full max-w-[280px] py-4 bg-gradient-to-r from-[#FE957B] to-[#FE7A64] text-white rounded-full font-medium text-lg shadow-[0_8px_20px_rgba(254,122,100,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            进入我们的空间
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7F4] flex flex-col p-6 relative">
      {/* Header */}
      <div className="text-center mt-12 mb-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          遇见你，真好 <span className="text-rose-400">♥</span>
        </h1>
        <p className="text-[#A39994] text-sm">你们的专属空间，只属于彼此</p>
      </div>

      <Illustration />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-sm w-full mx-auto space-y-8 mt-4">
        {/* 新建关系卡片 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgba(254,139,113,0.06)] border border-white">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-1">
              新建关系 <span className="text-rose-400 text-sm">♥</span>
            </h2>
            <p className="text-[#A39994] text-xs mt-1">生成邀请码，与Ta连接</p>
          </div>

          {/* 邀请码展示区 (6位) */}
          <div className="flex justify-between gap-2 mb-6">
            {Array.from({ length: 6 }).map((_, i) => {
              const char = inviteCode[i] || "";
              return (
                <div
                  key={i}
                  className="w-10 h-12 bg-white border border-[#F2E8E4] rounded-xl flex items-center justify-center text-xl font-bold text-stone-700 shadow-sm"
                >
                  {char}
                </div>
              );
            })}
          </div>

          <button
            onClick={inviteCode ? handleCopyCode : handleCreate}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#FE957B] to-[#FE7A64] text-white rounded-full font-medium shadow-[0_6px_16px_rgba(254,122,100,0.25)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? "生成中..." : inviteCode ? (copySuccess ? "✓ 复制成功" : "复制邀请码") : "生成邀请码"}
          </button>

          {/* 补充功能：生成海报链接 */}
          {inviteCode && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPoster(true)}
                className="text-xs text-[#FE8B71] hover:text-[#E8735A] font-medium"
              >
                生成邀请海报分享给 Ta &gt;
              </button>
            </div>
          )}
        </div>

        {/* 底部加入关系区域 */}
        <div className="px-2">
          <div className="text-center mb-4">
            <span className="text-[#A39994] text-sm">已有邀请码？ </span>
            <span className="text-[#FE8B71] text-sm font-medium">立即连接</span>
          </div>

          <div className="flex gap-3 bg-white/60 p-1.5 rounded-2xl border border-white shadow-sm">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="请输入6位邀请码"
              maxLength={8}
              className="flex-1 bg-transparent px-4 text-stone-700 placeholder:text-[#C5BCB7] outline-none text-sm tracking-widest font-mono"
            />
            <button
              onClick={handleJoin}
              disabled={loading || !inputCode.trim()}
              className="px-6 py-2.5 bg-[#FE8B71] text-white rounded-xl text-sm font-medium hover:bg-[#FE7A64] transition-all active:scale-[0.95] disabled:opacity-50"
            >
              连接
            </button>
          </div>

          {error && <p className="text-rose-500 text-xs text-center mt-3 px-4">{error}</p>}
        </div>
      </div>

      {showPoster && (
        <InvitePoster
          inviteCode={inviteCode}
          onClose={() => setShowPoster(false)}
        />
      )}
    </div>
  );
}

export default CoupleBindView;
