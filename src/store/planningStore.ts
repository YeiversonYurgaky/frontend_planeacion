import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PlanningSession, Message, PdfSource, FlowState, PlanningResult } from "@/types"
import { api } from "@/lib/api"

interface PlanningState {
  sessions: PlanningSession[]
  activePlanningId: string | null

  // Session management
  createSession: () => Promise<string>
  setActiveSession: (id: string | null) => void
  deleteSession: (id: string) => void
  getActiveSession: () => PlanningSession | undefined

  // Messages
  addMessage: (sessionId: string, message: Message) => void

  // Flow state
  updateFlowState: (sessionId: string, flowState: Partial<FlowState>) => void

  // Session metadata
  updateSessionTitle: (sessionId: string, title: string) => void
  completeSession: (sessionId: string, result: PlanningResult) => void
  restartFlow: (sessionId: string) => void

  // PDF Sources
  addSource: (sessionId: string, source: PdfSource) => void
  removeSource: (sessionId: string, sourceId: string) => void
}

const defaultFlowState = (): FlowState => ({
  currentStepId: "select-subject",
  isReligious: false,
  answers: {},
  isGenerating: false,
})

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activePlanningId: null,

      createSession: async () => {
        // Crear sesión en el backend para obtener el UUID real
        const { data } = await api.post<{ id: string; title: string; created_at: string }>(
          "/api/plannings/",
          { title: "Nueva planeación" }
        )
        const id = String(data.id)
        const newSession: PlanningSession = {
          id,
          title: data.title,
          courseId: "",
          courseName: "",
          status: "in_progress",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.created_at),
          messages: [],
          flowState: defaultFlowState(),
          sources: [],
        }
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activePlanningId: id,
        }))
        return id
      },

      setActiveSession: (id) => set({ activePlanningId: id }),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          activePlanningId:
            state.activePlanningId === id ? null : state.activePlanningId,
        })),

      getActiveSession: () => {
        const { sessions, activePlanningId } = get()
        return sessions.find((s) => s.id === activePlanningId)
      },

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, message],
                  updatedAt: new Date(),
                }
              : s
          ),
        })),

      updateFlowState: (sessionId, flowState) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  flowState: { ...s.flowState, ...flowState },
                  updatedAt: new Date(),
                }
              : s
          ),
        })),

      updateSessionTitle: (sessionId, title) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s
          ),
        })),

      completeSession: (sessionId, result) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  status: "completed" as const,
                  result,
                  updatedAt: new Date(),
                  flowState: { ...s.flowState, currentStepId: "done" as const, isGenerating: false },
                }
              : s
          ),
        })),

      restartFlow: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  title: "Nueva planeación",
                  courseId: "",
                  courseName: "",
                  status: "in_progress" as const,
                  messages: [],
                  flowState: defaultFlowState(),
                  result: undefined,
                  updatedAt: new Date(),
                }
              : s
          ),
        })),

      addSource: (sessionId, source) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, sources: [...s.sources, source], updatedAt: new Date() }
              : s
          ),
        })),

      removeSource: (sessionId, sourceId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  sources: s.sources.filter((src) => src.id !== sourceId),
                  updatedAt: new Date(),
                }
              : s
          ),
        })),
    }),
    {
      name: "planning-storage",
      version: 1,
      // Si el schema cambia en el futuro, incrementar version y añadir migrate()
      migrate: (persisted, version) => {
        if (version === 0) {
          // Migración de v0 → v1: reiniciar estado si la estructura es incompatible
          return { sessions: [], activePlanningId: null }
        }
        return persisted as PlanningState
      },
    }
  )
)
