import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import LoginPage from "@/pages/LoginPage"
import ChatPage from "@/pages/ChatPage"
import ProfilePage from "@/pages/ProfilePage"
import Layout from "@/components/layout/Layout"

function AuthGate({ children }: { children: React.ReactNode }) {
  const isInitializing = useAuthStore((s) => s.isInitializing)
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand to-brand-light">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/chat" replace />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthGate>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:planningId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}
