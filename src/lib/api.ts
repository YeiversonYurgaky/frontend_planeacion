import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Necesario para enviar/recibir la cookie HttpOnly del refresh token
})

// ── Token en memoria (no en localStorage para mayor seguridad) ────────────────
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// ── Request interceptor: adjunta el Bearer token a cada petición ──────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ── Callback de sesión expirada ───────────────────────────────────────────────
// authStore lo registra para limpiar su estado cuando el refresh falla.
let onSessionExpired: (() => void) | null = null

export function registerOnSessionExpired(fn: () => void) {
  onSessionExpired = fn
}

// ── Response interceptor: renueva el token si recibe 401 ─────────────────────
// Un único Promise compartido entre todos los 401 concurrentes.
// Evita que varias peticiones simultáneas disparen múltiples refreshes.
let refreshPromise: Promise<string> | null = null

// ── RAG upload ────────────────────────────────────────────────────────────────
export async function uploadFilesToRag(files: File[]): Promise<void> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  formData.append("metadata_json", JSON.stringify({ tipo_fuente: "material_docente" }))
  await api.post("/api/rag/upload", formData)
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isRefreshEndpoint = originalRequest?.url?.includes("/api/auth/refresh")

    // Si es 401 en el endpoint de refresh → sesión definitivamente expirada
    if (error.response?.status === 401 && isRefreshEndpoint) {
      setAccessToken(null)
      onSessionExpired?.()
      window.location.href = "/login"
      return Promise.reject(error)
    }

    // Si es 401 en otro endpoint y aún no se ha reintentado → renovar token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Si aún no hay un refresh en curso, iniciarlo
      if (!refreshPromise) {
        refreshPromise = api
          .post<{ access_token: string }>("/api/auth/refresh")
          .then(({ data }) => {
            setAccessToken(data.access_token)
            return data.access_token
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      // Todos los 401 concurrentes esperan la misma promesa
      const token = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)
