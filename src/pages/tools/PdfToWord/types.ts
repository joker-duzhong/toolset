// SimpleTex API 配置
export interface SimpleTexConfig {
  token: string // 用户授权令牌 (UAT)
}

// 识别出的文档页面
export interface DocumentPage {
  pageNumber: number
  content: string // Markdown 格式内容
}

// 转换状态
export type ConvertStatus = 'idle' | 'uploading' | 'converting' | 'generating' | 'done' | 'error'

// 转换进度
export interface ConvertProgress {
  status: ConvertStatus
  totalPages: number
  currentPage: number
  message: string
  pages: DocumentPage[] // 识别出的页面内容
  error?: string
}

// PDF 页面信息
export interface PdfPageInfo {
  pageNumber: number
  imageDataUrl: string
  width: number
  height: number
}
