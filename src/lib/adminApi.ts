import { api } from "@/lib/api"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "docente" | "administrador"
  is_active: boolean
  created_at: string
}

export interface UserCreatePayload {
  email: string
  name: string
  password: string
}

export interface UserAdminUpdatePayload {
  is_active?: boolean
  role?: "docente" | "administrador"
}

export interface RagMetadata {
  tipo_fuente: string
  materia?: string
  grado?: string
  tema_especifico?: string
  metodologia_pedagogica?: string
}

export interface RagFileResult {
  filename: string
  status: string
  chunks_added: number
}

export interface RagUploadResponse {
  message: string
  metadata_applied: RagMetadata & { scope: string }
  files_processed: RagFileResult[]
}

export const adminApi = {
  getUsers: () => api.get<AdminUser[]>("/api/admin/users"),

  updateUser: (id: string, data: UserAdminUpdatePayload) =>
    api.patch<AdminUser>(`/api/admin/users/${id}`, data),

  createUser: (data: UserCreatePayload) =>
    api.post<AdminUser>("/api/auth/register", data),

  uploadRagFiles: (files: File[], metadata: RagMetadata) => {
    const formData = new FormData()
    files.forEach((f) => formData.append("files", f))
    formData.append("metadata_json", JSON.stringify(metadata))
    return api.post<RagUploadResponse>("/api/rag/upload", formData)
  },
}
