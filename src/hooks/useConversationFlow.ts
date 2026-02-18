import { useCallback } from "react"
import { usePlanningStore } from "@/store/planningStore"
import { useAuthStore } from "@/store/authStore"
import { buildFlowSteps } from "@/data/flowSteps"
import { generateMockResult } from "@/data/mockAiResponse"
import type { FlowAnswers, FlowStepId, Message } from "@/types"

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
  const { addMessage, updateFlowState, updateSessionTitle, completeSession } =
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

  // ── Generate (mock) — defined BEFORE handleInput so it can be in its deps ─
  const handleGenerate = useCallback(
    async (answers: Partial<FlowAnswers>, isReligious: boolean) => {
      updateFlowState(sessionId, { isGenerating: true, currentStepId: "generating" })

      // Simulate AI latency
      await new Promise((resolve) => setTimeout(resolve, 2500))

      const result = generateMockResult({
        courseName: answers.courseName ?? "Materia",
        classTopic: answers.classTopic ?? "Tema",
        methodology: answers.methodology ?? "Metodología activa",
        classHours: answers.classHours ?? "2",
        isReligious,
      })

      completeSession(sessionId, result)
      addMessage(
        sessionId,
        assistantMessage(
          "¡Tu planeación está lista! Aquí tienes los materiales generados. Puedes verlos y descargarlos desde las tarjetas de abajo."
        )
      )
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

  return { startFlow, handleInput }
}
