import { api } from "@/lib/api"

export interface CoursePayload {
  name: string
  code: string
  program: string
  semester: string
  student_count: number
  is_religious: boolean
}

export interface ApiCourse {
  id: string
  name: string
  code: string
  program: string
  semester: string
  student_count: number
  is_religious: boolean
}

export const courseApi = {
  /** Teacher: create a course for themselves */
  create: (data: CoursePayload) =>
    api.post<ApiCourse>("/api/courses/", data),

  /** Teacher or admin: update a course (403 if not owner and not admin) */
  update: (courseId: string, data: CoursePayload) =>
    api.put<ApiCourse>(`/api/courses/${courseId}`, data),

  /** Teacher or admin: delete a course */
  delete: (courseId: string) =>
    api.delete(`/api/courses/${courseId}`),

  /** Admin only: list courses of a specific user */
  listForUser: (userId: string) =>
    api.get<ApiCourse[]>(`/api/courses/admin/${userId}`),

  /** Admin only: create a course for a specific user */
  createForUser: (userId: string, data: CoursePayload) =>
    api.post<ApiCourse>(`/api/courses/admin/${userId}`, data),
}
