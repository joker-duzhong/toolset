import * as pdfjsLib from 'pdfjs-dist'
import type { RenderParameters } from 'pdfjs-dist/types/src/display/api'
import type { PdfPageInfo } from '../types'

// 设置 PDF.js worker (PDF.js 5.x 使用 .mjs 扩展名)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/**
 * 将 PDF 文件转换为图片数组
 */
export async function pdfToImages(
  file: File,
  scale: number = 2,
  onProgress?: (current: number, total: number) => void
): Promise<PdfPageInfo[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages
  const pages: PdfPageInfo[] = []

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    // 创建 canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height

    // 渲染页面
    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    } as unknown as RenderParameters).promise

    // 转换为 Data URL
    const imageDataUrl = canvas.toDataURL('image/png')

    pages.push({
      pageNumber: i,
      imageDataUrl,
      width: viewport.width,
      height: viewport.height,
    })

    onProgress?.(i, totalPages)
  }

  return pages
}

/**
 * 将 Data URL 转换为 Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
