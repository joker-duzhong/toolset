export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="size-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-sm text-gray-400">正在验证登录...</p>
    </div>
  )
}
