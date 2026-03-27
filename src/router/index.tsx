import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { WatermarkRemoverPage } from '@/pages/tools/WatermarkRemoverPage'
import { ImageCompressPage } from '@/pages/tools/ImageCompressPage'
import { ImageConvertPage } from '@/pages/tools/ImageConvertPage'
import { BgRemoverPage } from '@/pages/tools/BgRemoverPage'
import { TextDiffPage } from '@/pages/tools/TextDiffPage'
import { WordCountPage } from '@/pages/tools/WordCountPage'
import { CaseConverterPage } from '@/pages/tools/CaseConverterPage'
import { JsonFormatPage } from '@/pages/tools/JsonFormatPage'
import { MarkdownPreviewPage } from '@/pages/tools/MarkdownPreviewPage'
import { HtmlPreviewPage } from '@/pages/tools/HtmlPreviewPage'
import { Base64Page } from '@/pages/tools/Base64Page'
import { UrlEncodePage } from '@/pages/tools/UrlEncodePage'
import { QrCodePage } from '@/pages/tools/QrCodePage'
import { BmiPage } from '@/pages/tools/BmiPage'
import { AgeCalcPage } from '@/pages/tools/AgeCalcPage'
import { SkewersCountPage } from '@/pages/tools/SkewersCountPage'
import { ColorPickerPage } from '@/pages/tools/ColorPickerPage'
import { RegexTestPage } from '@/pages/tools/RegexTestPage'
import { TimestampPage } from '@/pages/tools/TimestampPage'
import { MovieTVPage } from '@/pages/tools/MovieTV'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首页 */}
        <Route path="/" element={<HomePage />} />

        {/* ── 图片处理 ────────────────────── */}
        <Route path="/tools/watermark-remover" element={<WatermarkRemoverPage />} />
        <Route path="/tools/image-compress" element={<ImageCompressPage />} />
        <Route path="/tools/image-convert" element={<ImageConvertPage />} />
        <Route path="/tools/bg-remover" element={<BgRemoverPage />} />

        {/* ── 文本处理 ────────────────────── */}
        <Route path="/tools/text-diff" element={<TextDiffPage />} />
        <Route path="/tools/word-count" element={<WordCountPage />} />
        <Route path="/tools/case-converter" element={<CaseConverterPage />} />

        {/* ── 格式转换 ────────────────────── */}
        <Route path="/tools/json-format" element={<JsonFormatPage />} />
        <Route path="/tools/markdown-preview" element={<MarkdownPreviewPage />} />
        <Route path="/tools/html-preview" element={<HtmlPreviewPage />} />

        {/* ── 编解码 ──────────────────────── */}
        <Route path="/tools/base64" element={<Base64Page />} />
        <Route path="/tools/url-encode" element={<UrlEncodePage />} />
        <Route path="/tools/qrcode" element={<QrCodePage />} />

        {/* ── 生活实用 ────────────────────── */}
        <Route path="/tools/bmi" element={<BmiPage />} />
        <Route path="/tools/age-calc" element={<AgeCalcPage />} />
        <Route path="/tools/skewers-count" element={<SkewersCountPage />} />

        {/* ── 开发工具 ────────────────────── */}
        <Route path="/tools/color-picker" element={<ColorPickerPage />} />
        <Route path="/tools/regex-test" element={<RegexTestPage />} />
        <Route path="/tools/timestamp" element={<TimestampPage />} />

        {/* ── 影音娱乐 ────────────────────── */}
        <Route path="/tools/movie-tv" element={<MovieTVPage />} />

        {/* 兜底重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
