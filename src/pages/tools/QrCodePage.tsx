import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

const COLORS = ['#000000', '#1d4ed8', '#7c3aed', '#be185d', '#065f46', '#92400e']

export function QrCodePage() {
  const [text, setText] = useState('https://example.com')
  const [color, setColor] = useState('#000000')
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="二维码生成" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">内容（文字 / 链接）</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
            className="w-full p-3 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        </div>

        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">颜色</p>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ background: c }}
                  className={`size-8 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : ''}`} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
              <span>尺寸</span><span className="text-indigo-600 font-bold">{size}px</span>
            </div>
            <input type="range" min={128} max={512} step={64} value={size} onChange={e => setSize(+e.target.value)}
              className="w-full accent-indigo-600" />
          </div>
        </div>

        {/* 预览 canvas */}
        <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <canvas ref={canvasRef} className="rounded-xl max-w-full" />
          {!text.trim() && <p className="text-sm text-gray-400">请输入内容</p>}
        </div>

        <button onClick={handleDownload} disabled={!dataUrl}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition">
          <Download className="size-4" />保存二维码
        </button>
      </main>
    </div>
  )
}
