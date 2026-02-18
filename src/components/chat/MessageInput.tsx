import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, SkipForward } from "lucide-react"

interface MessageInputProps {
  onSend: (text: string) => void
  onSkip?: () => void
  placeholder?: string
  disabled?: boolean
  isOptional?: boolean
}

export default function MessageInput({
  onSend,
  onSkip,
  placeholder = "Escribe aquí...",
  disabled = false,
  isOptional = false,
}: MessageInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed && !isOptional) return
    onSend(trimmed)
    setValue("")
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 pt-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="resize-none min-h-[40px] max-h-[120px] flex-1 text-sm py-2.5 bg-white"
        style={{ overflow: "auto" }}
      />
      <div className="flex gap-1.5 flex-shrink-0">
        {isOptional && onSkip && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            disabled={disabled}
            title="Omitir este paso"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!value.trim() && !isOptional)}
          className="h-10 w-10 bg-primary hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
