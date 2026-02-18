import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePlanningStore } from "@/store/planningStore"
import { useAuthStore } from "@/store/authStore"
import { useConversationFlow } from "@/hooks/useConversationFlow"
import { buildFlowSteps } from "@/data/flowSteps"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import Message from "@/components/chat/Message"
import TypingIndicator from "@/components/chat/TypingIndicator"
import MessageInput from "@/components/chat/MessageInput"
import QuickReplyChips from "@/components/chat/QuickReplyChips"
import SummaryCard from "@/components/flow/SummaryCard"
import SubjectCard from "@/components/flow/SubjectCard"
import ResultCard from "@/components/chat/ResultCard"
import SourcesPanel from "@/components/sources/SourcesPanel"
import { BookOpen, Sparkles } from "lucide-react"
import type { PlanningSession } from "@/types"

// ── Welcome screen when no session is active ─────────────────────────────────
function WelcomeScreen({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Asistente de Planeación Docente
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        Diseña tu clase paso a paso con apoyo de inteligencia artificial.
        Recibirás una planeación completa, estrategias de evaluación y rúbricas.
      </p>
      <Button onClick={onNew} className="bg-primary hover:bg-primary/90">
        <Sparkles className="w-4 h-4 mr-2" />
        Nueva Planeación
      </Button>
    </div>
  )
}

// ── Chat area for an active session ──────────────────────────────────────────
function ActiveChat({ session }: { session: PlanningSession }) {
  const user = useAuthStore((s) => s.user)
  const { handleInput, startFlow } = useConversationFlow(session.id)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [multiSelected, setMultiSelected] = useState<string[]>([])

  const { flowState } = session
  const isReligious = flowState.isReligious
  const isGenerating = flowState.isGenerating
  const isDone = flowState.currentStepId === "done"

  const steps = buildFlowSteps(isReligious)
  const currentStep = steps.find((s) => s.id === flowState.currentStepId)

  // Start the flow if this is a fresh session
  useEffect(() => {
    startFlow()
  }, [startFlow])

  // Reset multiSelect when step changes
  useEffect(() => {
    setMultiSelected([])
  }, [flowState.currentStepId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [session.messages.length, isGenerating])

  const handleChipSelect = useCallback(
    (value: string) => {
      if (!currentStep) return
      if (currentStep.inputType === "multi-chips") {
        if (value === "__confirm__") {
          void handleInput(multiSelected)
          setMultiSelected([])
        } else {
          setMultiSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
          )
        }
      } else {
        void handleInput(value)
      }
    },
    [currentStep, handleInput, multiSelected]
  )

  const handleSubjectSelect = useCallback(
    (courseId: string) => {
      void handleInput(courseId)
    },
    [handleInput]
  )

  const handleTextSend = useCallback(
    (text: string) => {
      void handleInput(text)
    },
    [handleInput]
  )

  const handleSkip = useCallback(() => {
    void handleInput("")
  }, [handleInput])

  const showChips =
    !isDone &&
    !isGenerating &&
    currentStep &&
    (currentStep.inputType === "quick-chips" || currentStep.inputType === "multi-chips")

  const showSubjectCards =
    !isDone &&
    !isGenerating &&
    currentStep?.inputType === "subject-cards"

  const showSummary =
    !isDone &&
    !isGenerating &&
    currentStep?.inputType === "confirmation"

  const showInput =
    !isDone &&
    !isGenerating &&
    currentStep &&
    (currentStep.inputType === "free-text" ||
      (currentStep.inputType === "quick-chips" && !!currentStep.placeholder))

  return (
    <TooltipProvider>
      <div className="flex h-full w-full">
        {/* Chat column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="py-4 space-y-1 max-w-3xl mx-auto w-full">
              {session.messages.map((msg) => (
                <Message key={msg.id} message={msg} userName={user?.name} />
              ))}

              {/* Subject cards */}
              {showSubjectCards && user && (
                <div className="px-4 grid grid-cols-2 gap-3 mt-2">
                  {user.courses.map((course) => (
                    <SubjectCard
                      key={course.id}
                      course={course}
                      onSelect={() => handleSubjectSelect(course.id)}
                    />
                  ))}
                </div>
              )}

              {/* Summary before confirmation */}
              {showSummary && (
                <div className="mt-2">
                  <SummaryCard
                    answers={flowState.answers}
                    isReligious={isReligious}
                    onConfirm={() => void handleInput("confirm")}
                    onEdit={() => {
                      // TODO: implement restart flow
                    }}
                  />
                </div>
              )}

              {/* Typing indicator */}
              {isGenerating && <TypingIndicator />}

              {/* Results */}
              {isDone && session.result && (
                <div className="mt-4 pb-4">
                  <ResultCard result={session.result} isReligious={isReligious} />
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Quick chips */}
          {showChips && currentStep?.options && (
            <div className="border-t border-border bg-muted/30 pt-3 pb-1">
              <QuickReplyChips
                options={currentStep.options}
                selected={
                  currentStep.inputType === "multi-chips" ? multiSelected : undefined
                }
                multiSelect={currentStep.inputType === "multi-chips"}
                onSelect={handleChipSelect}
              />
            </div>
          )}

          {/* Text input */}
          {showInput && currentStep && (
            <div className="border-t border-border bg-white">
              <MessageInput
                onSend={handleTextSend}
                onSkip={currentStep.isOptional ? handleSkip : undefined}
                placeholder={currentStep.placeholder}
                isOptional={currentStep.isOptional}
                disabled={isGenerating}
              />
            </div>
          )}
        </div>

        {/* Sources panel */}
        <SourcesPanel sessionId={session.id} />
      </div>
    </TooltipProvider>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { planningId } = useParams<{ planningId: string }>()
  const navigate = useNavigate()
  const sessions = usePlanningStore((s) => s.sessions)
  const createSession = usePlanningStore((s) => s.createSession)
  const setActiveSession = usePlanningStore((s) => s.setActiveSession)

  const session = planningId ? sessions.find((s) => s.id === planningId) : undefined

  // Sync active session with URL
  useEffect(() => {
    if (planningId && session) {
      setActiveSession(planningId)
    }
  }, [planningId, session, setActiveSession])

  const handleNewPlanning = () => {
    const id = createSession()
    navigate(`/chat/${id}`)
  }

  return (
    <div className="flex h-full w-full">
      {session ? (
        <ActiveChat session={session} />
      ) : (
        <WelcomeScreen onNew={handleNewPlanning} />
      )}
    </div>
  )
}
