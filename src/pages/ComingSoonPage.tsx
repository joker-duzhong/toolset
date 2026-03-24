import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

interface ComingSoonPageProps {
  title?: string
}

export function ComingSoonPage({ title = '该工具' }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title={title} />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 px-8">
        <Construction className="size-12 text-gray-300" />
        <p className="text-base font-semibold text-gray-500">功能开发中</p>
        <p className="text-sm text-center leading-relaxed">
          该工具正在努力建设中，敬请期待！
        </p>
      </div>
    </div>
  )
}
