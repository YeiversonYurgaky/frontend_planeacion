import type { FlowStep } from "@/types"

// ─── Base flow steps (all subjects) ──────────────────────────────────────────

export const BASE_STEPS: FlowStep[] = [
  {
    id: "select-subject",
    message:
      "¡Hola! Soy tu asistente de planeación docente. ¿Para qué materia vamos a preparar la clase de hoy?",
    inputType: "subject-cards",
  },
  {
    id: "class-topic",
    message:
      "¿Cuál es el tema específico que vas a trabajar en esta sesión?",
    inputType: "free-text",
    placeholder: "Ej: Límites y Continuidad, Algoritmos de ordenamiento...",
  },
  {
    id: "methodology",
    message:
      "¿Qué metodología activa quieres usar en esta clase? Puedes elegir una de las opciones o escribir la tuya.",
    inputType: "quick-chips",
    options: [
      {
        label: "Aprendizaje Basado en Proyectos",
        value: "ABP",
        description: "Los estudiantes desarrollan un proyecto real aplicando el tema de la clase.",
      },
      {
        label: "Aula Invertida",
        value: "flipped",
        description: "El contenido se estudia en casa y el aula se usa para práctica y discusión.",
      },
      {
        label: "Aprendizaje Colaborativo",
        value: "collaborative",
        description: "Trabajo en equipo estructurado con roles definidos y metas compartidas.",
      },
      {
        label: "Gamificación",
        value: "gamification",
        description: "Se incorporan elementos de juego (puntos, retos, niveles) para motivar el aprendizaje.",
      },
      {
        label: "Estudio de Casos",
        value: "cases",
        description: "Análisis de situaciones reales o simuladas para aplicar conceptos teóricos.",
      },
      {
        label: "Aprendizaje por Descubrimiento",
        value: "discovery",
        description: "El estudiante llega al conocimiento mediante experimentación y exploración guiada.",
      },
      {
        label: "Debate y Argumentación",
        value: "debate",
        description: "Los estudiantes defienden posiciones y desarrollan pensamiento crítico.",
      },
      {
        label: "Aprendizaje Servicio",
        value: "service",
        description: "Se aprende haciendo servicio comunitario relacionado con el tema de la clase.",
      },
    ],
    placeholder: "O escribe tu propia metodología...",
  },
  {
    id: "class-hours",
    message: "¿Cuántas horas académicas tiene esta sesión?",
    inputType: "quick-chips",
    options: [
      { label: "1 hora", value: "1" },
      { label: "2 horas", value: "2" },
      { label: "3 horas", value: "3" },
      { label: "4 horas o más", value: "4+" },
    ],
  },
  {
    id: "faith-integration",
    message:
      "¿Deseas incluir un momento de integración espiritual o reflexión de valores en esta clase?",
    inputType: "quick-chips",
    options: [
      { label: "Sí, incluir", value: "yes" },
      { label: "No en esta ocasión", value: "no" },
    ],
  },
  {
    id: "observations",
    message:
      "¿Algo más que deba saber para personalizar mejor tu planeación? (opcional)",
    inputType: "free-text",
    isOptional: true,
    placeholder: "Ej: el grupo tiene dificultades con álgebra básica, es una clase evaluativa...",
  },
  {
    id: "confirmation",
    message:
      "Perfecto. Aquí tienes un resumen de lo que me has indicado. ¿Todo está correcto?",
    inputType: "confirmation",
  },
]

// ─── Religious extra steps (inserted between methodology and faith-integration) ─

export const RELIGIOUS_STEPS: FlowStep[] = [
  {
    id: "faith-connection",
    message:
      "¿Cómo se conecta este tema con valores espirituales, principios bíblicos o éticos? Puedes elegir una opción o describirlo.",
    inputType: "quick-chips",
    options: [
      { label: "Mayordomía cristiana", value: "stewardship" },
      { label: "Dignidad humana", value: "dignity" },
      { label: "Servicio y vocación", value: "service" },
      { label: "Ética bíblica", value: "ethics" },
    ],
    placeholder: "O escribe cómo se conecta...",
  },
  {
    id: "missional-objectives",
    message:
      "¿Cuáles son los objetivos espirituales o misionales de esta clase, además de los académicos?",
    inputType: "free-text",
    placeholder: "Ej: Que el estudiante reflexione sobre la responsabilidad como mayordomía...",
  },
  {
    id: "evaluation-type",
    message: "¿Qué aspectos deseas evaluar? (puedes seleccionar varios)",
    inputType: "multi-chips",
    options: [
      { label: "Comprensión cognitiva", value: "cognitive" },
      { label: "Análisis crítico", value: "critical" },
      { label: "Reflexión espiritual", value: "spiritual" },
      { label: "Participación en actividades de fe", value: "participation" },
      { label: "Actitud y valores", value: "values" },
    ],
  },
  {
    id: "faith-resources",
    message: "¿Qué tipo de recursos deseas asociar a esta clase? (puedes seleccionar varios)",
    inputType: "multi-chips",
    options: [
      { label: "Versículos bíblicos", value: "bible" },
      { label: "Himnos o cánticos", value: "hymns" },
      { label: "Lecturas devocionales", value: "devotional" },
      { label: "Videos reflexivos", value: "videos" },
      { label: "Juegos didácticos con fe", value: "games" },
      { label: "Debates éticos", value: "debates" },
    ],
  },
  {
    id: "group-context",
    message:
      "¿Cómo describirías el nivel espiritual e intereses del grupo?",
    inputType: "quick-chips",
    options: [
      { label: "Inicio de formación", value: "beginner" },
      { label: "En proceso de crecimiento", value: "growing" },
      { label: "Grupo consolidado", value: "consolidated" },
      { label: "Mixto o diverso", value: "mixed" },
    ],
    placeholder: "O describe la edad y contexto particular del grupo...",
  },
]

// ─── Build ordered steps for a session ───────────────────────────────────────

export function buildFlowSteps(isReligious: boolean): FlowStep[] {
  const methodologyIndex = BASE_STEPS.findIndex((s) => s.id === "methodology")
  if (!isReligious) return BASE_STEPS

  return [
    ...BASE_STEPS.slice(0, methodologyIndex + 1),
    ...RELIGIOUS_STEPS,
    ...BASE_STEPS.slice(methodologyIndex + 1),
  ]
}
