import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

const COLORS = ['#212121', '#0d99ff', '#8b5cf6', '#ec4899', '#f97316', '#795548']

export function QrCodePage() {
  const [text, setText] = useState('https://example.com')
  const [color, setColor] = useState('#212121')
  const [size, setSize] = useState(256)
  const [dataUrl, setDataUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!text.trim()) { setDataUrl(''); return }
    QRCode.toCanvas(canvasRef.current!, text, {
      width: size,
      color: { dark: color, light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(() => {
      setDataUrl(canvasRef.current!.toDataURL('image/png'))
    }).catch(() => setDataUrl(''))
  }, [text, color, size])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="二维码生成" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            内容（文字 / 链接）
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className="w-full p-3 text-sm outline-none resize-none"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 2px var(--color-primary)'
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div
          className="flex flex-col gap-3 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <div>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              颜色
            </p>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    backgroundColor: c,
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === c ? '0 0 0 2px var(--color-primary)' : 'none',
                  }}
                  className="size-8 transition rounded-full"
                />
              ))}
            </div>
          </div>
          <div>
            <div
              className="flex justify-between text-xs font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span>尺寸</span>
              <span style={{ color: 'var(--color-primary)' }}>{size}px</span>
            </div>
            <input
              type="range"
              min={128}
              max={512}
              step={64}
              value={size}
              onChange={e => setSize(+e.target.value)}
              className="w-full"
              style={{ accentColor: 'var(--color-primary)' }}
            />
          </div>
        </div>

        {/* 预览 canvas */}
        <div
          className="flex flex-col items-center gap-3 p-5"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <canvas ref={canvasRef} className="max-w-full" style={{ borderRadius: 'var(--radius-md)' }} />
          {!text.trim() && (
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              请输入内容
            </p>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={!dataUrl}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold active:scale-95 transition disabled:active:scale-100"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: !dataUrl ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          <Download className="size-4" />
          保存二维码
        </button>
      </main>
    </div>
  )
}
