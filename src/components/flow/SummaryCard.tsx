import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Edit3 } from "lucide-react"
import type { FlowAnswers } from "@/types"

const METHODOLOGY_LABELS: Record<string, string> = {
  ABP: "Aprendizaje Basado en Proyectos",
  flipped: "Aula Invertida",
  collaborative: "Aprendizaje Colaborativo",
  gamification: "Gamificación",
  cases: "Estudio de Casos",
  discovery: "Aprendizaje por Descubrimiento",
  debate: "Debate y Argumentación",
  service: "Aprendizaje Servicio",
}

const FAITH_CONNECTION_LABELS: Record<string, string> = {
  stewardship: "Mayordomía cristiana",
  dignity: "Dignidad humana",
  service: "Servicio y vocación",
  ethics: "Ética bíblica",
}

interface SummaryCardProps {
  answers: Partial<FlowAnswers>
  isReligious: boolean
  onConfirm: () => void
  onEdit: () => void
}

function Row({ label, value }: { label: string; value?: string | string[] }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  return (
    <div className="flex gap-3">
      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground flex-1">
        {Array.isArray(value) ? value.join(", ") : value}
      </span>
    </div>
  )
}

export default function SummaryCard({
  answers,
  isReligious,
  onConfirm,
  onEdit,
}: SummaryCardProps) {
  const methodologyLabel =
    answers.methodology
      ? METHODOLOGY_LABELS[answers.methodology] ?? answers.methodology
      : undefined

  const faithConnectionLabel =
    answers.faithConnection
      ? FAITH_CONNECTION_LABELS[answers.faithConnection] ?? answers.faithConnection
      : undefined

  return (
    <Card className="mx-4 p-5 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Resumen de tu planeación</h3>
        {isReligious && (
          <Badge variant="secondary" className="ml-auto text-xs bg-gold/10 text-gold border-gold/20">
            Cátedra Religiosa
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <Row label="Materia" value={answers.courseName} />
        <Row label="Tema" value={answers.classTopic} />
        <Row label="Metodología" value={methodologyLabel} />
        <Row label="Duración" value={answers.classHours ? `${answers.classHours} hora(s)` : undefined} />
        <Row label="Integración fe" value={answers.faithIntegration === "yes" ? "Sí, incluir" : "No en esta ocasión"} />
        {answers.observations && (
          <>
            <Separator className="my-2" />
            <Row label="Observaciones" value={answers.observations} />
          </>
        )}
        {isReligious && (
          <>
            <Separator className="my-2" />
            <Row label="Conexión espiritual" value={faithConnectionLabel} />
            <Row label="Objetivos misionales" value={answers.missionalObjectives} />
            <Row
              label="Aspectos a evaluar"
              value={answers.evaluationType?.length ? answers.evaluationType.join(", ") : undefined}
            />
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Editar
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Generar planeación →
        </Button>
      </div>
    </Card>
  )
}
