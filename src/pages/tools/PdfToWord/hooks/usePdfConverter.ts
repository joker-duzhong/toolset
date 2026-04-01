import { useState, useCallback } from 'react'
import type { ConvertProgress, MathpixConfig, RecognizedFormula, PdfPageInfo } from '../types'
import { pdfToImages } from '../utils/pdfToImages'
import { recognizeFormulasFromPages } from '../utils/mathpixOcr'
import { generateWordDocument } from '../utils/generateDocx'

const initialProgress: ConvertProgress = {
  status: 'idle',
  totalPages: 0,
  currentPage: 0,
  message: '',
  formulas: [],
}

export function usePdfConverter() {
  const [progress, setProgress] = useState<ConvertProgress>(initialProgress)
  const [pages, setPages] = useState<PdfPageInfo[]>([])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setProgress(initialProgress)
    setPages([])
  }, [])

  /**
   * 转换 PDF 到 Word
   */
  const convert = useCallback(async (
    file: File,
    config: MathpixConfig
  ) => {
    try {
      // 阶段1: 解析 PDF
      setProgress({
        status: 'uploading',
        totalPages: 0,
        currentPage: 0,
        message: '正在解析 PDF 文件...',
        formulas: [],
      })

      const pdfPages = await pdfToImages(file, 2, (current, total) => {
        setProgress((prev) => ({
          ...prev,
          totalPages: total,
          currentPage: current,
          message: `正在解析 PDF: ${current}/${total} 页`,
        }))
      })

      setPages(pdfPages)

      // 阶段2: 识别公式
      setProgress((prev) => ({
        ...prev,
        status: 'converting',
        message: '正在识别数学公式...',
        currentPage: 0,
      }))

      const formulas = await recognizeFormulasFromPages(
        pdfPages.map((p) => ({
          pageNumber: p.pageNumber,
          imageDataUrl: p.imageDataUrl,
        })),
        config,
        (current, total) => {
          setProgress((prev) => ({
            ...prev,
            currentPage: current,
            totalPages: total,
            message: `正在识别公式: ${current}/${total} 页`,
          }))
        }
      )

      // 阶段3: 生成 Word
      setProgress((prev) => ({
        ...prev,
        status: 'generating',
        message: '正在生成 Word 文档...',
      }))

      await generateWordDocument(formulas, file.name)

      // 完成
      setProgress((prev) => ({
        ...prev,
        status: 'done',
        formulas,
        message: `完成！共识别 ${formulas.length} 个公式`,
      }))

      return { success: true, formulas }
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
    pages,
    convert,
    reset,
  }
}
