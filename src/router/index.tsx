import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { ToolPage } from '@/components/ToolPage'
import { ProtectedToolWrapper } from '@/components/ProtectedToolWrapper'
import { HomePage } from '@/pages/HomePage'

// 懒加载工具页面（处理 named exports）
const WatermarkRemoverPage = lazy(() =>
  import('@/pages/tools/WatermarkRemoverPage').then((m) => ({ default: m.WatermarkRemoverPage }))
)
const ImageCompressPage = lazy(() =>
  import('@/pages/tools/ImageCompressPage').then((m) => ({ default: m.ImageCompressPage }))
)
const ImageConvertPage = lazy(() =>
  import('@/pages/tools/ImageConvertPage').then((m) => ({ default: m.ImageConvertPage }))
)
const BgRemoverPage = lazy(() =>
  import('@/pages/tools/BgRemoverPage').then((m) => ({ default: m.BgRemoverPage }))
)
const TextDiffPage = lazy(() =>
  import('@/pages/tools/TextDiffPage').then((m) => ({ default: m.TextDiffPage }))
)
const WordCountPage = lazy(() =>
  import('@/pages/tools/WordCountPage').then((m) => ({ default: m.WordCountPage }))
)
const CaseConverterPage = lazy(() =>
  import('@/pages/tools/CaseConverterPage').then((m) => ({ default: m.CaseConverterPage }))
)
const JsonFormatPage = lazy(() =>
  import('@/pages/tools/JsonFormatPage').then((m) => ({ default: m.JsonFormatPage }))
)
const MarkdownPreviewPage = lazy(() =>
  import('@/pages/tools/MarkdownPreviewPage').then((m) => ({ default: m.MarkdownPreviewPage }))
)
const HtmlPreviewPage = lazy(() =>
  import('@/pages/tools/HtmlPreviewPage').then((m) => ({ default: m.HtmlPreviewPage }))
)
const Base64Page = lazy(() =>
  import('@/pages/tools/Base64Page').then((m) => ({ default: m.Base64Page }))
)
const UrlEncodePage = lazy(() =>
  import('@/pages/tools/UrlEncodePage').then((m) => ({ default: m.UrlEncodePage }))
)
const QrCodePage = lazy(() =>
  import('@/pages/tools/QrCodePage').then((m) => ({ default: m.QrCodePage }))
)
const BmiPage = lazy(() =>
  import('@/pages/tools/BmiPage').then((m) => ({ default: m.BmiPage }))
)
const AgeCalcPage = lazy(() =>
  import('@/pages/tools/AgeCalcPage').then((m) => ({ default: m.AgeCalcPage }))
)
const SkewersCountPage = lazy(() =>
  import('@/pages/tools/SkewersCountPage').then((m) => ({ default: m.SkewersCountPage }))
)
const ColorPickerPage = lazy(() =>
  import('@/pages/tools/ColorPickerPage').then((m) => ({ default: m.ColorPickerPage }))
)
const RegexTestPage = lazy(() =>
  import('@/pages/tools/RegexTestPage').then((m) => ({ default: m.RegexTestPage }))
)
const TimestampPage = lazy(() =>
  import('@/pages/tools/TimestampPage').then((m) => ({ default: m.TimestampPage }))
)
const MovieTVPage = lazy(() =>
  import('@/pages/tools/MovieTV').then((m) => ({ default: m.MovieTVPage }))
)
const TradeCopilotPage = lazy(() =>
  import('@/pages/tools/TradeCopilot').then((m) => ({ default: m.TradeCopilotPage }))
)
const JustRightPage = lazy(() =>
  import('@/pages/tools/JustRight').then((m) => ({ default: m.JustRightPage }))
)
const NestTalkPage = lazy(() =>
  import('@/pages/tools/NestTalk').then((m) => ({ default: m.NestTalkPage }))
)
const ZaiwenGaokaoPage = lazy(() =>
  import('@/pages/tools/zaiwen_gaokao').then((m) => ({ default: m.ZaiwenGaokaoPage }))
)

// 页面加载占位
function PageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// 工具页面包装器 - 自动处理标题和导航栏
function ToolWrapper({
  children,
  fullscreen = false,
}: {
  children: React.ReactNode
  fullscreen?: boolean
}) {
  return (
    <ToolPage fullscreen={fullscreen}>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </ToolPage>
  )
}

export function AppRouter() {
  const { status } = useAuth()

  if (status === 'checking') {
    return <AuthLoadingScreen />
  }

  return (
    <BrowserRouter>
      <div className="h-full">
        <Routes>
        {/* 首页 */}
        <Route path="/" element={<HomePage />} />

        {/* ── 图片处理 ────────────────────── */}
        <Route
          path="/tools/watermark-remover"
          element={<ToolWrapper><WatermarkRemoverPage /></ToolWrapper>}
        />
        <Route
          path="/tools/image-compress"
          element={<ToolWrapper><ImageCompressPage /></ToolWrapper>}
        />
        <Route
          path="/tools/image-convert"
          element={<ToolWrapper><ImageConvertPage /></ToolWrapper>}
        />
        <Route
          path="/tools/bg-remover"
          element={<ToolWrapper><BgRemoverPage /></ToolWrapper>}
        />

        {/* ── 文本处理 ────────────────────── */}
        <Route
          path="/tools/text-diff"
          element={<ToolWrapper><TextDiffPage /></ToolWrapper>}
        />
        <Route
          path="/tools/word-count"
          element={<ToolWrapper><WordCountPage /></ToolWrapper>}
        />
        <Route
          path="/tools/case-converter"
          element={<ToolWrapper><CaseConverterPage /></ToolWrapper>}
        />

        {/* ── 格式转换 ────────────────────── */}
        <Route
          path="/tools/json-format"
          element={<ToolWrapper><JsonFormatPage /></ToolWrapper>}
        />
        <Route
          path="/tools/markdown-preview"
          element={<ToolWrapper><MarkdownPreviewPage /></ToolWrapper>}
        />
        <Route
          path="/tools/html-preview"
          element={<ToolWrapper><HtmlPreviewPage /></ToolWrapper>}
        />

        {/* ── 编解码 ──────────────────────── */}
        <Route
          path="/tools/base64"
          element={<ToolWrapper><Base64Page /></ToolWrapper>}
        />
        <Route
          path="/tools/url-encode"
          element={<ToolWrapper><UrlEncodePage /></ToolWrapper>}
        />
        <Route
          path="/tools/qrcode"
          element={<ToolWrapper><QrCodePage /></ToolWrapper>}
        />

        {/* ── 生活实用 ────────────────────── */}
        <Route
          path="/tools/bmi"
          element={<ToolWrapper><BmiPage /></ToolWrapper>}
        />
        <Route
          path="/tools/age-calc"
          element={<ToolWrapper><AgeCalcPage /></ToolWrapper>}
        />
        <Route
          path="/tools/skewers-count"
          element={<ToolWrapper><SkewersCountPage /></ToolWrapper>}
        />

        {/* ── 开发工具 ────────────────────── */}
        <Route
          path="/tools/color-picker"
          element={<ToolWrapper><ColorPickerPage /></ToolWrapper>}
        />
        <Route
          path="/tools/regex-test"
          element={<ToolWrapper><RegexTestPage /></ToolWrapper>}
        />
        <Route
          path="/tools/timestamp"
          element={<ToolWrapper><TimestampPage /></ToolWrapper>}
        />

        {/* ── 影音娱乐 ────────────────────── */}
        <Route
          path="/tools/movie-tv"
          element={<ToolWrapper><MovieTVPage /></ToolWrapper>}
        />

        {/* ── 金融理财 ────────────────────── */}
        <Route
          path="/tools/trade-copilot"
          element={
            <ProtectedToolWrapper requiresAuth>
              <ToolWrapper><TradeCopilotPage /></ToolWrapper>
            </ProtectedToolWrapper>
          }
        />

        {/* ── 情侣互动 ────────────────────── */}
        <Route
          path="/tools/justright"
          element={
            <ProtectedToolWrapper requiresAuth>
              <ToolWrapper fullscreen><JustRightPage /></ToolWrapper>
            </ProtectedToolWrapper>
          }
        />

        <Route
          path="/tools/nesttalk"
          element={
            <ToolWrapper fullscreen>
              <NestTalkPage />
            </ToolWrapper>
          }
        />

        <Route
          path="/tools/zaiwen-gaokao"
          element={
            <ProtectedToolWrapper requiresAuth>
              <ToolWrapper fullscreen>
                <ZaiwenGaokaoPage />
              </ToolWrapper>
            </ProtectedToolWrapper>
          }
        />

        {/* 兜底重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
