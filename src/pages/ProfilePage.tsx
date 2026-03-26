import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import type { Course } from "@/types"
import { courseApi } from "@/lib/courseApi"
import CourseFormDialog from "@/components/courses/CourseFormDialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Mail,
  UserCircle,
  GraduationCap,
  BookOpen,
  Church,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value ?? "—"}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const refreshUser = useAuthStore((s) => s.refreshUser)

  const [formOpen, setFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleAdd = () => {
    setEditingCourse(undefined)
    setFormOpen(true)
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormOpen(true)
  }

  const handleDelete = async (course: Course) => {
    if (!confirm(`¿Eliminar el curso "${course.name}"?`)) return
    setDeletingId(course.id)
    try {
      await courseApi.delete(course.id)
      await refreshUser()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Perfil de Usuario</h1>
      </div>

      {/* Two-panel body — fills all remaining height */}
      <div className="flex flex-1 overflow-hidden gap-0">

        {/* ── Panel izquierdo: datos personales ── */}
        <div className="flex flex-col w-80 flex-shrink-0 border-r border-border bg-white overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-5">

              {/* Avatar + nombre */}
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-snug">
                    {user.name}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="mt-1.5 capitalize text-xs bg-primary/10 text-primary border-0"
                  >
                    {user.role === "docente" ? "Docente" : "Administrador"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Campos */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Información personal
                </p>
                <ProfileField icon={UserCircle} label="Nombre completo" value={user.name} />
                <Separator />
                <ProfileField icon={Mail} label="Correo institucional" value={user.email} />
                <Separator />
                <ProfileField
                  icon={ShieldCheck}
                  label="Rol en el sistema"
                  value={user.role === "docente" ? "Docente" : "Administrador"}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* ── Panel derecho: programas y materias ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-5">

              {/* Programas */}
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Programas académicos
                  </h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {user.programs.length}
                  </Badge>
                </div>
                <Separator className="mb-3" />
                {user.programs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.programs.map((p) => (
                      <div
                        key={p}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin programas asignados.</p>
                )}
              </Card>

              {/* Cursos */}
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Cursos asignados
                  </h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {user.courses.length}
                  </Badge>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={handleAdd}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Agregar
                  </Button>
                </div>
                <Separator className="mb-1" />
                {user.courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">
                    No tienes cursos asignados. Agrega uno para comenzar a planear clases.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {user.courses.map((course) => (
                      <div key={course.id} className="py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {course.isReligious ? (
                            <Church className="w-4 h-4 text-gold" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">
                              {course.name}
                            </p>
                            {course.isReligious && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gold/10 text-gold border-gold/20"
                              >
                                Religiosa
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {course.code} · {course.program}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {course.studentCount} est.
                        </span>
                        {/* Edit / Delete */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            title="Editar curso"
                            onClick={() => handleEdit(course)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Eliminar curso"
                            disabled={deletingId === course.id}
                            onClick={() => handleDelete(course)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                          >
                            {deletingId === course.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          </ScrollArea>
        </div>

      </div>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editingCourse}
        onSaved={refreshUser}
      />
    </div>
  )
}
