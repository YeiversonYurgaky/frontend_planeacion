import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  CheckSquare,
  Table2,
  Heart,
  BookMarked,
  Download,
  Eye,
  X,
} from "lucide-react"
import type { PlanningResult } from "@/types"

const SECTIONS: {
  key: keyof PlanningResult
  title: string
  icon: React.ElementType
  color: string
}[] = [
  {
    key: "classPlanning",
    title: "Planeación de Clase",
    icon: Calendar,
    color: "text-primary",
  },
  {
    key: "evaluationStrategies",
    title: "Estrategias de Evaluación",
    icon: CheckSquare,
    color: "text-emerald-600",
  },
  {
    key: "rubric",
    title: "Rúbrica",
    icon: Table2,
    color: "text-violet-600",
  },
  {
    key: "spiritualIntegration",
    title: "Integración Espiritual",
    icon: Heart,
    color: "text-gold",
  },
  {
    key: "biblicalResources",
    title: "Recursos Bíblicos",
    icon: BookMarked,
    color: "text-amber-700",
  },
]

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface ResultCardSectionProps {
  title: string
  icon: React.ElementType
  color: string
  content: string
  sectionKey: string
}

function ResultCardSection({
  title,
  icon: Icon,
  color,
  content,
  sectionKey,
}: ResultCardSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
        <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {content.replace(/#+\s/g, "").slice(0, 80)}...
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => setOpen(true)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => downloadText(content, `${sectionKey}.txt`)}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Descargar
          </Button>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${color}`} />
              {title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
              {content}
            </pre>
          </ScrollArea>
          <div className="flex justify-between items-center flex-shrink-0 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadText(content, `${sectionKey}.txt`)}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ResultCardProps {
  result: PlanningResult
  isReligious: boolean
}

export default function ResultCard({ result, isReligious }: ResultCardProps) {
  const sections = SECTIONS.filter((s) => {
    if (s.key === "biblicalResources") return isReligious && !!result[s.key]
    if (s.key === "spiritualIntegration") return !!result[s.key]
    return !!result[s.key]
  })

  const downloadAll = () => {
    const all = sections
      .map((s) => `## ${s.title}\n\n${result[s.key]}`)
      .join("\n\n---\n\n")
    downloadText(all, "planeacion-completa.txt")
  }

  return (
    <div className="mx-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Materiales generados</span>
          <Badge variant="secondary" className="text-xs">
            {sections.length} secciones
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={downloadAll}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Descargar todo
        </Button>
      </div>

      {sections.map((s) => (
        <ResultCardSection
          key={s.key}
          title={s.title}
          icon={s.icon}
          color={s.color}
          content={result[s.key] as string}
          sectionKey={s.key}
        />
      ))}
    </div>
  )
}
