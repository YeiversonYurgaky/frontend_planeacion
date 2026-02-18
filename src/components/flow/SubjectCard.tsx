import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Church } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Course } from "@/types"

interface SubjectCardProps {
  course: Course
  selected?: boolean
  onSelect: () => void
}

export default function SubjectCard({ course, selected, onSelect }: SubjectCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "p-4 cursor-pointer transition-all border-2 hover:shadow-md",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {course.isReligious ? (
            <Church className="w-4 h-4 text-gold flex-shrink-0" />
          ) : (
            <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          )}
          <span className="text-xs font-mono text-muted-foreground">{course.code}</span>
        </div>
        {course.isReligious && (
          <Badge
            variant="secondary"
            className="text-xs bg-gold/10 text-gold border-gold/20 flex-shrink-0"
          >
            Religiosa
          </Badge>
        )}
      </div>

      <h3 className="font-semibold text-sm text-foreground mb-1 leading-snug">
        {course.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-3 truncate">{course.program}</p>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{course.studentCount} estudiantes</span>
        <span className="mx-1">·</span>
        <span>{course.semester}</span>
      </div>
    </Card>
  )
}
