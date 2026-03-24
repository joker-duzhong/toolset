export type ToolCategory =
  | 'image'    // 图片处理
  | 'text'     // 文本处理
  | 'convert'  // 格式转换
  | 'encode'   // 编解码
  | 'life'     // 生活实用
  | 'dev'      // 开发工具
  | 'other'    // 其他

export interface ToolCategoryInfo {
  key: ToolCategory
  label: string
  color: string        // Tailwind bg color class
  textColor: string    // Tailwind text color class
}

export interface ToolItem {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: string         // lucide-react icon name
  path: string         // route path
  tags?: string[]      // 搜索关键词标签
  isNew?: boolean      // 新上线标记
  isHot?: boolean      // 热门标记
  disabled?: boolean   // 即将上线
}
