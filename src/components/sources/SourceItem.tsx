import { FileText, X, Loader2 } from "lucide-react"
import type { PdfSource } from "@/types"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface SourceItemProps {
  source: PdfSource
  onRemove: () => void
}

export default function SourceItem({ source, onRemove }: SourceItemProps) {
  return (
    <div className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{source.name}</p>
        <p className="text-xs text-muted-foreground">{formatSize(source.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0"
        title="Eliminar fuente"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function SourceItemSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
      </div>
      <div className="flex-1">
        <div className="h-3 bg-muted rounded w-3/4 mb-1.5" />
        <div className="h-2.5 bg-muted rounded w-1/3" />
      </div>
    </div>
  )
}
