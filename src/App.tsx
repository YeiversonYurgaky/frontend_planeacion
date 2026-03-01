import { useEffect } from "react"
import AppRouter from "@/router"
import { useAuthStore } from "@/store/authStore"

export default function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <AppRouter />
}
