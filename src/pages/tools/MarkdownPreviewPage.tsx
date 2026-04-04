import { useState } from 'react'
import { marked } from 'marked'

marked.setOptions({ breaks: true })

const PLACEHOLDER = `# Markdown 预览

## 语法示例

**粗体** 和 *斜体*，以及 \`行内代码\`。

> 引用块内容

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

\`\`\`js
console.log('Hello, World!')
\`\`\`

[链接示例](https://example.com)
`

const proseStyles = `prose prose-sm max-w-none
  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
  [&_p]:my-2 [&_p]:text-gray-700 [&_p]:leading-relaxed
  [&_strong]:font-bold [&_em]:italic
  [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-rose-600 [&_code]:font-mono
  [&_pre]:bg-gray-900 [&_pre]:text-green-400 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-3
  [&_pre_code]:bg-transparent [&_pre_code]:text-green-400 [&_pre_code]:p-0
  [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-500 [&_blockquote]:my-2
  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:my-0.5
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
  [&_a]:text-indigo-600 [&_a]:underline
  [&_hr]:border-gray-200 [&_hr]:my-4`

export function MarkdownPreviewPage() {
  const [md, setMd] = useState(PLACEHOLDER)
  const [isPreview, setIsPreview] = useState(false)

  const html = marked.parse(md) as string

  return (
    <>
      <main className="h-full overflow-auto flex flex-col px-4 py-4 gap-3" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <textarea
          value={md}
          onChange={e => setMd(e.target.value)}
          className="flex-1 w-full p-4 rounded-2xl bg-white border border-gray-200 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-sm min-h-[60vh]"
        />
        <button
          onClick={() => setIsPreview(true)}
          className="py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition shadow-sm"
        >
          👁 预览
        </button>
      </main>

      {/* 全屏预览 */}
      {isPreview && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Markdown 预览</span>
            <button
              onClick={() => setIsPreview(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm text-gray-600"
            >
              ✕ 关闭
            </button>
          </div>
          <div
            className={`flex-1 p-6 overflow-auto ${proseStyles}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </>
  )
}
