// 求原谅动画 - 对方心情为“求原谅”时展示
export function WhiteFlagAnimation({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-[#FFFDF7] rounded-[2rem] p-8 max-w-sm mx-4 w-full text-center shadow-2xl relative overflow-hidden animate-spring-up">
        
        {/* 背景光晕装饰 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FA705A] opacity-10 blur-3xl rounded-full" />

        {/* 纯 SVG 手绘求和动画图形 */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center animate-wiggle">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 爱心气泡 */}
              <path d="M90 30 C 90 20, 110 20, 110 30 C 110 40, 90 50, 90 50 C 90 50, 70 40, 70 30 C 70 20, 90 20, 90 30" fill="#FFB4A9" className="animate-pulse" />
              {/* 小手递出求和信号 */}
              <path d="M20 100 Q 40 80, 60 90" stroke="#E6C3B3" strokeWidth="12" strokeLinecap="round" />
              <path d="M55 90V40" stroke="#B8A89F" strokeWidth="4" strokeLinecap="round" />
              {/* 飘动的旗帜 */}
              <path d="M55 45 C 70 35, 80 55, 95 45 V 75 C 80 85, 70 65, 55 75 Z" fill="#FFFFFF" stroke="#F2EAE4" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black text-stone-800 mb-2">
          Ta 正在求原谅
        </h2>
        <p className="text-sm text-stone-500 mb-8 font-medium">
          爱情里没有输赢，<br/>Ta 只是不想失去你。
        </p>

        <button
          onClick={onClose}
          className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-stone-700 transition-colors active:scale-95"
        >
          收到，给个台阶下
        </button>
      </div>

      {/* 自定义 CSS 动画注入 */}
      <style>{`
        @keyframes spring-up {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          60% { transform: scale(1.02) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-spring-up {
          animation: spring-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
