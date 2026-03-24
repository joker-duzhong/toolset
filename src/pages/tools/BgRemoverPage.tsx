import { useRef, useState, useCallback } from 'react'
import { removeBackground } from '@imgly/background-removal'
import { Upload, Download, RotateCcw, Info, Eye, EyeOff, ImageDown } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

type Tab = 'original' | 'result'

export function BgRemoverPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [tab, setTab] = useState<Tab>('original')
  const [showCheckerboard, setShowCheckerboard] = useState(true)
  const [fileName, setFileName] = useState('')

  // ── 上传图片 ──────────────────────────────────────────────────────────────
  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setSrcUrl(URL.createObjectURL(f))
    setFileName(f.name.replace(/\.[^.]+$/, ''))
    setResultUrl(null)
    setProgress('')
    setTab('original')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('image/')) return
    setSrcUrl(URL.createObjectURL(f))
    setFileName(f.name.replace(/\.[^.]+$/, ''))
    setResultUrl(null)
    setProgress('')
    setTab('original')
  }, [])

  // ── 去背景 ────────────────────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!srcUrl) return
    setProcessing(true)
    setProgress('正在加载 AI 模型…')

    try {
      const blob = await removeBackground(srcUrl, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100)
            if (key.includes('fetch')) {
              setProgress(`下载模型… ${pct}%`)
            } else if (key.includes('inference') || key.includes('compute')) {
              setProgress(`AI 推理中… ${pct}%`)
            } else {
              setProgress(`处理中… ${pct}%`)
            }
          }
        },
      })

      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setTab('result')
    } catch (err) {
      console.error('Background removal failed:', err)
      setProgress('处理失败，请重试')
      setTimeout(() => setProgress(''), 2000)
    } finally {
      setProcessing(false)
    }
  }

  // ── 下载 ──────────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${fileName || 'image'}-nobg.png`
    a.click()
  }

  // ── 重置 ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSrcUrl(null)
    setResultUrl(null)
    setProcessing(false)
    setProgress('')
    setTab('original')
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="抠图 / 去背景" subtitle="AI 驱动 · 一键透明" />
      <main className="flex-1 px-4 py-4 flex flex-col gap-4">

        {/* 说明 */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
          <Info className="size-4 flex-shrink-0 mt-0.5" />
          <p>
            基于 AI 模型在浏览器本地运行，<strong>图片不会上传到任何服务器</strong>。
            首次使用需下载约 40MB 模型（之后会缓存），处理速度取决于图片大小和设备性能。
          </p>
        </div>

        {/* 上传区域 */}
        {!srcUrl && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-2 h-52 rounded-2xl border-2 border-dashed border-gray-200 bg-white cursor-pointer hover:border-indigo-300 transition"
          >
            <Upload className="size-10 text-gray-300" />
            <p className="text-sm text-gray-400">点击或拖拽上传图片</p>
            <p className="text-xs text-gray-300">JPG / PNG / WebP</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {srcUrl && (
          <>
            {/* Tab 切换 */}
            {resultUrl && (
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {([['original', '🖼️ 原图'], ['result', '✅ 去背景']] as const).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-semibold transition',
                      tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* 原图预览 */}
            {tab === 'original' && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img src={srcUrl} alt="原图" className="w-full block" />
              </div>
            )}

            {/* 结果预览 */}
            {tab === 'result' && resultUrl && (
              <>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowCheckerboard(v => !v)}
                    className={cn(
                      'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition',
                      showCheckerboard ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {showCheckerboard ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    透明网格
                  </button>
                </div>
                <div
                  className={cn(
                    'rounded-2xl overflow-hidden border border-gray-100 shadow-sm',
                    showCheckerboard && 'checkerboard-bg',
                  )}
                >
                  <img src={resultUrl} alt="去背景结果" className="w-full block" />
                </div>

                {/* 样式：棋盘格背景 */}
                <style>{`
                  .checkerboard-bg {
                    background-image:
                      linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                      linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                      linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
                  }
                `}</style>
              </>
            )}

            {/* 处理进度 */}
            {processing && (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">{progress || '处理中…'}</p>
              </div>
            )}

            {/* 操作按钮 */}
            {!resultUrl && !processing && (
              <button
                onClick={handleRemove}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <ImageDown className="size-4" />
                一键去背景
              </button>
            )}

            {resultUrl && (
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition"
                >
                  <Download className="size-4" />保存透明 PNG
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm active:scale-95 transition"
                >
                  <RotateCcw className="size-4" />重新上传
                </button>
              </div>
            )}

            {/* 重新上传（处理中不显示） */}
            {!resultUrl && !processing && (
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm active:scale-95 transition"
              >
                重新选择图片
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}
