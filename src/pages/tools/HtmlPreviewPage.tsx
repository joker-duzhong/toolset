import { useState } from 'react'

const PLACEHOLDER = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML 预览示例</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #0d99ff 0%, #0b87e0 100%);
      min-height: 100vh;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
    }
    h1 {
      color: #333;
      margin-bottom: 12px;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    button {
      background: linear-gradient(135deg, #0d99ff 0%, #0b87e0 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 16px;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>👋 Hello World</h1>
    <p>这是一个 HTML 预览示例，你可以在左侧编辑代码，右侧实时查看效果。</p>
    <button onclick="alert('Hello!')">点击我</button>
  </div>
</body>
</html>`

export function HtmlPreviewPage() {
  const [code, setCode] = useState(PLACEHOLDER)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  return (
    <main className="h-full overflow-auto flex flex-col px-4 py-4 gap-3" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* 切换 tab */}
        <div
          className="flex gap-1 p-1"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {(['edit', 'preview'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-xs font-semibold transition"
              style={{
                borderRadius: 'var(--radius-sm)',
                backgroundColor: tab === t ? 'var(--color-bg-base)' : 'transparent',
                color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {t === 'edit' ? '✏️ 编辑' : '👁 预览'}
            </button>
          ))}
        </div>

        {tab === 'edit' ? (
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="flex-1 w-full p-4 text-sm font-mono outline-none resize-none min-h-[60vh]"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            spellCheck={false}
          />
        ) : (
          <iframe
            srcDoc={code}
            className="flex-1 w-full min-h-[60vh]"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-light)',
            }}
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        )}
    </main>
  )
}
