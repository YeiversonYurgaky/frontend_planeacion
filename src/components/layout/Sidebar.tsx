import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { usePlanningStore } from "@/store/planningStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import {
  Plus,
  BookOpen,
  Trash2,
  User,
  ChevronRight,
  Clock,
  CheckCircle2,
  Accessibility,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlanningSession } from "@/types"

function formatDate(date: Date) {
  const d = new Date(date)
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
}

function PlanningItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: PlanningSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {session.status === "completed" ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gold" />
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0 text-white/50" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{session.title}</p>
        <p className="text-xs text-white/50">{formatDate(session.createdAt)}</p>
      </div>

      {hovered && (
        <button
          className="p-1 rounded hover:bg-white/20 transition-colors flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="w-3.5 h-3.5 text-white/60 hover:text-white" />
        </button>
      )}
    </div>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { planningId } = useParams()
  const { sessions, createSession, deleteSession, setActiveSession } = usePlanningStore()
  const { user, logout } = useAuthStore()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleNewPlanning = () => {
    const id = createSession()
    navigate(`/chat/${id}`)
  }

  const handleSelectSession = (session: PlanningSession) => {
    setActiveSession(session.id)
    navigate(`/chat/${session.id}`)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSession(deleteTarget)
      if (planningId === deleteTarget) navigate("/chat")
      setDeleteTarget(null)
    }
  }

  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?"

  return (
    <>
      <div className="flex flex-col h-full bg-brand-dark text-white select-none">
        {/* Header */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-brand-dark" />
            </div>
            <span className="text-sm font-semibold text-white leading-tight">
              Asistente Docente
            </span>
          </div>

          <Button
            onClick={handleNewPlanning}
            className="w-full bg-white/15 hover:bg-white/25 text-white border-0 h-9 text-sm font-medium"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Planeación
          </Button>
        </div>

        <Separator className="bg-white/10" />

        {/* History */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-0.5">
              {sessions.length === 0 ? (
                <p className="text-white/40 text-xs text-center py-8 px-4">
                  Aún no tienes planeaciones. Crea una nueva para empezar.
                </p>
              ) : (
                sessions.map((session) => (
                  <PlanningItem
                    key={session.id}
                    session={session}
                    isActive={session.id === planningId}
                    onSelect={() => handleSelectSession(session)}
                    onDelete={() => setDeleteTarget(session.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-white/10" />

        {/* Footer */}
        <div className="p-3 space-y-1 flex-shrink-0">
          {/* Accessibility (visual only per requirements) */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors text-sm">
            <Accessibility className="w-4 h-4" />
            <span>Accesibilidad</span>
          </button>

          {/* Profile */}
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="w-7 h-7 flex-shrink-0">
              <AvatarFallback className="bg-gold text-brand-dark text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors text-xs"
            onClick={logout}
          >
            <User className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar planeación?"
        description="Esta acción no se puede deshacer. La planeación y todos sus materiales serán eliminados."
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />

    </>
  )
}
