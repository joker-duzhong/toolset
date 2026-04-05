import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { useState, useEffect } from 'react'

interface ProtectedToolWrapperProps {
  children: React.ReactNode
  requiresAuth?: boolean
}

export function ProtectedToolWrapper({ children, requiresAuth = false }: ProtectedToolWrapperProps) {
  const { status } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // 当需要认证且未认证时，自动显示 modal
  useEffect(() => {
    if (requiresAuth && status === 'unauthenticated') {
      setShowAuthModal(true)
    }
  }, [requiresAuth, status])

  // 正在检查认证状态，显示加载界面
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 已认证或不需要认证，直接显示工具页面
  if (status === 'authenticated' || !requiresAuth) {
    return <>{children}</>
  }

  // 未认证且需要认证，显示工具页面 + modal
  return (
    <div className="relative">
      {/* 工具页面内容（淡化） */}
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>

      {/* 登陆 Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
