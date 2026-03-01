// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: "docente" | "administrador"
  programs: string[]
  courses: Course[]
  avatarUrl?: string
}

// ─── Courses & Subjects ───────────────────────────────────────────────────────

export interface Course {
  id: string
  name: string
  code: string
  program: string
  semester: string
  studentCount: number
  isReligious: boolean
}

// ─── Planning session ─────────────────────────────────────────────────────────

export type PlanningStatus = "in_progress" | "completed"

export interface PlanningSession {
  id: string
  title: string          // e.g. "Cálculo I – Límites"
  courseId: string
  courseName: string
  status: PlanningStatus
  createdAt: Date
  updatedAt: Date
  messages: Message[]
  flowState: FlowState
  sources: PdfSource[]
  result?: PlanningResult
}

// ─── PDF Sources ──────────────────────────────────────────────────────────────

export interface PdfSource {
  id: string
  name: string
  size: number           // bytes
  uploadedAt: Date
  // url will be populated when backend is connected
  url?: string
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export type MessageRole = "assistant" | "user"
export type MessageType = "text" | "subject-cards" | "quick-chips" | "multi-chips" | "summary" | "result"

export interface Message {
  id: string
  role: MessageRole
  type: MessageType
  content: string
  // For assistant messages that include interactive elements
  options?: ChipOption[]
  selectedValue?: string | string[]
  timestamp: Date
}

export interface ChipOption {
  label: string
  value: string
  description?: string
}

// ─── Conversation Flow ────────────────────────────────────────────────────────

export type FlowStepId =
  | "select-subject"
  | "class-topic"
  | "methodology"
  | "class-hours"
  // Religious-only steps (inserted after methodology)
  | "faith-connection"
  | "missional-objectives"
  | "evaluation-type"
  | "faith-resources"
  | "group-context"
  // Back to base flow
  | "faith-integration"
  | "observations"
  | "open-chat"
  | "generating"
  | "done"

export type InputType =
  | "subject-cards"
  | "free-text"
  | "quick-chips"
  | "multi-chips"
  | "open-chat"
  | "none"

export interface FlowStep {
  id: FlowStepId
  message: string
  inputType: InputType
  options?: ChipOption[]
  isOptional?: boolean
  placeholder?: string
}

export interface FlowState {
  currentStepId: FlowStepId
  isReligious: boolean
  answers: Partial<FlowAnswers>
  isGenerating: boolean
}

export interface FlowAnswers {
  courseId: string
  courseName: string
  classTopic: string
  methodology: string
  classHours: string
  faithIntegration: string
  observations: string
  // Religious extras
  faithConnection: string
  missionalObjectives: string
  evaluationType: string[]
  faithResources: string[]
  groupContext: string
}

// ─── Planning Result ──────────────────────────────────────────────────────────

export interface PlanningResult {
  classPlanning: string
  evaluationStrategies: string
  rubric: string
  spiritualIntegration?: string
  // Religious extras
  biblicalResources?: string
}

export interface ResultSection {
  id: keyof PlanningResult
  title: string
  icon: string
  content: string
}
