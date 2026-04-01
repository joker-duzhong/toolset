import { useState, useCallback } from 'react'
import type { ConvertProgress, PdfPageInfo } from '../types'
import { pdfToImages } from '../utils/pdfToImages'
import { recognizeDocumentFromPages } from '../utils/simpleTexOcr'
import { generateWordDocument } from '../utils/generateDocx'

const initialProgress: ConvertProgress = {
  status: 'idle',
  totalPages: 0,
  currentPage: 0,
  message: '',
  pages: [],
}

export function usePdfConverter() {
  const [progress, setProgress] = useState<ConvertProgress>(initialProgress)
  const [pdfPages, setPdfPages] = useState<PdfPageInfo[]>([])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setProgress(initialProgress)
    setPdfPages([])
  }, [])

  /**
   * 转换 PDF 到 Word
   */
  const convert = useCallback(async (file: File) => {
    try {
      // 阶段1: 解析 PDF
      setProgress({
        status: 'uploading',
        totalPages: 0,
        currentPage: 0,
        message: '正在解析 PDF 文件...',
        pages: [],
      })

      const pages = await pdfToImages(file, 2, (current, total) => {
        setProgress((prev) => ({
          ...prev,
          totalPages: total,
          currentPage: current,
          message: `正在解析 PDF: ${current}/${total} 页`,
        }))
      })

      setPdfPages(pages)

      // 阶段2: 识别文档内容
      setProgress((prev) => ({
        ...prev,
        status: 'converting',
        message: '正在识别文档内容...',
        currentPage: 0,
      }))

      const recognizedPages = await recognizeDocumentFromPages(
        pages.map((p) => ({
          pageNumber: p.pageNumber,
          imageDataUrl: p.imageDataUrl,
        })),
        (current: number, total: number) => {
          setProgress((prev) => ({
            ...prev,
            currentPage: current,
            totalPages: total,
            message: `正在识别文档: ${current}/${total} 页`,
          }))
        }
      )

      // 阶段3: 生成 Word
      setProgress((prev) => ({
        ...prev,
        status: 'generating',
        message: '正在生成 Word 文档...',
      }))

      await generateWordDocument(recognizedPages, file.name)

      // 完成
      setProgress((prev) => ({
        ...prev,
        status: 'done',
        pages: recognizedPages,
        message: `完成!共识别 ${recognizedPages.length} 页`,
      }))

      return { success: true, pages: recognizedPages }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '转换失败'
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
        message: `错误: ${errorMessage}`,
      }))
      return { success: false, error: errorMessage }
    }
  }, [])

  return {
    progress,
    pdfPages,
    convert,
    reset,
  }
}
