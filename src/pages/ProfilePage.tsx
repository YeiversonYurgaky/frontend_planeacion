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
  Info,
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
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
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
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-border flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Perfil de Usuario</h1>
        <Badge variant="secondary" className="ml-2 text-xs">
          Solo lectura
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Avatar + name block */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <Badge
                variant="secondary"
                className="mt-1 capitalize text-xs bg-primary/10 text-primary"
              >
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Info card */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Información personal
            </h3>
            <Separator className="mb-1" />
            <ProfileField icon={UserCircle} label="Nombre completo" value={user.name} />
            <Separator />
            <ProfileField icon={Mail} label="Correo institucional" value={user.email} />
            <Separator />
            <ProfileField
              icon={UserCircle}
              label="Rol"
              value={user.role === "docente" ? "Docente" : "Administrador"}
            />
          </Card>

          {/* Programs */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Programas académicos
            </h3>
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

          {/* Courses */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Cursos asignados ({user.courses.length})
            </h3>
            <Separator className="mb-1" />
            <div className="divide-y divide-border">
              {user.courses.map((course) => (
                <div key={course.id} className="py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{course.name}</p>
                      {course.isReligious && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gold/10 text-gold border-gold/20"
                        >
                          Religiosa
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {course.code} · {course.program} · {course.studentCount} estudiantes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Read-only notice */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-4">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Este perfil es de solo lectura. Los datos provienen del sistema institucional
              SION. Para modificarlos, dirígete al portal institucional correspondiente.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
