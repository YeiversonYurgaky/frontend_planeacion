import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Course } from "@/types"
import { api, setAccessToken } from "@/lib/api"

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

      login: async (email: string, password: string) => {
        // 1. Obtener el access token
        const { data: tokenData } = await api.post<{ access_token: string }>(
          "/api/auth/login",
          { email, password }
        )
        setAccessToken(tokenData.access_token)

        // 2. Obtener el perfil completo del usuario (incluye cursos)
        const { data: userData } = await api.get<ApiUser>("/api/auth/me")
        set({ user: mapUser(userData), isAuthenticated: true })
      },

      logout: () => {
        setAccessToken(null)
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
