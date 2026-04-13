import { AuthProvider } from '@/contexts/AuthContext'
import { AppRouter } from '@/router'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-center" />
    </AuthProvider>
  )
}
