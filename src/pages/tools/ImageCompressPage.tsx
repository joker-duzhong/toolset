import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Upload, Download, RotateCcw, Info } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

type Mode = 'quality' | 'size'
type OutputFormat = 'original' | 'image/jpeg' | 'image/webp' | 'image/png'

const FORMAT_OPTS: { value: OutputFormat; label: string }[] = [
  { value: 'original', label: '原格式' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/png', label: 'PNG' },
]

export function ImageCompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFile, setResultFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('quality')
  const [quality, setQuality] = useState(80)
  const [maxSizeMB, setMaxSizeMB] = useState(0.5)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original')
  const [progress, setProgress] = useState(0)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setSrcUrl(URL.createObjectURL(f))
    setResultUrl(null)
    setResultFile(null)
    setProgress(0)
  }

  const handleCompress = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    const fileType = outputFormat === 'original' ? file.type : outputFormat
    const options = {
      useWebWorker: true,
      fileType,
      alwaysKeepResolution: true,
      onProgress: (p: number) => setProgress(p),
      ...(mode === 'quality'
        ? { initialQuality: quality / 100, maxSizeMB: 100 }
        : { maxSizeMB, initialQuality: 1 }),
    }
    try {
      const compressed = await imageCompression(file, options)
      setResultUrl(URL.createObjectURL(compressed))
      setResultFile(compressed)
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultUrl || !resultFile) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = resultFile.name
    a.click()
  }

  const handleReset = () => {
    setFile(null); setSrcUrl(null); setResultUrl(null); setResultFile(null); setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const ratio = file && resultFile ? Math.round((1 - resultFile.size / file.size) * 100) : 0
  const isPng = file?.type === 'image/png'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="图片压缩" subtitle="JPG / PNG / WebP" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">

        {isPng && outputFormat !== 'image/webp' && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
            <Info className="size-4 flex-shrink-0 mt-0.5" />
            <p>PNG 浏览器端优化有限，建议输出格式选 <strong>WebP</strong> 可获得接近 TinyPNG 的压缩效果。真正无损 PNG 量化（pngquant）需服务端支持。</p>
          </div>
        )}

        <div
          onClick={() => !srcUrl && fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 h-44 rounded-2xl border-2 border-dashed transition',
            srcUrl ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white cursor-pointer hover:border-indigo-300',
          )}
        >
          {srcUrl ? (
            <img src={srcUrl} className="max-h-36 max-w-full rounded-xl object-contain" alt="原图" />
          ) : (
            <>
              <Upload className="size-8 text-gray-300" />
              <p className="text-sm text-gray-400">点击上传图片</p>
              <p className="text-xs text-gray-300">JPG / PNG / WebP / BMP</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {file && (
          <>
            <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500">输出格式</p>
              <div className="flex gap-2 flex-wrap">
                {FORMAT_OPTS.map(f => (
                  <button key={f.value} onClick={() => setOutputFormat(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold transition',
                      outputFormat === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500',
                    )}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {([['quality', '质量优先'], ['size', '体积优先']] as [Mode, string][]).map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'quality' ? (
                <>
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>质量</span><span className="text-indigo-600 font-bold">{quality}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={5} value={quality}
                    onChange={e => setQuality(+e.target.value)} className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>最小体积</span><span>最佳质量</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>目标体积上限</span><span className="text-indigo-600 font-bold">{maxSizeMB} MB</span>
                  </div>
                  <input type="range" min={0.05} max={5} step={0.05} value={maxSizeMB}
                    onChange={e => setMaxSizeMB(+e.target.value)} className="w-full accent-indigo-600" />
                  <p className="text-[10px] text-gray-400">库会自动迭代压缩直到满足目标大小</p>
                </>
              )}
            </div>

            {processing ? (
              <div className="flex flex-col gap-2">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-center text-gray-400">压缩中 {progress}%…</p>
              </div>
            ) : (
              !resultUrl && (
                <button onClick={handleCompress}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition">
                  开始压缩
                </button>
              )
            )}
          </>
        )}

        {resultUrl && resultFile && file && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 text-center">
              <div className="flex-1 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400">原始大小</p>
                <p className="text-sm font-bold text-gray-700 mt-0.5">{formatBytes(file.size)}</p>
              </div>
              <div className="flex-1 p-3 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                <p className="text-xs text-emerald-600">压缩后</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatBytes(resultFile.size)}</p>
              </div>
              <div className={cn('flex-1 p-3 rounded-xl border shadow-sm', ratio > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100')}>
                <p className={cn('text-xs', ratio > 0 ? 'text-indigo-500' : 'text-amber-500')}>压缩率</p>
                <p className={cn('text-sm font-bold mt-0.5', ratio > 0 ? 'text-indigo-700' : 'text-amber-700')}>
                  {ratio > 0 ? `-${ratio}%` : `+${Math.abs(ratio)}%`}
                </p>
              </div>
            </div>

            {ratio <= 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                ⚠️ 压缩后体积反而增大，建议换用 JPG 或 WebP 输出格式
              </p>
            )}

            <img src={resultUrl} alt="压缩结果" className="w-full rounded-2xl border border-gray-100 shadow-sm" />

            <div className="flex gap-3">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition">
                <Download className="size-4" />保存
              </button>
              <button onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm active:scale-95 transition">
                <RotateCcw className="size-4" />重新上传
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}