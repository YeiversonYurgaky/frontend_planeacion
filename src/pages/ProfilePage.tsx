import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
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
  Info,
  ShieldCheck,
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

  if (!user) return null

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Perfil de Usuario</h1>
        <Badge variant="secondary" className="text-xs">Solo lectura</Badge>
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

          {/* Nota solo lectura — fija abajo */}
          <div className="flex-shrink-0 border-t border-border p-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p>
                Datos provenientes del sistema SION. Para modificarlos, usa el portal institucional.
              </p>
            </div>
          </div>
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
                </div>
                <Separator className="mb-1" />
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
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          </ScrollArea>
        </div>

      </div>
    </div>
  )
}
