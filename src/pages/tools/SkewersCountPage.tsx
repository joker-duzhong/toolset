import { useRef, useState } from 'react'
import { Upload, RotateCcw, Plus, Minus, Info } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

// ── 图像处理核心（截面斑点检测 v2）──────────────────────────────────────────
// 场景：手握签子正面拍摄截面。改进点：
//  1. 仅检测「亮斑」（正 DoG）→ 避免暗缝隙误检
//  2. 积分图 box blur → 边界精确
//  3. 局部亮度验证 → 过滤暗区（缝隙/阴影）
//  4. 聚类边界裁剪 → 过滤背景区域
const PROC_MAX = 640

function prepCanvas(img: HTMLImageElement) {
  const scale = Math.min(1, PROC_MAX / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  c.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return { c, w, h, scale }
}

/** 基于积分图的 box blur —— O(n)，边界正确 */
function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  if (radius < 1) return new Float32Array(src)
  const out = new Float32Array(w * h)
  // 构建积分图（1-indexed，上/左多一行 0 边界）
  const iw = w + 1
  const integ = new Float64Array(iw * (h + 1))
  for (let y = 0; y < h; y++) {
    let rowSum = 0
    for (let x = 0; x < w; x++) {
      rowSum += src[y * w + x]
      integ[(y + 1) * iw + (x + 1)] = rowSum + integ[y * iw + (x + 1)]
    }
  }
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius)
    const y1 = Math.min(h - 1, y + radius)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - radius)
      const x1 = Math.min(w - 1, x + radius)
      const area = (y1 - y0 + 1) * (x1 - x0 + 1)
      out[y * w + x] = (
        integ[(y1 + 1) * iw + (x1 + 1)]
        - integ[y0 * iw + (x1 + 1)]
        - integ[(y1 + 1) * iw + x0]
        + integ[y0 * iw + x0]
      ) / area
    }
  }
  return out
}

interface Blob { x: number; y: number; r: number; resp: number }

function detectBlobs(data: Uint8ClampedArray, w: number, h: number): Blob[] {
  const n = w * h

  // ① 灰度化
  const gray = new Float32Array(n)
  for (let i = 0; i < n; i++)
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]

  const minDim = Math.min(w, h)
  // 签子截面半径范围（占图像短边 2.5%~10%）
  const rMin = Math.max(3, Math.round(minDim * 0.025))
  const rMax = Math.max(rMin + 2, Math.round(minDim * 0.10))

  // ② 多尺度 DoG —— 只保留正值（亮中心暗环绕 = 签子截面）
  const resp = new Float32Array(n)
  const scaleSteps = 12
  for (let s = 0; s < scaleSteps; s++) {
    const r = rMin + Math.round(s * (rMax - rMin) / Math.max(1, scaleSteps - 1))
    const inner = Math.max(1, Math.round(r * 0.55))
    const outer = Math.max(inner + 1, Math.round(r * 1.5))
    const b1 = boxBlur(gray, w, h, inner)
    const b2 = boxBlur(gray, w, h, outer)
    for (let i = 0; i < n; i++) {
      const d = b1[i] - b2[i] // 正值 = 亮斑
      if (d > 0 && d > resp[i]) resp[i] = d
    }
  }

  // ③ 自适应阈值 — 降低以捕捉中心较暗签子
  let maxResp = 0
  for (const v of resp) if (v > maxResp) maxResp = v
  const thresh = maxResp * 0.10

  // ④ NMS — 关键改进：窗口缩小到 rMin*0.75
  //    密集排列时相邻签子中心距≈直径，旧 nmsR=rMin 会压掉邻居
  const nmsR = Math.max(3, Math.ceil(rMin * 0.75))
  const raw: Blob[] = []
  for (let y = nmsR; y < h - nmsR; y++) {
    for (let x = nmsR; x < w - nmsR; x++) {
      const v = resp[y * w + x]
      if (v < thresh) continue
      let isMax = true
      for (let dy = -nmsR; dy <= nmsR && isMax; dy++)
        for (let dx = -nmsR; dx <= nmsR && isMax; dx++) {
          if (!dx && !dy) continue
          if (resp[(y + dy) * w + (x + dx)] > v) isMax = false
        }
      if (isMax) raw.push({ x, y, r: rMin, resp: v })
    }
  }

  // ⑤ 合并距离缩小到 rMin*1.2（之前 1.7 会把紧挨的签子合掉）
  raw.sort((a, b) => b.resp - a.resp)
  const mergeD2 = (rMin * 1.2) ** 2
  const merged: Blob[] = []
  const used1 = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    if (used1[i]) continue
    merged.push(raw[i])
    for (let j = i + 1; j < raw.length; j++) {
      if (used1[j]) continue
      const dx = raw[i].x - raw[j].x, dy = raw[i].y - raw[j].y
      if (dx * dx + dy * dy < mergeD2) used1[j] = 1
    }
  }

  // ⑥ **相对对比度验证**（替代绝对亮度）
  //    检查候选点是否比周围环形区域更亮——真正签子截面一定局部更亮
  //    暗缝隙的中心亮度 < 环形均值，会被过滤掉
  const ringBlur = boxBlur(gray, w, h, Math.round(rMin * 1.8))
  const valid = merged.filter(b => {
    const idx = b.y * w + b.x
    return gray[idx] >= ringBlur[idx] * 0.90 // 很宽松：只需不是明显暗区
  })

  // ⑦ 聚类裁剪：剔除远离主体的离群检测
  if (valid.length < 5) return valid
  let cx = 0, cy = 0
  for (const b of valid) { cx += b.x; cy += b.y }
  cx /= valid.length; cy /= valid.length
  const dists = valid.map(b => Math.hypot(b.x - cx, b.y - cy))
  const dSorted = [...dists].sort((a, b) => a - b)
  const d80 = dSorted[Math.floor(dSorted.length * 0.80)]
  const maxDist = d80 * 1.7

  return valid.filter((_, i) => dists[i] <= maxDist)
}

/** 在原图上绘制检测到的斑点圆圈 */
function renderOverlay(img: HTMLImageElement, blobs: Blob[]): string {
  const { c, w, h } = prepCanvas(img)
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)

  const r = Math.max(4, Math.round(Math.min(w, h) * 0.03))

  for (const b of blobs) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(99,102,241,0.22)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(99,102,241,0.9)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 左上角数量标签
  const label = `${blobs.length} 根`
  const fs = Math.round(Math.min(w, h) * 0.06)
  ctx.font = `bold ${fs}px sans-serif`
  const tw = ctx.measureText(label).width
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(8, 8, tw + 24, fs + 16)
  ctx.fillStyle = '#fff'
  ctx.fillText(label, 20, fs + 14)

  return c.toDataURL('image/jpeg', 0.92)
}

// ── 页面组件 ──────────────────────────────────────────────────────────────────
export function SkewersCountPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const origImgRef = useRef<HTMLImageElement | null>(null)

  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [priceStr, setPriceStr] = useState('0.717')
  const [processing, setProcessing] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

  const price = parseFloat(priceStr) || 0
  const total = (count * price).toFixed(2)

  const runDetect = (img: HTMLImageElement) => {
    const { c, w, h } = prepCanvas(img)
    const ctx = c.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, w, h)
    const blobs = detectBlobs(imageData.data, w, h)
    setCount(blobs.length)
    setOverlayUrl(renderOverlay(img, blobs))
    setProcessing(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    e.target.value = ''

    const url = URL.createObjectURL(file)
    setSrcUrl(url)
    setOverlayUrl(null)
    setCount(0)
    setProcessing(true)

    const img = new Image()
    img.onload = () => {
      origImgRef.current = img
      // 让 UI 先渲染 loading 状态
      setTimeout(() => { try { runDetect(img) } catch { setProcessing(false) } }, 60)
    }
    img.src = url
  }

  const handleReset = () => {
    setSrcUrl(null); setOverlayUrl(null); setCount(0)
    origImgRef.current = null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="串串计数" subtitle="拍照识别签子截面数量" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">

        {/* 提示 */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
          <Info className="size-4 flex-shrink-0 mt-0.5" />
          <p>
            上传签子照片，算法通过<strong> DoG 斑点检测</strong>识别每根签子的圆形截面。
            <strong>正面俯握</strong>（看到截面端面）效果最佳。
            结果可用 ＋/－ 手动修正。
          </p>
        </div>

        {/* 上传区 */}
        {!srcUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 h-52 rounded-2xl border-2 border-dashed border-gray-200 bg-white cursor-pointer hover:border-indigo-300 transition"
          >
            <Upload className="size-10 text-gray-300" />
            <p className="text-sm text-gray-400">点击上传串串照片（正握看截面）</p>
            <p className="text-xs text-gray-300">JPG / PNG / WebP</p>
          </div>
        ) : (
          <>
            {/* 图片 + 检测覆盖层 */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={showOverlay && overlayUrl ? overlayUrl : srcUrl}
                alt="串串照片"
                className="w-full block"
              />
              {processing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                  <div className="size-9 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-xs font-medium">识别中…</span>
                </div>
              )}
              {overlayUrl && !processing && (
                <button
                  onClick={() => setShowOverlay(v => !v)}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-black/50 backdrop-blur text-white text-xs rounded-full active:scale-90 transition"
                >
                  {showOverlay ? '查看原图' : '查看识别'}
                </button>
              )}
            </div>

            {/* 计数器 */}
            {!processing && (
              <>
                <div className="flex flex-col items-center gap-1 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-400">识别签子数</p>
                  <div className="flex items-center gap-8 mt-2">
                    <button
                      onClick={() => setCount(c => Math.max(0, c - 1))}
                      className="flex items-center justify-center size-11 rounded-full bg-gray-100 text-gray-600 active:scale-90 transition"
                    >
                      <Minus className="size-5" />
                    </button>
                    <span className="text-6xl font-bold text-indigo-600 tabular-nums w-24 text-center">
                      {count}
                    </span>
                    <button
                      onClick={() => setCount(c => c + 1)}
                      className="flex items-center justify-center size-11 rounded-full bg-gray-100 text-gray-600 active:scale-90 transition"
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">可手动调整数量</p>
                </div>

                {/* 费用计算 */}
                <div className={cn('flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm', count === 0 && 'opacity-60')}>
                  <p className="text-xs font-semibold text-gray-600">费用估算</p>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-500 flex-shrink-0">每根单价</label>
                    <div className="flex items-center gap-1 flex-1 h-10 px-3 rounded-xl bg-gray-100">
                      <span className="text-xs text-gray-400">¥</span>
                      <input
                        type="number"
                        value={priceStr}
                        min={0}
                        step={0.5}
                        onChange={e => setPriceStr(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 rounded-xl">
                    <span className="text-sm text-gray-600">
                      {count} 根 × ¥{price.toFixed(2)}
                    </span>
                    <span className="text-2xl font-bold text-indigo-700">¥{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-100 text-gray-600 text-sm active:scale-95 transition"
                >
                  <RotateCcw className="size-4" />重新拍照
                </button>
              </>
            )}
          </>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </main>
    </div>
  )
}
