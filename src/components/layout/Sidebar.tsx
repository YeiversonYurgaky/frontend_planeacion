import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { usePlanningStore } from "@/store/planningStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlanningSession } from "@/types"

function formatDate(date: Date) {
  const d = new Date(date)
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
}

// ── Tooltip wrapper used throughout the mini sidebar ─────────────────────────
function SideTooltip({
  label,
  children,
  side = "right",
}: {
  label: string
  children: React.ReactNode
  side?: "right" | "left" | "top" | "bottom"
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

// ── Full planning item (expanded mode) ───────────────────────────────────────
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

// ── Mini planning item (collapsed mode) ──────────────────────────────────────
function MiniPlanningItem({
  session,
  isActive,
  onSelect,
}: {
  session: PlanningSession
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <SideTooltip label={session.title}>
      <button
        onClick={onSelect}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
          isActive ? "bg-white/20" : "hover:bg-white/10"
        )}
      >
        {session.status === "completed" ? (
          <CheckCircle2 className="w-4 h-4 text-gold" />
        ) : (
          <Clock className="w-4 h-4 text-white/50" />
        )}
      </button>
    </SideTooltip>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { planningId } = useParams()
  const { sessions, createSession, deleteSession, setActiveSession } = usePlanningStore()
  const { user, logout } = useAuthStore()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleNewPlanning = async () => {
    const id = await createSession()
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

  // ── Collapsed (mini) layout ─────────────────────────────────────────────
  if (collapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-col h-full w-14 bg-brand-dark text-white select-none items-center py-3 gap-1">
          {/* Logo + expand toggle */}
          <SideTooltip label="Asistente Docente">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center cursor-default mb-1">
              <BookOpen className="w-4 h-4 text-brand-dark" />
            </div>
          </SideTooltip>

          <SideTooltip label="Expandir panel">
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </SideTooltip>

          <div className="w-6 my-1">
            <Separator className="bg-white/10" />
          </div>

          {/* New planning */}
          <SideTooltip label="Nueva Planeación">
            <button
              onClick={handleNewPlanning}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </SideTooltip>

          {/* Session icons */}
          {sessions.length > 0 && (
            <>
              <div className="w-6 my-1">
                <Separator className="bg-white/10" />
              </div>
              <ScrollArea className="flex-1 w-full">
                <div className="flex flex-col items-center gap-1 px-1.5">
                  {sessions.map((session) => (
                    <MiniPlanningItem
                      key={session.id}
                      session={session}
                      isActive={session.id === planningId}
                      onSelect={() => handleSelectSession(session)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          <div className="w-6 mb-1">
            <Separator className="bg-white/10" />
          </div>

          {/* Footer icons */}
          <SideTooltip label="Accesibilidad">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors">
              <Accessibility className="w-4 h-4" />
            </button>
          </SideTooltip>

          <SideTooltip label={user?.name ?? "Perfil"}>
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-gold text-brand-dark text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </SideTooltip>

          <SideTooltip label="Cerrar sesión">
            <button
              onClick={logout}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4" />
            </button>
          </SideTooltip>
        </div>
      </TooltipProvider>
    )
  }

  // ── Expanded layout ─────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col h-full bg-brand-dark text-white select-none">
        {/* Header */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-brand-dark" />
            </div>
            <span className="text-sm font-semibold text-white leading-tight flex-1">
              Asistente Docente
            </span>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              title="Contraer panel lateral"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors text-sm">
            <Accessibility className="w-4 h-4" />
            <span>Accesibilidad</span>
          </button>

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
