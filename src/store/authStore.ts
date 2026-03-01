import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Course } from "@/types"
import { api, setAccessToken, registerOnSessionExpired } from "@/lib/api"

// Shapes that come from the backend (snake_case)
interface ApiCourse {
  id: string
  name: string
  code: string
  program: string
  semester: string
  student_count: number
  is_religious: boolean
}

interface ApiUser {
  id: string
  name: string
  email: string
  role: string
  courses: ApiCourse[]
}

function mapCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    program: c.program,
    semester: c.semester,
    studentCount: c.student_count,
    isReligious: c.is_religious,
  }
}

function mapUser(u: ApiUser): User {
  const courses = (u.courses ?? []).map(mapCourse)
  const programs = [...new Set(courses.map((c) => c.program))]
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "administrador" ? "administrador" : "docente",
    programs,
    courses,
  }
}

// Estado limpio reutilizable en logout / expiración
const UNAUTHENTICATED = {
  user: null,
  isAuthenticated: false,
  isInitializing: false,
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  /** true mientras se verifica la sesión al arrancar (evita flash de /login) */
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Verifica silenciosamente la sesión al arrancar la app */
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,

      login: async (email: string, password: string) => {
        // 1. Obtener el access token (el refresh token llega como cookie HttpOnly)
        const { data: tokenData } = await api.post<{ access_token: string }>(
          "/api/auth/login",
          { email, password }
        )
        setAccessToken(tokenData.access_token)

        // 2. Obtener el perfil completo del usuario (incluye cursos)
        const { data: userData } = await api.get<ApiUser>("/api/auth/me")
        set({ user: mapUser(userData), isAuthenticated: true })
      },

      logout: async () => {
        // Revocar el refresh token en el servidor (best-effort: no bloquea si falla)
        try {
          await api.post("/api/auth/logout")
        } catch {
          // Si el servidor no responde, igual cerramos la sesión localmente
        }
        setAccessToken(null)
        set(UNAUTHENTICATED)
      },

      initializeAuth: async () => {
        set({ isInitializing: true })
        try {
          // Intenta obtener un nuevo access token usando la cookie de refresh
          const { data } = await api.post<{ access_token: string }>("/api/auth/refresh")
          setAccessToken(data.access_token)

          // Recuperar el perfil del usuario
          const { data: userData } = await api.get<ApiUser>("/api/auth/me")
          set({ user: mapUser(userData), isAuthenticated: true, isInitializing: false })
        } catch {
          // Sin sesión válida → limpiar estado
          setAccessToken(null)
          set(UNAUTHENTICATED)
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // isInitializing nunca se persiste
      }),
    }
  )
)

// Registrar el callback que api.ts llama cuando el refresh falla definitivamente.
// Limpia el estado de Zustand sin depender de importar authStore desde api.ts.
registerOnSessionExpired(() => {
  useAuthStore.setState(UNAUTHENTICATED)
})
