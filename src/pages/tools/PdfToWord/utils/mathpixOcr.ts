import type { MathpixConfig, RecognizedFormula } from '../types'
import { dataUrlToBlob } from './pdfToImages'

/**
 * 调用 Mathpix API 识别图片中的公式
 */
export async function recognizeFormula(
  imageDataUrl: string,
  config: MathpixConfig
): Promise<{ latex: string; text: string }> {
  const blob = dataUrlToBlob(imageDataUrl)

  // 使用 FormData 构建请求
  const formData = new FormData()
  formData.append('file', blob, 'image.png')
  // 请求 LaTeX 格式输出
  formData.append('options_json', JSON.stringify({
    format: 'latex:simplified',
    data: {
      include_latex: true,
      include_text: true,
    },
  }))

  const response = await fetch('https://api.mathpix.com/v3/text', {
    method: 'POST',
    headers: {
      'app_id': config.appId,
      'app_key': config.appKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Mathpix API 错误: ${response.status}`)
  }

  const data = await response.json()

  return {
    latex: data.latex_simplified || data.latex || '',
    text: data.text || '',
  }
}

/**
 * 批量识别多页 PDF 中的公式
 */
export async function recognizeFormulasFromPages(
  pages: { pageNumber: number; imageDataUrl: string }[],
  config: MathpixConfig,
  onProgress?: (current: number, total: number) => void
): Promise<RecognizedFormula[]> {
  const formulas: RecognizedFormula[] = []

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    try {
      const result = await recognizeFormula(page.imageDataUrl, config)

      if (result.latex) {
        formulas.push({
          id: `formula-${page.pageNumber}-${i}`,
          latex: result.latex,
          pageIndex: page.pageNumber,
        })
      }
    } catch (error) {
      console.error(`第 ${page.pageNumber} 页识别失败:`, error)
      // 继续处理其他页面，不中断
    }

    onProgress?.(i + 1, pages.length)
  }

  return formulas
}

/**
 * 验证 Mathpix API Key 是否有效
 */
export async function validateApiKey(config: MathpixConfig): Promise<boolean> {
  try {
    // 创建一个简单的测试图片 (1x1 像素)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const testDataUrl = canvas.toDataURL('image/png')

    await recognizeFormula(testDataUrl, config)
    return true
  } catch {
    return false
  }
}
