import { useState, useEffect } from "react"
import type { Course } from "@/types"
import { courseApi, type CoursePayload } from "@/lib/courseApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"

function getAxiosMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response: { data: unknown } }).response.data
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail: unknown }).detail
      if (Array.isArray(detail)) {
        return detail.map((e) => (e as { msg?: string }).msg ?? String(e)).join(", ")
      }
      return String(detail)
    }
  }
  return fallback
}

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** If provided, dialog is in edit mode; otherwise create mode */
  initial?: Course
  /** Called with the saved course data (snake_case from API) */
  onSaved: () => void
  /** If provided, creates the course for this user (admin mode) */
  targetUserId?: string
}

const EMPTY: CoursePayload = {
  name: "",
  code: "",
  program: "",
  semester: "",
  student_count: 0,
  is_religious: false,
}

export default function CourseFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
  targetUserId,
}: CourseFormDialogProps) {
  const [form, setForm] = useState<CoursePayload>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setError(null)
      setForm(
        initial
          ? {
              name: initial.name,
              code: initial.code,
              program: initial.program,
              semester: initial.semester,
              student_count: initial.studentCount,
              is_religious: initial.isReligious,
            }
          : EMPTY
      )
    }
  }, [open, initial])

  const set = (field: keyof CoursePayload, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (initial) {
        await courseApi.update(initial.id, form)
      } else if (targetUserId) {
        await courseApi.createForUser(targetUserId, form)
      } else {
        await courseApi.create(form)
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(getAxiosMessage(err, "No se pudo guardar el curso."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar curso" : "Agregar curso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cf-name">Nombre del curso <span className="text-destructive">*</span></Label>
            <Input
              id="cf-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Cálculo Diferencial"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cf-code">Código <span className="text-destructive">*</span></Label>
              <Input
                id="cf-code"
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="Ej. MAT-101"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cf-semester">Semestre</Label>
              <Input
                id="cf-semester"
                value={form.semester}
                onChange={(e) => set("semester", e.target.value)}
                placeholder="Ej. 2026-1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-program">Programa académico <span className="text-destructive">*</span></Label>
            <Input
              id="cf-program"
              value={form.program}
              onChange={(e) => set("program", e.target.value)}
              placeholder="Ej. Ingeniería de Sistemas"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-students">Número de estudiantes</Label>
            <Input
              id="cf-students"
              type="number"
              min={0}
              value={form.student_count}
              onChange={(e) => set("student_count", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="cf-religious"
              type="checkbox"
              checked={form.is_religious}
              onChange={(e) => set("is_religious", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="cf-religious" className="cursor-pointer">
              Curso con enfoque religioso / misional
            </Label>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initial ? "Guardar cambios" : "Agregar curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
