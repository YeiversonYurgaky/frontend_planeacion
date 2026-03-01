import { useState } from "react"
import { api } from "@/lib/api"
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
  Printer,
} from "lucide-react"
import type { PlanningResult } from "@/types"

// ── Markdown → HTML (lightweight, only the constructs Gemini uses) ────────────
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function mdToHtml(md: string): string {
  // Escape raw HTML first to prevent XSS, then convert markdown constructs
  return escapeHtml(md)
    // Tables: convert | col | col | rows to <table>
    .replace(/(?:^\|.+\|\n?)+/gm, (table) => {
      const rows = table.trim().split("\n")
      let html = "<table>"
      rows.forEach((row, i) => {
        const cells = row.split("|").slice(1, -1)
        if (i === 1 && cells.every((c) => /^[-: ]+$/.test(c))) return // separator row
        const tag = i === 0 ? "th" : "td"
        html += `<tr>${cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join("")}</tr>`
      })
      html += "</table>"
      return html
    })
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
    .replace(/---/g, "<hr>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[hult]|<hr)(.+)$/gm, "<p>$1</p>")
}

function buildPrintHtml(
  sections: { title: string; content: string }[],
  title: string
): string {
  const body = sections
    .map(
      (s) => `
      <section>
        <h2 class="section-title">${s.title}</h2>
        <div class="section-body">${mdToHtml(s.content)}</div>
      </section>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; max-width: 820px; margin: 0 auto; padding: 32px 40px; }
  h1 { font-size: 22px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; margin-bottom: 24px; }
  h2 { font-size: 16px; margin-top: 0; }
  h3 { font-size: 14px; }
  .section-title { font-size: 15px; font-weight: 700; color: #1e3a5f; border-left: 4px solid #1e3a5f; padding-left: 10px; margin-bottom: 10px; }
  section { margin-bottom: 28px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 10px 0; }
  th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
  th { background: #f3f4f6; font-weight: 600; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  p { margin: 6px 0; line-height: 1.6; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 24px; }
  @media print {
    body { padding: 16px; }
    section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generado por el Asistente de Planeación Docente · ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}</p>
  ${body}
</body>
</html>`
}

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
  sessionId: string
}

export default function ResultCard({ result, isReligious, sessionId }: ResultCardProps) {
  const [isExporting, setIsExporting] = useState(false)

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

  const exportPdfFallback = () => {
    const printSections = sections.map((s) => ({
      title: s.title,
      content: result[s.key] as string,
    }))
    const html = buildPrintHtml(printSections, "Planeación Docente")
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(html)
    win.document.close()
    // Esperar a que el contenido cargue antes de imprimir
    win.onload = () => win.print()
  }

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const body = {
        class_planning: result.classPlanning,
        evaluation_strategies: result.evaluationStrategies,
        rubric: result.rubric,
        spiritual_integration: result.spiritualIntegration ?? null,
        biblical_resources: result.biblicalResources ?? null,
      }
      const response = await api.post(
        `/api/plannings/${sessionId}/export/pdf`,
        body,
        { responseType: "blob" }
      )
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }))
      const a = document.createElement("a")
      a.href = url
      a.download = "planeacion.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: abrir vista de impresión con aviso explícito al usuario
      const confirmed = window.confirm(
        "No se pudo generar el PDF desde el servidor. ¿Deseas abrir la vista de impresión del navegador como alternativa?"
      )
      if (confirmed) exportPdfFallback()
    } finally {
      setIsExporting(false)
    }
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => void handleExportPdf()} disabled={isExporting}>
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? "Generando..." : "Exportar PDF"}
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={downloadAll}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Descargar .txt
          </Button>
        </div>
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
