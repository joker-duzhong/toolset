import { dataUrlToBlob } from './pdfToImages'
import { SIMPLEX_CONFIG } from '../config'

/**
 * 文档识别结果
 */
export interface DocOcrResult {
  content: string // Markdown 格式内容
  requestId: string
}

/**
 * 调用 SimpleTex doc_ocr API 识别整页文档
 * API 文档: https://doc.simpletex.cn/zh/api/api_doc_ocr.html
 */
export async function recognizeDocumentPage(
  imageDataUrl: string
): Promise<DocOcrResult> {
  const blob = dataUrlToBlob(imageDataUrl)

  // 使用 FormData 构建请求
  const formData = new FormData()
  formData.append('file', blob, 'image.png')

  // 通过代理调用 doc_ocr API
  const apiBaseUrl = import.meta.env.DEV
    ? '/api/simpletex'  // 开发环境通过 Vite 代理
    : 'https://server.simpletex.cn/api'  // 生产环境直连（需后端代理）

  const response = await fetch(`${apiBaseUrl}/latex_ocr/`, {
    method: 'POST',
    headers: {
      'token': SIMPLEX_CONFIG.token,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.errType || `SimpleTex API 错误: ${response.status}`)
  }

  const data = await response.json()

  if (!data.status) {
    throw new Error(data.errType || '识别失败')
  }

  return {
    content: data.res?.content || '',
    requestId: data.request_id || '',
  }
}

/**
 * 批量识别多页 PDF 文档
 */
export async function recognizeDocumentFromPages(
  pages: { pageNumber: number; imageDataUrl: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<{ pageNumber: number; content: string }[]> {
  const results: { pageNumber: number; content: string }[] = []

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    try {
      const result = await recognizeDocumentPage(page.imageDataUrl)

      if (result.content) {
        results.push({
          pageNumber: page.pageNumber,
          content: result.content,
        })
      }
    } catch (error) {
      console.error(`第 ${page.pageNumber} 页识别失败:`, error)
      // 继续处理其他页面，不中断
    }

    onProgress?.(i + 1, pages.length)
  }

  return results
}
