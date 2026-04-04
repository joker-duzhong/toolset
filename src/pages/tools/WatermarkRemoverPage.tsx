import { useRef, useState, useEffect, useCallback } from 'react'
import { Upload, Download, RotateCcw, Paintbrush, Eye, EyeOff, Info, Eraser } from 'lucide-react'
import { cn } from '@/utils/cn'

// ─── 高级 Inpainting 修复算法 ─────────────────────────────────────────────────

/** 膨胀 mask，让修复区域略大于涂抹区域，避免边缘残留 */
function dilateMask(mask: Uint8Array, w: number, h: number, radius: number) {
  const out = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) { out[y * w + x] = 1; continue }
      let found = false
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius && !found; dx++) {
          const nx = x + dx, ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && mask[ny * w + nx]) {
            if (dx * dx + dy * dy <= radius * radius) found = true
          }
        }
      }
      out[y * w + x] = found ? 1 : 0
    }
  }
  return out
}

/** 计算到 mask 边界的距离图，用于优先从边缘向内修复 */
function computeDistanceField(mask: Uint8Array, w: number, h: number) {
  const dist = new Float32Array(w * h)
  dist.fill(1e9)
  // 边界像素距离 = 0（mask 且有非 mask 邻居）
  const queue: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      if (!mask[idx]) { dist[idx] = -1; continue }
      let isBorder = false
      for (let dy = -1; dy <= 1 && !isBorder; dy++) {
        for (let dx = -1; dx <= 1 && !isBorder; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = x + dx, ny = y + dy
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || !mask[ny * w + nx]) isBorder = true
        }
      }
      if (isBorder) { dist[idx] = 0; queue.push(idx) }
    }
  }
  // BFS 扩展
  let head = 0
  while (head < queue.length) {
    const idx = queue[head++]
    const x = idx % w, y = (idx - x) / w
    const d = dist[idx]
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const ni = ny * w + nx
        const nd = d + (dx !== 0 && dy !== 0 ? 1.414 : 1)
        if (nd < dist[ni]) { dist[ni] = nd; queue.push(ni) }
      }
    }
  }
  return dist
}

/** 缩小图像到 1/2 */
function downsample(data: Float64Array, w: number, h: number) {
  const nw = Math.max(1, w >> 1), nh = Math.max(1, h >> 1)
  const out = new Float64Array(nw * nh * 4)
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      let r = 0, g = 0, b = 0, a = 0, c = 0
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const sx = Math.min(x * 2 + dx, w - 1), sy = Math.min(y * 2 + dy, h - 1)
          const si = (sy * w + sx) * 4
          r += data[si]; g += data[si + 1]; b += data[si + 2]; a += data[si + 3]; c++
        }
      }
      const di = (y * nw + x) * 4
      out[di] = r / c; out[di + 1] = g / c; out[di + 2] = b / c; out[di + 3] = a / c
    }
  }
  return { data: out, w: nw, h: nh }
}

/** 缩小 mask 到 1/2（任意子像素为 mask 则保留） */
function downsampleMask(mask: Uint8Array, w: number, h: number) {
  const nw = Math.max(1, w >> 1), nh = Math.max(1, h >> 1)
  const out = new Uint8Array(nw * nh)
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      let any = false
      for (let dy = 0; dy < 2 && !any; dy++) {
        for (let dx = 0; dx < 2 && !any; dx++) {
          const sx = Math.min(x * 2 + dx, w - 1), sy = Math.min(y * 2 + dy, h - 1)
          if (mask[sy * w + sx]) any = true
        }
      }
      out[y * nw + x] = any ? 1 : 0
    }
  }
  return { mask: out, w: nw, h: nh }
}

/** 将低分辨率结果上采样到高分辨率，仅填充 mask 区域 */
function upsampleInto(low: Float64Array, lw: number, lh: number, high: Float64Array, hw: number, hh: number, mask: Uint8Array) {
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      if (!mask[y * hw + x]) continue
      // 双线性插值
      const sx = (x + 0.5) * lw / hw - 0.5
      const sy = (y + 0.5) * lh / hh - 0.5
      const x0 = Math.max(0, Math.floor(sx)), y0 = Math.max(0, Math.floor(sy))
      const x1 = Math.min(lw - 1, x0 + 1), y1 = Math.min(lh - 1, y0 + 1)
      const fx = sx - x0, fy = sy - y0
      for (let c = 0; c < 4; c++) {
        const v00 = low[(y0 * lw + x0) * 4 + c]
        const v10 = low[(y0 * lw + x1) * 4 + c]
        const v01 = low[(y1 * lw + x0) * 4 + c]
        const v11 = low[(y1 * lw + x1) * 4 + c]
        high[(y * hw + x) * 4 + c] = (1 - fx) * (1 - fy) * v00 + fx * (1 - fy) * v10 + (1 - fx) * fy * v01 + fx * fy * v11
      }
    }
  }
}

/**
 * 基于距离场优先级的迭代扩散修复
 * - 按从边缘到中心的顺序修复（onion-peel）
 * - 使用较大的自适应采样窗口
 * - 对已知像素使用高斯距离权重 + 颜色一致性权重
 */
function iterativeInpaint(
  pixels: Float64Array, mask: Uint8Array, w: number, h: number,
  passes: number, maxRadius: number,
) {
  const dist = computeDistanceField(mask, w, h)
  const filled = new Uint8Array(mask) // 0 = known, 1 = to fill

  // 收集要修复的像素，按距离排序（从边缘到中心）
  const toFill: { idx: number; d: number }[] = []
  for (let i = 0; i < w * h; i++) {
    if (filled[i]) toFill.push({ idx: i, d: dist[i] })
  }
  toFill.sort((a, b) => a.d - b.d)

  for (let pass = 0; pass < passes; pass++) {
    // 随着 pass 增加，逐渐缩小搜索半径以精细化
    const radius = Math.max(2, Math.round(maxRadius * (1 - pass / passes * 0.6)))

    for (const { idx } of toFill) {
      const x = idx % w, y = (idx - x) / w
      let rr = 0, gg = 0, bb = 0, aa = 0, wt = 0

      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy
        if (ny < 0 || ny >= h) continue
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx
          if (nx < 0 || nx >= w) continue
          if (dx === 0 && dy === 0) continue
          const ni = ny * w + nx

          // 空间距离权重（高斯）
          const d2 = dx * dx + dy * dy
          if (d2 > radius * radius) continue
          const sigma = radius * 0.5
          const spatialW = Math.exp(-d2 / (2 * sigma * sigma))

          // 对非 mask 像素赋予更高信任度
          const trustW = filled[ni] === 0 ? 4.0 : (pass > 0 ? 1.0 : 0.2)

          const w_ = spatialW * trustW
          const pi = ni * 4
          rr += pixels[pi] * w_
          gg += pixels[pi + 1] * w_
          bb += pixels[pi + 2] * w_
          aa += pixels[pi + 3] * w_
          wt += w_
        }
      }

      if (wt > 0) {
        const pi = idx * 4
        pixels[pi] = rr / wt
        pixels[pi + 1] = gg / wt
        pixels[pi + 2] = bb / wt
        pixels[pi + 3] = aa / wt
      }
    }
  }
}

/**
 * 简化的 PatchMatch 纹理传播：
 * 对 mask 区域中的每个像素，在非 mask 区域搜索最相似的 patch 并复制中心像素。
 * 仅对 mask 边界附近有效，深层区域依赖扩散。
 */
function patchTextureFill(
  pixels: Float64Array, mask: Uint8Array, w: number, h: number,
  patchR: number, searchR: number,
) {
  const result = new Float64Array(pixels)

  // 收集非 mask 像素作为候选源
  // 对每个 mask 像素，在其周围 searchR 范围搜索最佳 patch
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue

      let bestDist = Infinity
      let bestIdx = -1

      // 搜索范围
      const sy0 = Math.max(0, y - searchR), sy1 = Math.min(h - 1, y + searchR)
      const sx0 = Math.max(0, x - searchR), sx1 = Math.min(w - 1, x + searchR)

      for (let sy = sy0; sy <= sy1; sy += 2) {
        for (let sx = sx0; sx <= sx1; sx += 2) {
          if (mask[sy * w + sx]) continue

          // 比较 patch
          let dist = 0, cnt = 0
          for (let py = -patchR; py <= patchR; py++) {
            for (let px = -patchR; px <= patchR; px++) {
              const tx = x + px, ty = y + py
              const cx = sx + px, cy = sy + py
              if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue
              if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue
              if (mask[ty * w + tx]) continue // 跳过 mask 区域的比较
              const ti = (ty * w + tx) * 4, ci = (cy * w + cx) * 4
              const dr = pixels[ti] - pixels[ci]
              const dg = pixels[ti + 1] - pixels[ci + 1]
              const db = pixels[ti + 2] - pixels[ci + 2]
              dist += dr * dr + dg * dg + db * db
              cnt++
            }
          }

          if (cnt > 0) {
            dist /= cnt
            if (dist < bestDist) {
              bestDist = dist
              bestIdx = sy * w + sx
            }
          }
        }
      }

      if (bestIdx >= 0) {
        const pi = (y * w + x) * 4, bi = bestIdx * 4
        result[pi] = pixels[bi]
        result[pi + 1] = pixels[bi + 1]
        result[pi + 2] = pixels[bi + 2]
        result[pi + 3] = pixels[bi + 3]
      }
    }
  }

  // 写回
  for (let i = 0; i < pixels.length; i++) {
    if (mask[Math.floor(i / 4)] && i % 4 < 4) pixels[i] = result[i]
  }
}

/**
 * 边缘融合（Poisson 式梯度平滑）：对 mask 边界做多轮拉普拉斯平滑，
 * 消除修复区域与原图之间的色差边缘
 */
function blendBoundary(pixels: Float64Array, mask: Uint8Array, w: number, h: number, passes: number) {
  // 找到 mask 边界带（mask 边缘向外 2px + 向内 2px）
  const band = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      if (!mask[idx]) continue
      let nearBorder = false
      for (let dy = -3; dy <= 3 && !nearBorder; dy++) {
        for (let dx = -3; dx <= 3 && !nearBorder; dx++) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
          if (!mask[ny * w + nx]) nearBorder = true
        }
      }
      if (nearBorder) band[idx] = 1
    }
  }

  for (let pass = 0; pass < passes; pass++) {
    const tmp = new Float64Array(pixels)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (!band[y * w + x]) continue
        for (let c = 0; c < 3; c++) {
          const pi = (y * w + x) * 4 + c
          const avg = (
            pixels[((y - 1) * w + x) * 4 + c] +
            pixels[((y + 1) * w + x) * 4 + c] +
            pixels[(y * w + x - 1) * 4 + c] +
            pixels[(y * w + x + 1) * 4 + c]
          ) / 4
          // 混合：70% 拉普拉斯平滑 + 30% 原值
          tmp[pi] = avg * 0.7 + pixels[pi] * 0.3
        }
      }
    }
    for (let i = 0; i < pixels.length; i++) pixels[i] = tmp[i]
  }
}

/**
 * 主入口：多尺度 Inpainting
 * 1. 膨胀 mask
 * 2. 建立图像金字塔（3-4 级）
 * 3. 从最低分辨率开始扩散修复
 * 4. 上采样到上一级，用 patch matching 传播纹理
 * 5. 再做扩散精修
 * 6. 最终边界融合
 */
function advancedInpaint(imageData: ImageData, rawMask: Uint8ClampedArray): ImageData {
  const { width: W, height: H, data } = imageData

  // 转为 Uint8Array mask
  let mask = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) mask[i] = rawMask[i] ? 1 : 0

  // 膨胀 mask 2px
  mask = dilateMask(mask, W, H, 2)

  // 构建 float64 像素
  let pixels = new Float64Array(W * H * 4)
  for (let i = 0; i < data.length; i++) pixels[i] = data[i]

  // 建立金字塔
  const pyramid: { pixels: Float64Array; mask: Uint8Array; w: number; h: number }[] = []
  let cw = W, ch = H, cPixels = pixels, cMask = mask

  // 最多 4 级金字塔，但最小分辨率不低于 32
  while (pyramid.length < 4 && cw > 64 && ch > 64) {
    pyramid.push({ pixels: cPixels, mask: cMask, w: cw, h: ch })
    const dp = downsample(cPixels, cw, ch)
    const dm = downsampleMask(cMask, cw, ch)
    cw = dp.w; ch = dp.h; cPixels = dp.data; cMask = dm.mask
  }
  pyramid.push({ pixels: cPixels, mask: cMask, w: cw, h: ch })

  // 从最低分辨率开始处理
  const last = pyramid.length - 1
  {
    const lv = pyramid[last]
    // 在最低分辨率做大量迭代扩散（计算量小）
    iterativeInpaint(lv.pixels, lv.mask, lv.w, lv.h, 80, Math.max(8, Math.round(Math.min(lv.w, lv.h) * 0.15)))
  }

  // 逐级上采样 + 精修
  for (let l = last - 1; l >= 0; l--) {
    const lv = pyramid[l]
    const lower = pyramid[l + 1]

    // 将低分辨率结果上采样到当前级别（仅 mask 区域）
    upsampleInto(lower.pixels, lower.w, lower.h, lv.pixels, lv.w, lv.h, lv.mask)

    // Patch 纹理传播（对较大分辨率限制搜索范围以保证速度）
    const searchR = l === 0
      ? Math.min(30, Math.round(Math.min(lv.w, lv.h) * 0.05))
      : Math.min(40, Math.round(Math.min(lv.w, lv.h) * 0.08))
    const patchR = l === 0 ? 3 : 2
    patchTextureFill(lv.pixels, lv.mask, lv.w, lv.h, patchR, searchR)

    // 迭代扩散精修
    const passes = l === 0 ? 15 : 25
    const maxR = Math.max(3, Math.round(Math.min(lv.w, lv.h) * 0.03))
    iterativeInpaint(lv.pixels, lv.mask, lv.w, lv.h, passes, maxR)
  }

  // 边界融合
  const top = pyramid[0]
  blendBoundary(top.pixels, top.mask, top.w, top.h, 8)

  // 输出
  const out = new Uint8ClampedArray(W * H * 4)
  for (let i = 0; i < out.length; i++) out[i] = Math.max(0, Math.min(255, Math.round(top.pixels[i])))

  return new ImageData(out, W, H)
}
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'draw' | 'result'

const MAX_SIDE = 1200 // canvas 渲染最大边长，超出等比缩放以保证手机性能

export function WatermarkRemoverPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)   // 显示图片 + 涂抹预览
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)   // 存储 mask（不可见）
  const outputCanvasRef = useRef<HTMLCanvasElement>(null) // 修复后结果

  // 原始图片（全尺寸，用于最终处理）
  const origImgRef = useRef<HTMLImageElement | null>(null)
  // canvas 显示尺寸 vs 实际图片尺寸的缩放比
  const scaleRef = useRef(1)
  // img.onload 里 canvas 尚未挂载（条件渲染），用 flag 让 useEffect 在挂载后初始化
  const setupPendingRef = useRef(false)

  const [hasImage, setHasImage] = useState(false)
  const [imageKey, setImageKey] = useState(0) // 递增计数器，强制 canvas 重新初始化
  const [tab, setTab] = useState<Tab>('draw')
  const [brushSize, setBrushSize] = useState(24)
  const [processing, setProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [showMask, setShowMask] = useState(true)
  const [maskEmpty, setMaskEmpty] = useState(true)

  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  // ── 加载图片 ──────────────────────────────────────────────────────────────
  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      origImgRef.current = img
      setupPendingRef.current = true
      setResultUrl(null)
      setMaskEmpty(true)
      setTab('draw')
      setHasImage(true)
      // 递增 imageKey 确保 useEffect 重新执行（即使 hasImage/tab 未变）
      setImageKey(k => k + 1)
    }
    img.src = url
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith('image/')) loadImage(file)
    e.target.value = ''
  }

  // ── 涂抹逻辑 ─────────────────────────────────────────────────────────────
  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e && e.touches.length > 0) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: ((e as MouseEvent).clientX - rect.left) * scaleX, y: ((e as MouseEvent).clientY - rect.top) * scaleY }
  }

  const paintBrush = useCallback((x: number, y: number) => {
    const mc = maskCanvasRef.current!
    const dc = drawCanvasRef.current!
    const mctx = mc.getContext('2d')!
    const dctx = dc.getContext('2d')!
    const r = brushSize / 2

    // 写入 mask（白色半透明圆）
    mctx.globalCompositeOperation = 'source-over'
    mctx.fillStyle = 'rgba(255,255,255,1)'
    mctx.beginPath(); mctx.arc(x, y, r, 0, Math.PI * 2); mctx.fill()

    // 在显示 canvas 上叠加红色半透明高亮
    if (showMask) {
      dctx.globalCompositeOperation = 'source-over'
      dctx.fillStyle = 'rgba(239,68,68,0.40)'
      dctx.beginPath(); dctx.arc(x, y, r, 0, Math.PI * 2); dctx.fill()
    }

    setMaskEmpty(false)
  }, [brushSize, showMask])

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (processing) return
    isDrawing.current = true
    const pos = getPos(e, drawCanvasRef.current!)
    lastPoint.current = pos
    paintBrush(pos.x, pos.y)
  }

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (processing) return
    if (!isDrawing.current) return
    const pos = getPos(e, drawCanvasRef.current!)
    // 平滑插值连线
    if (lastPoint.current) {
      const dx = pos.x - lastPoint.current.x
      const dy = pos.y - lastPoint.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.max(1, Math.floor(dist / (brushSize * 0.3)))
      for (let i = 0; i <= steps; i++) {
        paintBrush(
          lastPoint.current.x + dx * (i / steps),
          lastPoint.current.y + dy * (i / steps),
        )
      }
    }
    lastPoint.current = pos
  }

  const onPointerUp = () => { isDrawing.current = false; lastPoint.current = null }

  // 用原生 addEventListener 注册 touch 事件，设置 { passive: false } 以允许 preventDefault
  useEffect(() => {
    const dc = drawCanvasRef.current
    if (!dc || !hasImage || tab !== 'draw') return

    const down = (e: TouchEvent) => onPointerDown(e)
    const move = (e: TouchEvent) => onPointerMove(e)
    const up = () => onPointerUp()

    dc.addEventListener('touchstart', down, { passive: false })
    dc.addEventListener('touchmove', move, { passive: false })
    dc.addEventListener('touchend', up)

    return () => {
      dc.removeEventListener('touchstart', down)
      dc.removeEventListener('touchmove', move)
      dc.removeEventListener('touchend', up)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasImage, tab, paintBrush, processing])

  // ── 清除涂抹 ──────────────────────────────────────────────────────────────
  const clearMask = () => {
    if (processing) return
    const mc = maskCanvasRef.current!
    const dc = drawCanvasRef.current!
    const img = origImgRef.current!
    mc.getContext('2d')!.clearRect(0, 0, mc.width, mc.height)
    const dctx = dc.getContext('2d')!
    dctx.clearRect(0, 0, dc.width, dc.height)
    dctx.drawImage(img, 0, 0, dc.width, dc.height)
    setMaskEmpty(true)
  }

  // ── canvas 初始化（React 将 canvas 挂载到 DOM 后执行）────────────────────
  useEffect(() => {
    if (!setupPendingRef.current || !origImgRef.current) return
    const dc = drawCanvasRef.current
    const mc = maskCanvasRef.current
    if (!dc || !mc) return
    setupPendingRef.current = false
    const img = origImgRef.current
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
    const dw = Math.round(img.width * scale)
    const dh = Math.round(img.height * scale)

    // 保存已有的 mask 数据（从 result tab 切回时保留涂抹）
    let prevMask: ImageData | null = null
    if (mc.width === dw && mc.height === dh && !maskEmpty) {
      prevMask = mc.getContext('2d')!.getImageData(0, 0, mc.width, mc.height)
    }

    scaleRef.current = scale
    dc.width = dw; dc.height = dh
    mc.width = dw; mc.height = dh

    // 绘制原图
    dc.getContext('2d')!.drawImage(img, 0, 0, dw, dh)

    if (prevMask) {
      // 恢复 mask 并重绘高亮
      mc.getContext('2d')!.putImageData(prevMask, 0, 0)
      if (showMask) {
        const dctx = dc.getContext('2d')!
        dctx.fillStyle = 'rgba(239,68,68,0.40)'
        for (let i = 0; i < prevMask.data.length; i += 4) {
          if (prevMask.data[i + 3] > 0) {
            const x = (i / 4) % dw
            const y = Math.floor((i / 4) / dw)
            dctx.fillRect(x, y, 1, 1)
          }
        }
      }
    } else {
      mc.getContext('2d')!.clearRect(0, 0, dw, dh)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasImage, tab, imageKey])

  // ── 切换 mask 显示 ────────────────────────────────────────────────────────
  useEffect(() => {
    // canvas 宽度为 0 说明初始化还未完成，跳过
    if (!hasImage || !origImgRef.current) return
    const dc = drawCanvasRef.current
    const mc = maskCanvasRef.current
    if (!dc || !mc || dc.width === 0) return
    const dctx = dc.getContext('2d')!
    dctx.clearRect(0, 0, dc.width, dc.height)
    dctx.drawImage(origImgRef.current, 0, 0, dc.width, dc.height)
    if (showMask) {
      dctx.globalCompositeOperation = 'source-over'
      dctx.fillStyle = 'rgba(239,68,68,0.40)'
      const mdata = mc.getContext('2d')!.getImageData(0, 0, mc.width, mc.height)
      for (let i = 0; i < mdata.data.length; i += 4) {
        if (mdata.data[i + 3] > 0) {
          const x = (i / 4) % mc.width
          const y = Math.floor((i / 4) / mc.width)
          dctx.fillRect(x, y, 1, 1)
        }
      }
      dctx.globalCompositeOperation = 'source-over'
    }
  }, [showMask, hasImage])

  // ── 执行修复 ──────────────────────────────────────────────────────────────
  const handleProcess = async () => {
    const img = origImgRef.current
    const mc = maskCanvasRef.current
    if (!img || !mc) return
    setProcessing(true)
    setProgressMsg('准备中…')

    // 用 setTimeout 让 UI 先更新
    await new Promise(r => setTimeout(r, 80))

    try {
      const fw = img.width, fh = img.height

      // 1. 在全尺寸 canvas 上绘制原图
      setProgressMsg('读取图片…')
      await new Promise(r => setTimeout(r, 30))
      const oc = outputCanvasRef.current!
      oc.width = fw; oc.height = fh
      const octx = oc.getContext('2d')!
      octx.drawImage(img, 0, 0, fw, fh)
      const imageData = octx.getImageData(0, 0, fw, fh)

      // 2. 将缩放后的 mask 用 canvas 高质量缩放到原始尺寸
      setProgressMsg('处理涂抹区域…')
      await new Promise(r => setTimeout(r, 30))

      // 利用临时 canvas 做双线性插值缩放，比逐像素取样更平滑
      const tmpCanvas = document.createElement('canvas')
      tmpCanvas.width = fw; tmpCanvas.height = fh
      const tmpCtx = tmpCanvas.getContext('2d')!
      tmpCtx.imageSmoothingEnabled = true
      tmpCtx.imageSmoothingQuality = 'high'
      tmpCtx.drawImage(mc, 0, 0, fw, fh)
      const scaledMaskData = tmpCtx.getImageData(0, 0, fw, fh)

      const maskFull = new Uint8ClampedArray(fw * fh)
      for (let i = 0; i < fw * fh; i++) {
        maskFull[i] = scaledMaskData.data[i * 4 + 3] > 80 ? 1 : 0
      }

      // 3. 执行高级多尺度 inpainting
      setProgressMsg('AI 修复中，请稍候…')
      await new Promise(r => setTimeout(r, 50))

      const fixed = advancedInpaint(imageData, maskFull)
      octx.putImageData(fixed, 0, 0)

      setProgressMsg('完成！')
      const url = oc.toDataURL('image/png')
      setResultUrl(url)
      setTab('result')
    } finally {
      setProcessing(false)
      setProgressMsg('')
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'removed-watermark.png'
    a.click()
  }

  const handleReset = () => {
    setHasImage(false)
    setResultUrl(null)
    setMaskEmpty(true)
    setTab('draw')
    origImgRef.current = null
  }

  return (
    <main className="h-full overflow-auto px-4 py-4 flex flex-col gap-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>

        {/* 说明 */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
          <Info className="size-4 flex-shrink-0 mt-0.5" />
          <p>上传图片后，用手指<strong>涂抹</strong>水印区域（红色高亮），点击「开始修复」即可。采用多尺度金字塔 + 纹理传播 + 边缘融合算法，修复效果更自然。</p>
        </div>

        {/* 上传 */}
        {!hasImage && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 h-52 rounded-2xl border-2 border-dashed border-gray-200 bg-white cursor-pointer hover:border-indigo-300 transition"
          >
            <Upload className="size-10 text-gray-300" />
            <p className="text-sm text-gray-400">点击上传图片</p>
            <p className="text-xs text-gray-300">JPG / PNG / WebP</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {hasImage && (
          <>
            {/* Tab 切换 */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {([['draw', '✏️ 涂抹区域'], ['result', '✅ 修复结果']] as const).map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  disabled={(t === 'result' && !resultUrl) || processing}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-40 ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
                  {label}
                </button>
              ))}
            </div>

            {tab === 'draw' && (
              <>
                {/* 工具栏 */}
                <div className={cn('flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm', processing && 'opacity-60 pointer-events-none')}>
                  <Paintbrush className="size-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>笔刷大小</span>
                      <span className="text-indigo-600 font-bold">{brushSize}px</span>
                    </div>
                    <input type="range" min={8} max={80} step={4} value={brushSize}
                      onChange={e => setBrushSize(+e.target.value)}
                      disabled={processing}
                      className="w-full accent-indigo-600" />
                  </div>
                  <button onClick={() => setShowMask(v => !v)} disabled={processing}
                    className={cn('flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition', showMask ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500')}>
                    {showMask ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    高亮
                  </button>
                  <button onClick={clearMask} disabled={maskEmpty || processing}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 disabled:opacity-40 active:scale-95 transition">
                    <Eraser className="size-3.5" />清除
                  </button>
                  <button onClick={() => { if (!processing) fileInputRef.current?.click() }} disabled={processing}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 disabled:opacity-40 active:scale-95 transition">
                    <Upload className="size-3.5" />换图
                  </button>
                </div>

                {/* 绘图 Canvas */}
                <div className={cn('rounded-2xl overflow-hidden border border-gray-100 shadow-sm touch-none select-none', processing && 'opacity-60 pointer-events-none')}>
                  <canvas
                    ref={drawCanvasRef}
                    className="w-full block"
                    style={{ touchAction: 'none' }}
                    onMouseDown={e => onPointerDown(e.nativeEvent)}
                    onMouseMove={e => onPointerMove(e.nativeEvent)}
                    onMouseUp={onPointerUp}
                    onMouseLeave={onPointerUp}
                  />
                </div>

                {/* 修复按钮 */}
                <button onClick={handleProcess} disabled={maskEmpty || processing}
                  className="w-full py-3 rounded-xl bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold active:scale-95 transition">
                  {processing ? '修复中，请稍候…' : '开始修复'}
                </button>

                {processing && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    {progressMsg && <p className="text-xs text-indigo-500 font-medium">{progressMsg}</p>}
                  </div>
                )}
              </>
            )}

            {tab === 'result' && resultUrl && (
              <>
                <img src={resultUrl} alt="修复结果" className="w-full rounded-2xl border border-gray-100 shadow-sm" />
                <div className="flex gap-3">
                  <button onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-95 transition">
                    <Download className="size-4" />保存图片
                  </button>
                  <button onClick={handleReset}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm active:scale-95 transition">
                    <RotateCcw className="size-4" />重新上传
                  </button>
                </div>
                <button onClick={() => { setupPendingRef.current = true; setTab('draw') }}
                  className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm active:scale-95 transition">
                  继续涂抹修复
                </button>
              </>
            )}
          </>
        )}

        {/* 隐藏的功能 canvas */}
        <canvas ref={maskCanvasRef} className="hidden" />
        <canvas ref={outputCanvasRef} className="hidden" />
    </main>
  )
}