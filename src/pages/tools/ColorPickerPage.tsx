import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

// ── 转换工具函数 ──────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

export function ColorPickerPage() {
  const [hex, setHex] = useState('#0d99ff')
  const [copied, setCopied] = useState<string | null>(null)

  const rgb = hexToRgb(hex) ?? [13, 153, 255]
  const hsl = rgbToHsl(...rgb)

  const copy = useCallback((label: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label); setTimeout(() => setCopied(null), 1800)
    })
  }, [])

  const handleHexInput = (val: string) => {
    const v = val.startsWith('#') ? val : '#' + val
    setHex(v)
  }

  const handleRgbChange = (idx: number, val: string) => {
    const n = Math.max(0, Math.min(255, parseInt(val) || 0))
    const next: [number, number, number] = [...rgb] as [number, number, number]
    next[idx] = n
    setHex(rgbToHex(...next))
  }

  const handleHslChange = (idx: number, val: string) => {
    const limits = [360, 100, 100]
    const n = Math.max(0, Math.min(limits[idx], parseInt(val) || 0))
    const next: [number, number, number] = [...hsl] as [number, number, number]
    next[idx] = n
    setHex(rgbToHex(...hslToRgb(...next)))
  }

  const values = [
    { label: 'HEX', text: hex },
    { label: 'RGB', text: `rgb(${rgb.join(', ')})` },
    { label: 'HSL', text: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <PageHeader title="颜色工具" subtitle="HEX / RGB / HSL 互转" />
      <main className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* 色块预览 */}
        <div
          className="h-28 transition-all"
          style={{
            background: hex,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />

        {/* 原生颜色选择器 */}
        <div
          className="flex items-center gap-3 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <label
            className="text-xs font-medium shrink-0"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            取色盘
          </label>
          <input
            type="color"
            value={hex}
            onChange={e => setHex(e.target.value)}
            className="w-full h-10 cursor-pointer border-0 bg-transparent"
            style={{ borderRadius: 'var(--radius-md)' }}
          />
        </div>

        {/* HEX 输入 */}
        <div
          className="flex flex-col gap-1 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            HEX
          </label>
          <input
            value={hex}
            onChange={e => handleHexInput(e.target.value)}
            className="h-10 px-3 text-sm font-mono outline-none"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
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

        {/* RGB 输入 */}
        <div
          className="flex flex-col gap-2 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            RGB
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['R', 'G', 'B'].map((ch, i) => (
              <div key={ch} className="flex flex-col gap-1">
                <span
                  className="text-[10px] text-center"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {ch}
                </span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[i]}
                  onChange={e => handleRgbChange(i, e.target.value)}
                  className="h-9 px-2 text-sm text-center font-mono outline-none"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
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
            ))}
          </div>
        </div>

        {/* HSL 输入 */}
        <div
          className="flex flex-col gap-2 p-4"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            HSL
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[['H', 360], ['S', 100], ['L', 100]].map(([ch, max], i) => (
              <div key={ch} className="flex flex-col gap-1">
                <span
                  className="text-[10px] text-center"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {ch}
                </span>
                <input
                  type="number"
                  min={0}
                  max={max as number}
                  value={hsl[i]}
                  onChange={e => handleHslChange(i, e.target.value)}
                  className="h-9 px-2 text-sm text-center font-mono outline-none"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
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
            ))}
          </div>
        </div>

        {/* 一键复制 */}
        <div className="flex flex-col gap-2">
          {values.map(({ label, text }) => (
            <button
              key={label}
              onClick={() => copy(label, text)}
              className="flex items-center justify-between px-4 py-3 text-sm font-mono transition active:scale-95"
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-light)',
                backgroundColor: copied === label ? 'var(--color-primary-light)' : 'var(--color-bg-base)',
                color: copied === label ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
            >
              <span
                className="text-xs font-bold w-10"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {label}
              </span>
              <span className="flex-1 text-center">{text}</span>
              {copied === label ? (
                <Check className="size-4" style={{ color: 'var(--color-primary)' }} />
              ) : (
                <Copy className="size-4" style={{ color: 'var(--color-text-tertiary)' }} />
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
