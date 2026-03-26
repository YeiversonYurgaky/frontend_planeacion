import { useState, useEffect, useRef } from "react"
import { adminApi, type AdminUser, type RagFileResult } from "@/lib/adminApi"
import { courseApi, type ApiCourse } from "@/lib/courseApi"
import CourseFormDialog from "@/components/courses/CourseFormDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator"
import {
  Users,
  Upload,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Church,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getAxiosMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response: { data: unknown } }).response.data
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail: unknown }).detail
      if (Array.isArray(detail)) {
        // FastAPI 422 validation errors: [{loc, msg, type}, ...]
        return detail.map((e) => (e as { msg?: string }).msg ?? String(e)).join(", ")
      }
      return String(detail)
    }
  }
  return fallback
}

// ── Create User Dialog ─────────────────────────────────────────────────────────

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (user: AdminUser) => void
}

function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await adminApi.createUser({ name, email, password })
      onCreated(data)
      setName("")
      setEmail("")
      setPassword("")
      onOpenChange(false)
    } catch (err) {
      setError(getAxiosMessage(err, "No se pudo crear el usuario."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo usuario docente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cu-name">Nombre completo</Label>
            <Input
              id="cu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María García"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cu-email">Correo institucional</Label>
            <Input
              id="cu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="docente@universidad.edu.co"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cu-password">Contraseña temporal</Label>
            <Input
              id="cu-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
            <PasswordStrengthIndicator password={password} />
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
              Crear usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Courses Tab ───────────────────────────────────────────────────────────────

interface CoursesTabProps {
  selectedUser: AdminUser | null
  onClearUser: () => void
}

function CoursesTab({ selectedUser, onClearUser }: CoursesTabProps) {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<ApiCourse | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedUser) return
    setLoading(true)
    courseApi
      .listForUser(selectedUser.id)
      .then(({ data }) => setCourses(data))
      .finally(() => setLoading(false))
  }, [selectedUser])

  const handleSaved = () => {
    if (!selectedUser) return
    courseApi.listForUser(selectedUser.id).then(({ data }) => setCourses(data))
  }

  const handleDelete = async (course: ApiCourse) => {
    if (!confirm(`¿Eliminar el curso "${course.name}"?`)) return
    setDeletingId(course.id)
    try {
      await courseApi.delete(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
    } finally {
      setDeletingId(null)
    }
  }

  // Convert ApiCourse to the Course shape CourseFormDialog expects for editing
  const toFormInitial = (c: ApiCourse) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    program: c.program,
    semester: c.semester,
    studentCount: c.student_count,
    isReligious: c.is_religious,
  })

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-muted-foreground">
        <BookOpen className="w-10 h-10 opacity-30" />
        <p className="text-sm">Selecciona un docente en la pestaña <strong>Usuarios</strong> para gestionar sus cursos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{selectedUser.name}</p>
          <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearUser}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Cambiar docente
          </button>
          <Button size="sm" onClick={() => { setEditingCourse(undefined); setFormOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar curso
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Este docente no tiene cursos asignados.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
            <span>Curso</span>
            <span className="text-center">Código</span>
            <span className="text-center">Est.</span>
            <span className="text-center">Acciones</span>
          </div>
          <ScrollArea className="max-h-[420px]">
            {courses.map((course, idx) => (
              <div key={course.id}>
                {idx > 0 && <Separator />}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {course.is_religious ? (
                        <Church className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium truncate">{course.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate ml-5">{course.program}</p>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">{course.code}</span>
                  <span className="text-xs text-muted-foreground text-center">{course.student_count}</span>
                  <div className="flex items-center gap-1 justify-center">
                    <button
                      title="Editar curso"
                      onClick={() => { setEditingCourse(course); setFormOpen(true) }}
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
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editingCourse ? toFormInitial(editingCourse) : undefined}
        onSaved={handleSaved}
        targetUserId={editingCourse ? undefined : selectedUser.id}
      />
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab({ onManageCourses }: { onManageCourses: (user: AdminUser) => void }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  // onManageCourses is passed from AdminPage

  useEffect(() => {
    adminApi
      .getUsers()
      .then(({ data }) => setUsers(data))
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleActive = async (user: AdminUser) => {
    setUpdating(user.id)
    try {
      const { data } = await adminApi.updateUser(user.id, { is_active: !user.is_active })
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
    } catch {
      // silencio: el botón vuelve a su estado
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === "docente" ? "administrador" : "docente"
    setUpdating(user.id)
    try {
      const { data } = await adminApi.updateUser(user.id, { role: newRole })
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
    } catch {
      // silencio
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive py-8 justify-center">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo usuario
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
          <span>Usuario</span>
          <span className="text-center">Rol</span>
          <span className="text-center">Estado</span>
          <span className="text-center">Cursos</span>
          <span className="text-center">Acciones</span>
        </div>

        <ScrollArea className="max-h-[480px]">
          {users.map((user, idx) => (
            <div key={user.id}>
              {idx > 0 && <Separator />}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3">
                {/* Name + email */}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground/60">{formatDate(user.created_at)}</p>
                </div>

                {/* Role badge */}
                <div className="flex justify-center">
                  {user.role === "administrador" ? (
                    <Badge className="bg-brand/10 text-brand border-brand/20 gap-1 whitespace-nowrap">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                      <BookOpen className="w-3 h-3" />
                      Docente
                    </Badge>
                  )}
                </div>

                {/* Active badge */}
                <div className="flex justify-center">
                  {user.is_active ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
                      Inactivo
                    </Badge>
                  )}
                </div>

                {/* Manage courses */}
                <div className="flex justify-center">
                  <button
                    title="Gestionar cursos"
                    onClick={() => onManageCourses(user)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-center">
                  {/* Toggle active */}
                  <button
                    title={user.is_active ? "Desactivar usuario" : "Activar usuario"}
                    disabled={updating === user.id}
                    onClick={() => handleToggleActive(user)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      user.is_active
                        ? "text-green-600 hover:bg-green-50"
                        : "text-muted-foreground hover:bg-muted",
                      "disabled:opacity-40"
                    )}
                  >
                    {updating === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.is_active ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </button>

                  {/* Toggle role */}
                  <button
                    title={user.role === "docente" ? "Promover a administrador" : "Cambiar a docente"}
                    disabled={updating === user.id}
                    onClick={() => handleToggleRole(user)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground",
                      "disabled:opacity-40"
                    )}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(u) => setUsers((prev) => [u, ...prev])}
      />
    </div>
  )
}

// ── RAG Upload Tab ─────────────────────────────────────────────────────────────

const TIPO_FUENTE_OPTIONS = [
  { value: "legal", label: "Legal / Normativo" },
  { value: "pedagogia", label: "Pedagogía" },
  { value: "curricular", label: "Curricular" },
  { value: "contenido_materia", label: "Contenido de materia" },
  { value: "material_docente", label: "Material docente" },
]

function RagUploadTab() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [tipoFuente, setTipoFuente] = useState("")
  const [materia, setMateria] = useState("")
  const [grado, setGrado] = useState("")
  const [temaEspecifico, setTemaEspecifico] = useState("")
  const [metodologia, setMetodologia] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RagFileResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...dropped])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx)
    )
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files.length || !tipoFuente) return
    setError(null)
    setResults(null)
    setLoading(true)
    try {
      const { data } = await adminApi.uploadRagFiles(files, {
        tipo_fuente: tipoFuente,
        materia: materia || undefined,
        grado: grado || undefined,
        tema_especifico: temaEspecifico || undefined,
        metodologia_pedagogica: metodologia || undefined,
      })
      setResults(data.files_processed)
      setFiles([])
      setTipoFuente("")
      setMateria("")
      setGrado("")
      setTemaEspecifico("")
      setMetodologia("")
    } catch (err) {
      setError(getAxiosMessage(err, "Error al subir los archivos."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-5 max-w-2xl">
      <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        Los archivos subidos desde una cuenta administrador se añaden al contexto
        <strong> global</strong> del RAG, disponible para todos los docentes.
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX o TXT — máx. 10 MB por archivo</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted/50">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Separator />

      {/* Metadata */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Metadatos del documento</h3>

        {/* Tipo de fuente — required */}
        <div className="space-y-1">
          <Label htmlFor="tipo-fuente">
            Tipo de fuente <span className="text-destructive">*</span>
          </Label>
          <select
            id="tipo-fuente"
            value={tipoFuente}
            onChange={(e) => setTipoFuente(e.target.value)}
            required
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Selecciona un tipo…</option>
            {TIPO_FUENTE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="materia">Materia (opcional)</Label>
            <Input
              id="materia"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ej. Matemáticas, Todas"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="grado">Grado (opcional)</Label>
            <Input
              id="grado"
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
              placeholder="Ej. 9, Todos"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tema">Tema específico (opcional)</Label>
          <Input
            id="tema"
            value={temaEspecifico}
            onChange={(e) => setTemaEspecifico(e.target.value)}
            placeholder="Ej. Gamificación, Evaluación formativa"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="metodologia">Metodología pedagógica (opcional)</Label>
          <Input
            id="metodologia"
            value={metodologia}
            onChange={(e) => setMetodologia(e.target.value)}
            placeholder="Ej. ABP, Flipped Classroom"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Upload results */}
      {results && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
            Resultados del procesamiento
          </div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm border-t first:border-t-0">
              {r.status === "ok" || r.chunks_added > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
              <span className="flex-1 truncate">{r.filename}</span>
              <span className="text-muted-foreground flex-shrink-0">
                {r.chunks_added} fragmento{r.chunks_added !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || files.length === 0 || !tipoFuente}
        className="w-full sm:w-auto"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <Upload className="w-4 h-4 mr-2" />
        Subir al RAG global
      </Button>
    </form>
  )
}

// ── Tab nav ───────────────────────────────────────────────────────────────────

type Tab = "users" | "rag" | "courses"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "users",   label: "Usuarios",    icon: Users },
  { id: "rag",     label: "RAG Global",  icon: Upload },
  { id: "courses", label: "Cursos",      icon: BookOpen },
]

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users")
  const [coursesUser, setCoursesUser] = useState<AdminUser | null>(null)

  const handleManageCourses = (user: AdminUser) => {
    setCoursesUser(user)
    setActiveTab("courses")
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Panel de Administración</h1>
            <p className="text-xs text-muted-foreground">Gestión de usuarios y contenido del sistema</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-4">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5">
          {activeTab === "users"   && <UsersTab onManageCourses={handleManageCourses} />}
          {activeTab === "rag"     && <RagUploadTab />}
          {activeTab === "courses" && (
            <CoursesTab
              selectedUser={coursesUser}
              onClearUser={() => setCoursesUser(null)}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
