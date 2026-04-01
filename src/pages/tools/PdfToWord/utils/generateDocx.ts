import {
  Document,
  Paragraph,
  TextRun,
  Math,
  MathRun as MathRunImport,
  Packer,
  HeadingLevel,
  AlignmentType,
  type FileChild,
  BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'
import type { DocumentPage } from '../types'

// 重新导出 DocumentPage 以便其他模块使用
export type { DocumentPage } from '../types'

const MathRun = MathRunImport

/**
 * 解析 Markdown 内容,分离文本和公式
 */
interface ContentSegment {
  type: 'text' | 'inline-formula' | 'block-formula'
  content: string
}

function parseMarkdownWithFormulas(markdown: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  let remaining = markdown
  let i = 0

  while (i < remaining.length) {
    // 检查是否是块级公式 $$
    if (remaining.slice(i, i + 2) === '$$') {
      const endIndex = remaining.indexOf('$$', i + 2)
      if (endIndex !== -1) {
        const formula = remaining.slice(i + 2, endIndex).trim()
        if (formula) {
          segments.push({ type: 'block-formula', content: formula })
        }
        i = endIndex + 2
        continue
      }
    }

    // 检查是否是行内公式 $
    if (remaining[i] === '$') {
      let endIndex = i + 1
      while (endIndex < remaining.length) {
        if (remaining[endIndex] === '$' && remaining[endIndex - 1] !== '\\') {
          break
        }
        endIndex++
      }

      if (endIndex < remaining.length && endIndex > i + 1) {
        const formula = remaining.slice(i + 1, endIndex)
        if (!formula.includes('\n') && formula.trim()) {
          segments.push({ type: 'inline-formula', content: formula.trim() })
          i = endIndex + 1
          continue
        }
      }
    }

    // 普通文本
    let textEnd = i
    while (textEnd < remaining.length) {
      if (remaining[textEnd] === '$') break
      textEnd++
    }

    if (textEnd > i) {
      const text = remaining.slice(i, textEnd)
      if (text.trim()) {
        segments.push({ type: 'text', content: text })
      }
    }

    if (textEnd === i) {
      textEnd++
    }
    i = textEnd
  }

  return segments
}

/**
 * 将内容段落转换为 docx.js 的段落
 */
function createParagraphFromContent(segments: ContentSegment[]): Paragraph[] {
  const paragraphs: Paragraph[] = []
  let currentTextRuns: (TextRun | Math)[] = []

  for (const segment of segments) {
    if (segment.type === 'text') {
      const lines = segment.content.split('\n')

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx]

        if (lineIdx > 0) {
          if (currentTextRuns.length > 0) {
            paragraphs.push(new Paragraph({ children: currentTextRuns }))
            currentTextRuns = []
          } else {
            paragraphs.push(new Paragraph({ children: [] }))
          }
        }

        // 处理 Markdown 标题
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
        if (headerMatch) {
          if (currentTextRuns.length > 0) {
            paragraphs.push(new Paragraph({ children: currentTextRuns }))
            currentTextRuns = []
          }

          const level = headerMatch[1].length
          const text = headerMatch[2]
          const headingLevel =
            level === 1
              ? HeadingLevel.HEADING_1
              : level === 2
                ? HeadingLevel.HEADING_2
                : level === 3
                  ? HeadingLevel.HEADING_3
                  : HeadingLevel.HEADING_4

          paragraphs.push(
            new Paragraph({
              text,
              heading: headingLevel,
              spacing: { before: 200, after: 100 },
            })
          )
          continue
        }

        if (line.trim()) {
          currentTextRuns.push(
            new TextRun({
              text: line,
              size: 24,
            })
          )
        }
      }
    } else if (segment.type === 'inline-formula') {
      currentTextRuns.push(createMathFromLatex(segment.content))
    } else if (segment.type === 'block-formula') {
      if (currentTextRuns.length > 0) {
        paragraphs.push(new Paragraph({ children: currentTextRuns }))
        currentTextRuns = []
      }

      paragraphs.push(
        new Paragraph({
          children: [createMathFromLatex(segment.content)],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        })
      )
    }
  }

  if (currentTextRuns.length > 0) {
    paragraphs.push(new Paragraph({ children: currentTextRuns }))
  }

  return paragraphs
}

/**
 * 将 LaTeX 转换为 docx.js 的 Math 元素
 */
function createMathFromLatex(latex: string): Math {
  return new Math({
    children: [new MathRun(latex)],
  })
}

/**
 * 生成包含原文和公式的 Word 文档
 */
export async function generateWordDocument(
  pages: DocumentPage[],
  pdfFileName: string
): Promise<void> {
  const sections: FileChild[] = []

  // 添加文档标题
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: pdfFileName.replace(/\.pdf$/i, ''),
          bold: true,
          size: 36,
        }),
      ],
      spacing: { after: 400 },
      border: {
        bottom: {
          color: 'auto',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    })
  )

  // 添加说明
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `由 SimpleTex API 识别转换 - 共 ${pages.length} 页`,
          size: 20,
          color: '888888',
        }),
      ],
      spacing: { after: 300 },
    })
  )

  // 处理每一页
  for (const page of pages) {
    // 页码分隔
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `─ 第 ${page.pageNumber} 页 ─`,
            color: 'CCCCCC',
            size: 18,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 200 },
      })
    )

    // 解析 Markdown 内容
    const segments = parseMarkdownWithFormulas(page.content)
    const paragraphs = createParagraphFromContent(segments)
    sections.push(...paragraphs)
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
  const fileName = pdfFileName.replace(/\.pdf$/i, '.docx')
  saveAs(blob, fileName)
}
