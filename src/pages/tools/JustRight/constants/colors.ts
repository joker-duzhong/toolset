// JustRight 色彩系统
// 根据设计规范统一定义

export const COLORS = {
  // 主背景色
  background: {
    primary: '#F9F9FB',      // 极地白/奶油灰（主背景）
    secondary: '#FDFBF7',    // 次要背景（卡片）
    tertiary: '#FAF7F2',     // 第三级背景（特殊区域）
  },

  // 主色调（暖色系）
  primary: {
    orange: '#FF9A76',       // 落日橘
    yellow: '#FFD56F',       // 奶油黄
    rose: '#F44380',         // 玫瑰红
    pink: '#FFB6C1',         // 浅粉色
  },

  // 双生色（区分双方）
  couple: {
    male: '#B3E5FC',         // 浅氧气蓝（男方）
    female: '#FFE4E1',       // 浅樱花粉（女方）
  },

  // 功能色
  functional: {
    success: '#4CAF50',      // 成功/完成
    warning: '#FFA726',      // 警告
    error: '#EF5350',        // 错误
    info: '#42A5F5',         // 信息
  },

  // 中性色
  neutral: {
    white: '#FFFFFF',
    black: '#1C1C1E',
    stone: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
    },
  },

  // 特殊场景色
  special: {
    fridgeNote: '#FAF7F2',   // 冰箱贴背景
    segmentedControl: '#F1EDE4', // 分段控制器背景
    modalOverlay: 'rgba(0, 0, 0, 0.2)', // 弹窗遮罩
  },
} as const

// 圆角系统
export const RADIUS = {
  sm: '0.75rem',    // 12px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  full: '9999px',
} as const

// 阴影系统（弥散阴影）
export const SHADOWS = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
  md: '0 4px 16px rgba(0, 0, 0, 0.06)',
  lg: '0 8px 30px rgba(0, 0, 0, 0.08)',
  xl: '0 12px 40px rgba(0, 0, 0, 0.1)',
} as const

// Tailwind 类名映射（用于快速替换）
export const BG_CLASSES = {
  primary: 'bg-[#F9F9FB]',
  secondary: 'bg-[#FDFBF7]',
  tertiary: 'bg-[#FAF7F2]',
  white: 'bg-white',
  segmentedControl: 'bg-[#F1EDE4]',
} as const

export const ROUNDED_CLASSES = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  xl: 'rounded-[2rem]',
  '2xl': 'rounded-[2.5rem]',
  full: 'rounded-full',
} as const
