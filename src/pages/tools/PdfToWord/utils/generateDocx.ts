import {
  Document,
  Paragraph,
  TextRun,
  Math,
  MathRun,
  Packer,
  HeadingLevel,
} from 'docx'
import { saveAs } from 'file-saver'
import type { RecognizedFormula } from '../types'
import { latexToText, parseLatex } from './latexToOmml'

/**
 * 将 LaTeX 转换为 docx.js 的 Math 元素
 */
function createMathFromLatex(latex: string): Math {
  // docx.js 的 MathRun 直接支持 LaTeX
  return new Math({
    children: [
      new MathRun(latex),
    ],
  })
}

/**
 * 生成包含公式的 Word 文档
 */
export async function generateWordDocument(
  formulas: RecognizedFormula[],
  pdfFileName: string
): Promise<void> {
  // 按页码分组
  const formulasByPage = new Map<number, RecognizedFormula[]>()
  for (const formula of formulas) {
    const page = formula.pageIndex
    if (!formulasByPage.has(page)) {
      formulasByPage.set(page, [])
    }
    formulasByPage.get(page)!.push(formula)
  }

  // 构建文档内容
  const sections: (Paragraph | Math)[] = []

  // 添加标题
  sections.push(
    new Paragraph({
      text: `PDF 公式提取结果 - ${pdfFileName}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    })
  )

  // 添加说明
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `共识别 ${formulas.length} 个公式，来自 ${formulasByPage.size} 页`,
          size: 22,
          color: '666666',
        }),
      ],
      spacing: { after: 400 },
    })
  )

  // 按页添加公式
  const sortedPages = [...formulasByPage.keys()].sort((a, b) => a - b)

  for (const pageNumber of sortedPages) {
    const pageFormulas = formulasByPage.get(pageNumber)!

    // 页码标题
    sections.push(
      new Paragraph({
        text: `第 ${pageNumber} 页`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    // 添加该页的所有公式
    pageFormulas.forEach((formula, index) => {
      // 公式编号
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `公式 ${index + 1}:`,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 200 },
        })
      )

      // 数学公式 (Word 原生公式格式)
      sections.push(
        new Paragraph({
          children: [
            createMathFromLatex(formula.latex),
          ],
          spacing: { after: 100 },
        })
      )

      // LaTeX 源码（便于查看和编辑）
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'LaTeX: ',
              size: 18,
              color: '888888',
            }),
            new TextRun({
              text: formula.latex,
              size: 18,
              font: 'Courier New',
              color: '666666',
            }),
          ],
          spacing: { after: 200 },
        })
      )
    })
  }

  // 创建文档
  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  })

  // 生成并下载
  const blob = await Packer.toBlob(doc)
  const fileName = pdfFileName.replace(/\.pdf$/i, '_公式.docx')
  saveAs(blob, fileName)
}

/**
 * 生成完整的 Word 文档（包含原文和公式）
 */
export async function generateFullWordDocument(
  pages: { pageNumber: number; imageDataUrl: string; text?: string }[],
  formulas: RecognizedFormula[],
  pdfFileName: string
): Promise<void> {
  const sections: (Paragraph | Math)[] = []

  // 添加标题
  sections.push(
    new Paragraph({
      text: `PDF 转换结果 - ${pdfFileName}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    })
  )

  // 按页处理
  for (const page of pages) {
    // 页码标题
    sections.push(
      new Paragraph({
        text: `第 ${page.pageNumber} 页`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    )

    // 该页的公式
    const pageFormulas = formulas.filter((f) => f.pageIndex === page.pageNumber)

    if (pageFormulas.length > 0) {
      pageFormulas.forEach((formula, index) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[公式 ${index + 1}]`,
                size: 20,
                color: '0066CC',
              }),
            ],
            spacing: { before: 150 },
          })
        )

        sections.push(
          new Paragraph({
            children: [createMathFromLatex(formula.latex)],
            spacing: { after: 150 },
          })
        )
      })
    }

    // 分隔线
    sections.push(
      new Paragraph({
        text: '─'.repeat(50),
        spacing: { before: 200, after: 200 },
      })
    )
  }

  // 创建文档
  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  })

  // 生成并下载
  const blob = await Packer.toBlob(doc)
  const fileName = pdfFileName.replace(/\.pdf$/i, '_转换.docx')
  saveAs(blob, fileName)
}
