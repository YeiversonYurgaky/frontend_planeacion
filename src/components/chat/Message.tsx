import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message as MessageType } from "@/types"

interface MessageProps {
  message: MessageType
  userName?: string
}

export default function Message({ message, userName }: MessageProps) {
  const isAssistant = message.role === "assistant"

  const initials = userName
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U"

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isAssistant ? (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        ) : (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gold text-brand-dark text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isAssistant
            ? "bg-white border border-border text-foreground rounded-tl-sm shadow-sm"
            : "bg-primary text-white rounded-tr-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
