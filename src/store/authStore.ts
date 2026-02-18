import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import { MOCK_USER } from "@/data/mockUser"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (_email: string, _password: string) => {
        // Mock: accept any credentials, return the mock user
        // TODO: replace with real API call when backend is ready
        await new Promise((resolve) => setTimeout(resolve, 800))
        set({ user: MOCK_USER, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
