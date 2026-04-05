// 邀请海报组件 - 包含二维码，用于扫描邀请
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface InvitePosterProps {
  inviteCode: string
  onClose: () => void
}

export function InvitePoster({ inviteCode, onClose }: InvitePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)

  // 生成二维码
  useEffect(() => {
    if (canvasRef.current && inviteCode) {
      // 构建二维码链接 - 包含邀请码参数
      const inviteUrl = `${window.location.origin}${window.location.pathname}?invite_code=${inviteCode}`

      QRCode.toCanvas(
        canvasRef.current,
        inviteUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#7c2d12', // 玫瑰红
            light: '#fef2f2',
          },
        },
        (error) => {
          if (error) console.error('二维码生成失败:', error)
        }
      )
    }
  }, [inviteCode])

  // 下载海报
  const handleDownload = () => {
    if (posterRef.current) {
      const canvas = posterRef.current.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `恰好邀请码-${inviteCode}.png`
        link.click()
      }
    }
  }

  // 复制链接
  const handleCopyLink = async () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?invite_code=${inviteCode}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      alert('邀请链接已复制到剪贴板')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          ✕
        </button>

        {/* 海报内容 */}
        <div
          ref={posterRef}
          className="bg-gradient-to-b from-rose-100 via-amber-50 to-white p-8 text-center flex flex-col items-center gap-6"
        >
          {/* 标题 */}
          <div>
            <div className="text-5xl mb-3">💕</div>
            <h2 className="text-2xl font-bold text-stone-800 mb-1">恰好</h2>
            <p className="text-stone-500 text-sm">情侣专属温馨小工具</p>
          </div>

          {/* 邀请语 */}
          <div className="space-y-2">
            <p className="text-stone-700 font-medium">扫描下方二维码</p>
            <p className="text-stone-500 text-sm">与 Ta 开启恰好之旅</p>
          </div>

          {/* 二维码 */}
          <div className="bg-white p-4 rounded-2xl shadow-lg shadow-rose-100">
            <canvas ref={canvasRef} />
          </div>

          {/* 邀请码显示 */}
          <div className="w-full">
            <p className="text-stone-500 text-xs mb-2">邀请码</p>
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-3">
              <span className="text-2xl font-mono font-bold text-rose-600 tracking-widest">
                {inviteCode}
              </span>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="w-full h-px bg-stone-200"></div>

          {/* 装饰文字 */}
          <p className="text-stone-400 text-xs leading-relaxed">
            👫 扫描即可绑定 · 开启专属的二人世界 · 一起恰好生活
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="bg-stone-50 px-8 py-4 flex gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 bg-rose-100 text-rose-600 rounded-lg font-medium hover:bg-rose-200 transition-colors active:scale-[0.98]"
          >
            复制链接
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors active:scale-[0.98]"
          >
            下载海报
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvitePoster
