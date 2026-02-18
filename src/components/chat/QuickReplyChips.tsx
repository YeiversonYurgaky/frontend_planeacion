import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ChipOption } from "@/types"

interface QuickReplyChipsProps {
  options: ChipOption[]
  selected?: string | string[]
  multiSelect?: boolean
  disabled?: boolean
  onSelect: (value: string) => void
}

export default function QuickReplyChips({
  options,
  selected,
  multiSelect = false,
  disabled = false,
  onSelect,
}: QuickReplyChipsProps) {
  const isSelected = (value: string) => {
    if (!selected) return false
    if (Array.isArray(selected)) return selected.includes(value)
    return selected === value
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {options.map((option) => {
        const selected_ = isSelected(option.value)
        const chip = (
          <button
            key={option.value}
            onClick={() => !disabled && onSelect(option.value)}
            disabled={disabled && !selected_}
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected_
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground border-border hover:border-primary hover:text-primary",
              disabled && !selected_ && "opacity-40 cursor-not-allowed"
            )}
          >
            {option.label}
          </button>
        )

        if (option.description) {
          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>{chip}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {option.description}
              </TooltipContent>
            </Tooltip>
          )
        }

        return chip
      })}

      {multiSelect && Array.isArray(selected) && selected.length > 0 && !disabled && (
        <button
          onClick={() => onSelect("__confirm__")}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border border-gold bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all"
        >
          Confirmar selección →
        </button>
      )}
    </div>
  )
}
