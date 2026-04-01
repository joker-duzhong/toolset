import { useState, useCallback } from 'react'
import { FileUp, RotateCcw, AlertCircle, CheckCircle2, Loader2, FileText, Download } from 'lucide-react'
import { usePdfConverter } from './hooks/usePdfConverter'

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

// Markdown 内容预览
function ContentPreview({ pages }: { pages: { pageNumber: number; content: string }[] }) {
  if (pages.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="font-medium text-gray-700 mb-3">识别结果预览</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {pages.map((page) => (
          <div key={page.pageNumber} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded inline-block mb-2">
              第 {page.pageNumber} 页
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
              {page.content.slice(0, 500)}
              {page.content.length > 500 && '...'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null)
  const { progress, pdfPages, convert, reset } = usePdfConverter()

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
    await convert(file)
  }, [file, convert])

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">PDF 转 Word</h1>
        <p className="text-gray-600">
          上传 PDF 文件，自动识别文字和数学公式，导出为可编辑的 Word 文档
        </p>
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
          disabled={!file || isConverting}
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
              label={progress.status === 'uploading' ? '解析 PDF' : '识别文档'}
            />
          )}

          {/* 页面预览 */}
          {pdfPages.length > 0 && progress.status === 'done' && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3">PDF 页面预览</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pdfPages.slice(0, 8).map((page) => (
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
              {pdfPages.length > 8 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  仅显示前 8 页，共 {pdfPages.length} 页
                </div>
              )}
            </div>
          )}

          {/* 识别出的内容预览 */}
          {progress.pages.length > 0 && (
            <ContentPreview pages={progress.pages} />
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-800 mb-3">使用说明</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
          <li>上传包含数学公式的 PDF 文件</li>
          <li>点击"开始转换"，等待识别完成</li>
          <li>自动下载包含可编辑公式的 Word 文档</li>
        </ol>
        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
          <p className="text-sm text-gray-500">
            <strong>特性：</strong>支持识别文字、数学公式、表格等，导出为可编辑的 Word 格式。
            公式将以 Word 原生公式格式呈现，可直接编辑。
          </p>
        </div>
      </div>
    </div>
  )
}

export default PdfToWordPage
