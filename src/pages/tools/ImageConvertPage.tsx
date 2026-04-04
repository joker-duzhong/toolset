import { useRef, useState } from 'react'
import { Upload, Download, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'

type Format = 'image/jpeg' | 'image/png' | 'image/webp'
const FORMATS: { value: Format; label: string; ext: string }[] = [
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
]

export function ImageConvertPage() {
  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<Format>('image/webp')
  const [baseName, setBaseName] = useState('image')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBaseName(file.name.replace(/\.[^.]+$/, ''))
    setSrcUrl(URL.createObjectURL(file))
    setResultUrl(null)
  }

  const handleConvert = () => {
    const img = imgRef.current
    if (!img) return
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    setResultUrl(canvas.toDataURL(targetFormat, 0.92))
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const ext = FORMATS.find((f) => f.value === targetFormat)!.ext
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${baseName}.${ext}`
    a.click()
  }

  return (
    <main className="h-full overflow-auto px-4 py-5 flex flex-col gap-4 bg-gray-50">
        <div
          onClick={() => !srcUrl && fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 h-44 rounded-2xl border-2 border-dashed transition',
            srcUrl ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white cursor-pointer hover:border-indigo-300',
          )}
        >
          {srcUrl ? (
            <img ref={imgRef} src={srcUrl} className="max-h-36 max-w-full rounded-xl object-contain" alt="原图" crossOrigin="anonymous" />
          ) : (
            <>
              <Upload className="size-8 text-gray-300" />
              <p className="text-sm text-gray-400">点击上传图片</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {srcUrl && (
          <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">转换为</p>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setTargetFormat(f.value); setResultUrl(null) }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-bold transition',
                    targetFormat === f.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {srcUrl && !resultUrl && (
          <button onClick={handleConvert} className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition">
            开始转换
          </button>
        )}

        {resultUrl && (
          <div className="flex flex-col gap-3">
            <img src={resultUrl} alt="转换结果" className="w-full rounded-2xl border border-gray-100 shadow-sm" />
            <div className="flex gap-3">
              <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition">
                <Download className="size-4" />保存 {FORMATS.find(f=>f.value===targetFormat)!.label}
              </button>
              <button onClick={() => { setSrcUrl(null); setResultUrl(null); if(fileInputRef.current) fileInputRef.current.value='' }} className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm active:scale-95 transition">
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>
        )}
    </main>
  )
}
