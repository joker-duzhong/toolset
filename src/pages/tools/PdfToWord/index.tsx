import { useState, useCallback } from 'react'
import { FileUp, Key, Download, RotateCcw, AlertCircle, CheckCircle2, Loader2, FileText, HelpCircle } from 'lucide-react'
import { usePdfConverter } from './hooks/usePdfConverter'
import type { MathpixConfig } from './types'

// 进度条组件
function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// 公式预览卡片
function FormulaCard({ formula, index }: { formula: { latex: string; pageIndex: number }; index: number }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
          第 {formula.pageIndex} 页
        </span>
        <span className="text-xs text-gray-500">公式 {index + 1}</span>
      </div>
      <div className="font-mono text-sm bg-gray-50 p-2 rounded overflow-x-auto">
        {formula.latex}
      </div>
    </div>
  )
}

export function PdfToWordPage() {
  const [apiKey, setApiKey] = useState('')
  const [appId, setAppId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const { progress, pages, convert, reset } = usePdfConverter()

  // 处理文件选择
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      reset()
    }
  }, [reset])

  // 开始转换
  const handleConvert = useCallback(async () => {
    if (!file) return
    if (!appId.trim() || !apiKey.trim()) {
      alert('请输入 Mathpix API ID 和 Key')
      return
    }

    const config: MathpixConfig = {
      appId: appId.trim(),
      appKey: apiKey.trim(),
    }

    await convert(file, config)
  }, [file, appId, apiKey, convert])

  // 重置
  const handleReset = useCallback(() => {
    setFile(null)
    reset()
  }, [reset])

  const isConverting = ['uploading', 'converting', 'generating'].includes(progress.status)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">PDF 公式提取</h1>
        <p className="text-gray-600">
          上传 PDF 文件，自动识别数学公式并导出为可编辑的 Word 文档
        </p>
      </div>

      {/* API Key 输入区 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800">Mathpix API 配置</span>
          <a
            href="https://mathpix.com/docs/oauth/registration"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-amber-600 hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            如何获取?
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="App ID"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            disabled={isConverting}
            className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
          />
          <input
            type="password"
            placeholder="App Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isConverting}
            className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* 文件上传区 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">上传 PDF 文件</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isConverting}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            {file ? (
              <div className="text-gray-700">
                <FileText className="w-5 h-5 inline mr-2" />
                {file.name}
              </div>
            ) : (
              <div className="text-gray-500">
                点击选择或拖拽 PDF 文件到这里
              </div>
            )}
          </label>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handleConvert}
          disabled={!file || isConverting || !appId || !apiKey}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              转换中...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              开始转换
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={isConverting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          重置
        </button>
      </div>

      {/* 进度显示 */}
      {progress.status !== 'idle' && (
        <div className="mb-8">
          {/* 状态提示 */}
          <div className={`p-4 rounded-lg mb-4 ${
            progress.status === 'done' ? 'bg-green-50 border border-green-200' :
            progress.status === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {progress.status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {progress.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {isConverting && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              <span className={
                progress.status === 'done' ? 'text-green-700' :
                progress.status === 'error' ? 'text-red-700' :
                'text-blue-700'
              }>
                {progress.message}
              </span>
            </div>
          </div>

          {/* 进度条 */}
          {isConverting && progress.totalPages > 0 && (
            <ProgressBar
              current={progress.currentPage}
              total={progress.totalPages}
              label={progress.status === 'uploading' ? '解析 PDF' : '识别公式'}
            />
          )}

          {/* 页面预览 */}
          {pages.length > 0 && progress.status === 'done' && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3">PDF 页面预览</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pages.slice(0, 8).map((page) => (
                  <div key={page.pageNumber} className="border border-gray-200 rounded overflow-hidden">
                    <img
                      src={page.imageDataUrl}
                      alt={`第 ${page.pageNumber} 页`}
                      className="w-full h-auto"
                    />
                    <div className="text-center text-xs text-gray-500 py-1 bg-gray-50">
                      第 {page.pageNumber} 页
                    </div>
                  </div>
                ))}
              </div>
              {pages.length > 8 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  仅显示前 8 页，共 {pages.length} 页
                </div>
              )}
            </div>
          )}

          {/* 识别出的公式列表 */}
          {progress.formulas.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3">
                识别出的公式 ({progress.formulas.length} 个)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {progress.formulas.map((formula, index) => (
                  <FormulaCard key={formula.id} formula={formula} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-800 mb-3">使用说明</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
          <li>前往 <a href="https://mathpix.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mathpix官网</a> 注册账号（免费 1000 次/月）</li>
          <li>在 Dashboard 获取 App ID 和 App Key</li>
          <li>在上方面输入你的 API 凭证</li>
          <li>上传包含数学公式的 PDF 文件</li>
          <li>点击"开始转换"，等待识别完成</li>
          <li>自动下载包含可编辑公式的 Word 文档</li>
        </ol>
        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
          <p className="text-sm text-gray-500">
            <strong>注意：</strong>API Key 仅在本地使用，不会上传到任何服务器。
            每次转换会根据 PDF 页数消耗 API 调用次数。
          </p>
        </div>
      </div>
    </div>
  )
}

export default PdfToWordPage
