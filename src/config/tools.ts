import type { ToolCategory, ToolCategoryInfo, ToolItem } from '@/types/tool'

// ────────────────────────────────────────────────
// 分类配置
// ────────────────────────────────────────────────
export const CATEGORIES: ToolCategoryInfo[] = [
  {
    key: 'image',
    label: '图片处理',
    color: 'bg-violet-100',
    textColor: 'text-violet-600',
  },
  {
    key: 'text',
    label: '文本处理',
    color: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    key: 'convert',
    label: '格式转换',
    color: 'bg-emerald-100',
    textColor: 'text-emerald-600',
  },
  {
    key: 'encode',
    label: '编解码',
    color: 'bg-amber-100',
    textColor: 'text-amber-600',
  },
  {
    key: 'life',
    label: '生活实用',
    color: 'bg-pink-100',
    textColor: 'text-pink-600',
  },
  {
    key: 'dev',
    label: '开发工具',
    color: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  {
    key: 'entertainment',
    label: '影音娱乐',
    color: 'bg-rose-100',
    textColor: 'text-rose-600',
  },
  {
    key: 'other',
    label: '其他',
    color: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
]

// 快速查找分类信息
export const getCategoryInfo = (key: ToolCategory): ToolCategoryInfo =>
  CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]

// ────────────────────────────────────────────────
// 工具配置列表
// 新增工具只需在这里追加一条记录即可
// ────────────────────────────────────────────────
export const TOOLS: ToolItem[] = [
  // ── 图片处理 ──────────────────────────────────
  {
    id: 'watermark-remover',
    name: '去水印',
    description: '上传图片，自动识别并擦除常见水印区域',
    category: 'image',
    icon: 'Eraser',
    path: '/tools/watermark-remover',
    tags: ['水印', '图片', '擦除', 'watermark'],
    isNew: true,
  },
  {
    id: 'image-compress',
    name: '图片压缩',
    description: '在线压缩 JPG / PNG / WebP，无损或有损可选',
    category: 'image',
    icon: 'FileImage',
    path: '/tools/image-compress',
    tags: ['压缩', '图片', 'jpg', 'png', 'webp'],
    isHot: true,
  },
  {
    id: 'image-convert',
    name: '图片格式转换',
    description: '支持 JPG、PNG、WebP、AVIF 互转',
    category: 'image',
    icon: 'RefreshCw',
    path: '/tools/image-convert',
    tags: ['格式', '转换', '图片'],
  },
  {
    id: 'bg-remover',
    name: '抠图 / 去背景',
    description: '一键去除图片背景，生成透明 PNG',
    category: 'image',
    icon: 'Scissors',
    path: '/tools/bg-remover',
    tags: ['抠图', '去背景', '透明', 'PNG'],
    isNew: true,
  },

  // ── 文本处理 ──────────────────────────────────
  {
    id: 'text-diff',
    name: '文本对比',
    description: '逐行对比两段文本的差异，高亮显示不同之处',
    category: 'text',
    icon: 'GitCompare',
    path: '/tools/text-diff',
    tags: ['文本', '对比', 'diff'],
  },
  {
    id: 'word-count',
    name: '字数统计',
    description: '统计文章字数、词数、段落数和阅读时长',
    category: 'text',
    icon: 'AlignLeft',
    path: '/tools/word-count',
    tags: ['字数', '统计', '文章'],
  },
  {
    id: 'case-converter',
    name: '大小写转换',
    description: '英文大小写、驼峰、下划线、帕斯卡等命名风格互转',
    category: 'text',
    icon: 'Type',
    path: '/tools/case-converter',
    tags: ['大小写', '驼峰', 'camelCase', '转换'],
  },

  // ── 格式转换 ──────────────────────────────────
  {
    id: 'json-format',
    name: 'JSON 格式化',
    description: 'JSON 格式化 / 压缩 / 校验，支持折叠树形视图',
    category: 'convert',
    icon: 'Braces',
    path: '/tools/json-format',
    tags: ['JSON', '格式化', '压缩', '校验'],
    isHot: true,
  },
  {
    id: 'markdown-preview',
    name: 'Markdown 预览',
    description: '实时预览 Markdown 渲染效果',
    category: 'convert',
    icon: 'FileText',
    path: '/tools/markdown-preview',
    tags: ['markdown', '预览', 'md'],
  },
  {
    id: 'html-preview',
    name: 'HTML 预览',
    description: '实时预览 HTML 代码渲染效果',
    category: 'convert',
    icon: 'Code',
    path: '/tools/html-preview',
    tags: ['html', '预览', '代码'],
    isNew: true,
  },

  // ── 编解码 ────────────────────────────────────
  {
    id: 'base64',
    name: 'Base64 编解码',
    description: '文本 / 图片 Base64 编码与解码',
    category: 'encode',
    icon: 'Lock',
    path: '/tools/base64',
    tags: ['base64', '编码', '解码'],
  },
  {
    id: 'url-encode',
    name: 'URL 编解码',
    description: 'URL 编码（encodeURIComponent）与解码',
    category: 'encode',
    icon: 'Link',
    path: '/tools/url-encode',
    tags: ['url', '编码', '解码', 'encode'],
  },
  {
    id: 'qrcode',
    name: '二维码生成',
    description: '输入文字或链接，即时生成二维码图片',
    category: 'encode',
    icon: 'QrCode',
    path: '/tools/qrcode',
    tags: ['二维码', 'qrcode', '生成'],
    isNew: true,
  },

  // ── 生活实用 ──────────────────────────────────
  {
    id: 'bmi',
    name: 'BMI 计算器',
    description: '输入身高体重，计算 BMI 指数及健康评估',
    category: 'life',
    icon: 'Activity',
    path: '/tools/bmi',
    tags: ['BMI', '体重', '健康', '计算'],
  },
  {
    id: 'age-calc',
    name: '年龄计算器',
    description: '根据生日精确计算年龄、天数、距下次生日',
    category: 'life',
    icon: 'Calendar',
    path: '/tools/age-calc',
    tags: ['年龄', '生日', '计算'],
  },

  {
    id: 'skewers-count',
    name: '串串计数',
    description: '拍照自动识别串串签子数量，Hough 算法检测，快速结账不用数',
    category: 'life',
    icon: 'Utensils',
    path: '/tools/skewers-count',
    tags: ['串串', '签子', '计数', '火锅', '结账', '麻辣烫'],
    isNew: true,
  },

  // ── 开发工具 ──────────────────────────────────
  {
    id: 'color-picker',
    name: '颜色工具',
    description: 'HEX / RGB / HSL 颜色值互转，取色盘',
    category: 'dev',
    icon: 'Palette',
    path: '/tools/color-picker',
    tags: ['颜色', 'color', 'hex', 'rgb', 'hsl'],
  },
  {
    id: 'regex-test',
    name: '正则表达式测试',
    description: '实时测试正则表达式，高亮匹配结果',
    category: 'dev',
    icon: 'Regex',
    path: '/tools/regex-test',
    tags: ['正则', 'regex', '测试'],
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: 'Unix 时间戳与可读时间互转',
    category: 'dev',
    icon: 'Clock',
    path: '/tools/timestamp',
    tags: ['时间戳', 'timestamp', '时间', 'unix'],
  },

  // ── 影音娱乐 ──────────────────────────────────
  {
    id: 'movie-tv',
    name: '影视大全',
    description: '热门电影、电视剧、动漫、综艺、纪录片，一站式浏览',
    category: 'entertainment',
    icon: 'Clapperboard',
    path: '/tools/movie-tv',
    tags: ['电影', '电视剧', '动漫', '综艺', '影视', '视频', '追剧'],
    isNew: true,
    isHot: true,
  },

  // ── 文档处理 ──────────────────────────────────
  {
    id: 'pdf-to-word',
    name: 'PDF 公式提取',
    description: '提取 PDF 中的数学公式，导出为可编辑的 Word 文档',
    category: 'convert',
    icon: 'FileText',
    path: '/tools/pdf-to-word',
    tags: ['PDF', 'Word', '公式', 'LaTeX', '数学', '转换'],
    isNew: true,
  },
]
