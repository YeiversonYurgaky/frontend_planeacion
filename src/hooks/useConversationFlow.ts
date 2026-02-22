import { useCallback } from "react"
import { usePlanningStore } from "@/store/planningStore"
import { useAuthStore } from "@/store/authStore"
import { buildFlowSteps } from "@/data/flowSteps"
import { api } from "@/lib/api"
import type { FlowAnswers, FlowStepId, Message, PlanningResult } from "@/types"

// Mapea las respuestas camelCase del frontend al snake_case que espera el backend
function toApiAnswers(answers: Partial<FlowAnswers>, isReligious: boolean) {
  return {
    course_id: answers.courseId ?? "",
    course_name: answers.courseName ?? "",
    class_topic: answers.classTopic ?? "",
    methodology: answers.methodology ?? "",
    class_hours: answers.classHours ?? "",
    faith_integration: answers.faithIntegration ?? "",
    observations: answers.observations ?? "",
    is_religious: isReligious,
    faith_connection: answers.faithConnection ?? "",
    missional_objectives: answers.missionalObjectives ?? "",
    evaluation_type: answers.evaluationType ?? [],
    faith_resources: answers.faithResources ?? [],
    group_context: answers.groupContext ?? "",
  }
}

// Mapea la respuesta snake_case del backend al tipo frontend PlanningResult
function fromApiResult(data: Record<string, string | null>): PlanningResult {
  return {
    classPlanning: data.class_planning ?? "",
    evaluationStrategies: data.evaluation_strategies ?? "",
    rubric: data.rubric ?? "",
    spiritualIntegration: data.spiritual_integration ?? undefined,
    biblicalResources: data.biblical_resources ?? undefined,
  }
}

function makeId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function assistantMessage(content: string): Message {
  return {
    id: makeId(),
    role: "assistant",
    type: "text",
    content,
    timestamp: new Date(),
  }
}

function userMessage(content: string): Message {
  return {
    id: makeId(),
    role: "user",
    type: "text",
    content,
    timestamp: new Date(),
  }
}

export function useConversationFlow(sessionId: string) {
  const { addMessage, updateFlowState, updateSessionTitle, completeSession, restartFlow } =
    usePlanningStore()
  const user = useAuthStore((s) => s.user)

  // Always read latest session state directly from store (avoids stale closures)
  const getSession = useCallback(() => {
    return usePlanningStore.getState().sessions.find((s) => s.id === sessionId)
  }, [sessionId])

  // ── Kick off the first message ────────────────────────────────────────────
  const startFlow = useCallback(() => {
    const session = getSession()
    if (!session || session.messages.length > 0) return
    const steps = buildFlowSteps(false)
    const firstStep = steps[0]
    addMessage(sessionId, assistantMessage(firstStep.message))
  }, [sessionId, getSession, addMessage])

  // ── Advance to a step ─────────────────────────────────────────────────────
  const advanceTo = useCallback(
    (nextStepId: FlowStepId, currentAnswers: Partial<FlowAnswers>, isReligious: boolean) => {
      const steps = buildFlowSteps(isReligious)
      const nextStep = steps.find((s) => s.id === nextStepId)
      if (!nextStep) return

      updateFlowState(sessionId, {
        currentStepId: nextStepId,
        answers: currentAnswers,
        isReligious,
      })

      addMessage(sessionId, assistantMessage(nextStep.message))
    },
    [sessionId, addMessage, updateFlowState]
  )

  // ── Generate — llama al backend real con RAG + Gemini ─────────────────────
  const handleGenerate = useCallback(
    async (answers: Partial<FlowAnswers>, isReligious: boolean) => {
      updateFlowState(sessionId, { isGenerating: true, currentStepId: "generating" })

      try {
        const { data } = await api.post<Record<string, string | null>>(
          `/api/plannings/${sessionId}/generate`,
          toApiAnswers(answers, isReligious)
        )
        const result = fromApiResult(data)
        completeSession(sessionId, result)
        addMessage(
          sessionId,
          assistantMessage(
            "¡Tu planeación está lista! Aquí tienes los materiales generados. Puedes verlos y descargarlos desde las tarjetas de abajo."
          )
        )
      } catch (err) {
        updateFlowState(sessionId, { isGenerating: false, currentStepId: "confirmation" })
        addMessage(
          sessionId,
          assistantMessage(
            "Ocurrió un error al generar la planeación. Por favor, inténtalo de nuevo."
          )
        )
        console.error("Error generating planning:", err)
      }
    },
    [sessionId, updateFlowState, completeSession, addMessage]
  )

  // ── Handle user input at each step ───────────────────────────────────────
  const handleInput = useCallback(
    async (value: string | string[]) => {
      const session = getSession()
      if (!session) return
      const { flowState } = session
      const { currentStepId, answers, isReligious } = flowState

      const steps = buildFlowSteps(isReligious)
      const currentIndex = steps.findIndex((s) => s.id === currentStepId)
      if (currentIndex === -1) return

      const displayValue = Array.isArray(value) ? value.join(", ") : value

      // Add user bubble (skip for subject selection — cards show their own feedback)
      if (currentStepId !== "select-subject") {
        addMessage(sessionId, userMessage(displayValue || "(sin comentarios adicionales)"))
      }

      // Build updated answers
      let newAnswers: Partial<FlowAnswers> = { ...answers }
      let newIsReligious = isReligious

      switch (currentStepId) {
        case "select-subject": {
          const course = user?.courses.find((c) => c.id === value)
          if (!course) return
          newIsReligious = course.isReligious
          newAnswers = {
            ...newAnswers,
            courseId: course.id,
            courseName: course.name,
          }
          addMessage(sessionId, userMessage(course.name))
          updateSessionTitle(sessionId, course.name)
          break
        }
        case "class-topic":
          newAnswers.classTopic = displayValue
          updateSessionTitle(sessionId, `${answers.courseName ?? "Planeación"} – ${displayValue}`)
          break
        case "methodology":
          newAnswers.methodology = displayValue
          break
        case "class-hours":
          newAnswers.classHours = displayValue
          break
        case "faith-integration":
          newAnswers.faithIntegration = displayValue
          break
        case "observations":
          newAnswers.observations = displayValue
          break
        case "faith-connection":
          newAnswers.faithConnection = displayValue
          break
        case "missional-objectives":
          newAnswers.missionalObjectives = displayValue
          break
        case "evaluation-type":
          newAnswers.evaluationType = Array.isArray(value) ? value : [value]
          break
        case "faith-resources":
          newAnswers.faithResources = Array.isArray(value) ? value : [value]
          break
        case "group-context":
          newAnswers.groupContext = displayValue
          break
        case "confirmation":
          await handleGenerate(newAnswers, newIsReligious)
          return
      }

      // Find and advance to next step
      const rebuildSteps = buildFlowSteps(newIsReligious)
      const updatedIndex = rebuildSteps.findIndex((s) => s.id === currentStepId)
      const nextStep = rebuildSteps[updatedIndex + 1]
      if (nextStep) {
        advanceTo(nextStep.id, newAnswers, newIsReligious)
      }
    },
    [getSession, sessionId, addMessage, updateFlowState, updateSessionTitle, advanceTo, user, handleGenerate]
  )

  // ── Restart — vuelve al primer paso manteniendo el sessionId ─────────────
  const handleRestart = useCallback(() => {
    restartFlow(sessionId)
    // startFlow se disparará automáticamente via el useEffect en ActiveChat
    // porque messages.length pasará a 0
  }, [sessionId, restartFlow])

  return { startFlow, handleInput, handleRestart }
}
