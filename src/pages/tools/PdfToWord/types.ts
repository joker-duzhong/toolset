// Mathpix API 配置
export interface MathpixConfig {
  appId: string
  appKey: string
}

// 识别出的公式
export interface RecognizedFormula {
  id: string
  latex: string
  pageIndex: number
  rect?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// 转换状态
export type ConvertStatus = 'idle' | 'uploading' | 'converting' | 'generating' | 'done' | 'error'

// 转换进度
export interface ConvertProgress {
  status: ConvertStatus
  totalPages: number
  currentPage: number
  message: string
  formulas: RecognizedFormula[]
  error?: string
}

// PDF 页面信息
export interface PdfPageInfo {
  pageNumber: number
  imageDataUrl: string
  width: number
  height: number
}
