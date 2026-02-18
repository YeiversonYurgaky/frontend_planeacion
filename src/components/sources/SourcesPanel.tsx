import { useRef, useState } from "react"
import { usePlanningStore } from "@/store/planningStore"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import SourceItem from "./SourceItem"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { Upload, FileText, Info } from "lucide-react"
import type { PdfSource } from "@/types"

interface SourcesPanelProps {
  sessionId: string
}

export default function SourcesPanel({ sessionId }: SourcesPanelProps) {
  const sessions = usePlanningStore((s) => s.sessions)
  const addSource = usePlanningStore((s) => s.addSource)
  const removeSource = usePlanningStore((s) => s.removeSource)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const session = sessions.find((s) => s.id === sessionId)
  const sources = session?.sources ?? []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      if (file.type !== "application/pdf") return
      const newSource: PdfSource = {
        id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      }
      addSource(sessionId, newSource)
    })
    // Reset input so the same file can be uploaded again if needed
    e.target.value = ""
  }

  const handleRemoveConfirm = () => {
    if (removeTarget) {
      removeSource(sessionId, removeTarget)
      setRemoveTarget(null)
    }
  }

  return (
    <>
      <div
        className="flex flex-col border-l border-border bg-white flex-shrink-0"
        style={{ width: "var(--sources-width)" }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Fuentes</h3>
            {sources.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {sources.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            PDFs de referencia para esta planeación
          </p>
        </div>

        <Separator />

        {/* Source list */}
        <ScrollArea className="flex-1">
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Sin fuentes aún</p>
              <p className="text-xs text-muted-foreground">
                Sube sílabos, guías o materiales para que el asistente los considere al generar.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {sources.map((source) => (
                <SourceItem
                  key={source.id}
                  source={source}
                  onRemove={() => setRemoveTarget(source.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Add button + note */}
        <div className="p-3 flex-shrink-0 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="w-full h-9 text-sm border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Agregar fuente
          </Button>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>
              Solo PDF. El procesamiento automático estará disponible próximamente.
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="¿Eliminar esta fuente?"
        description="Se quitará el documento de esta planeación."
        confirmLabel="Eliminar"
        onConfirm={handleRemoveConfirm}
        variant="destructive"
      />
    </>
  )
}
