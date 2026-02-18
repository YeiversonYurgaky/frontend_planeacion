import type { PlanningResult } from "@/types"

export function generateMockResult(answers: {
  courseName: string
  classTopic: string
  methodology: string
  classHours: string
  isReligious: boolean
}): PlanningResult {
  const { courseName, classTopic, methodology, classHours, isReligious } = answers

  return {
    classPlanning: `## Planeación de Clase — ${courseName}

**Tema:** ${classTopic}
**Duración:** ${classHours} hora(s) académica(s)
**Metodología:** ${methodology}

### Estructura de la Sesión

**Apertura (10 min)**
- Saludo y encuadre de la clase
- Activación de saberes previos mediante pregunta generadora
- Presentación del objetivo de aprendizaje

**Desarrollo (${parseInt(classHours) > 1 ? "60–80" : "25–30"} min)**
- Introducción conceptual al tema: ${classTopic}
- Actividad práctica utilizando la metodología de ${methodology}
- Trabajo en pequeños grupos con guía estructurada
- Plenaria para socializar hallazgos

**Cierre (15 min)**
- Síntesis colectiva de los aprendizajes
- Evaluación formativa rápida (exit ticket)
- Asignación de tarea o lectura complementaria`,

    evaluationStrategies: `## Estrategias de Evaluación

### Evaluación Formativa
- **Observación directa** durante las actividades grupales
- **Preguntas orales** de comprensión al azar
- **Exit ticket**: cada estudiante escribe en una tarjeta qué aprendió y qué duda tiene

### Evaluación Sumativa (si aplica)
- **Taller escrito** con ejercicios aplicados del tema ${classTopic}
- **Exposición breve** por grupos sobre lo trabajado en clase
- **Quiz corto** de 5 preguntas al inicio de la siguiente sesión

### Criterios de Evaluación
| Criterio | Peso |
|---|---|
| Comprensión conceptual | 40% |
| Aplicación práctica | 35% |
| Participación y actitud | 25% |`,

    rubric: `## Rúbrica de Evaluación — ${classTopic}

| Criterio | Excelente (4) | Bueno (3) | En desarrollo (2) | Insuficiente (1) |
|---|---|---|---|---|
| **Comprensión** | Demuestra dominio completo del concepto y lo explica con sus propias palabras | Comprende el concepto con mínimos errores | Comprende parcialmente, necesita apoyo | No demuestra comprensión del tema |
| **Aplicación** | Aplica el conocimiento en situaciones nuevas y complejas | Aplica correctamente en situaciones similares a las vistas | Aplica con errores frecuentes | No logra aplicar el conocimiento |
| **Participación** | Participa activamente, aporta ideas y escucha a compañeros | Participa cuando se le solicita con aportes relevantes | Participación mínima o pasiva | No participa o genera distracciones |
| **Trabajo en equipo** | Colabora, propone soluciones y motiva al grupo | Colabora adecuadamente con su equipo | Colaboración limitada | No colabora con el equipo |`,

    spiritualIntegration: `## Integración Espiritual

**Momento de reflexión (5 min al inicio o cierre)**

*Versículo sugerido:* "Todo lo que hagan, háganlo de corazón, como para el Señor y no para los hombres." — Colosenses 3:23

**Reflexión guiada:**
¿Cómo podemos aplicar la excelencia y el esfuerzo que vemos en ${classTopic} como una forma de honrar a Dios con nuestros talentos intelectuales?

**Oración de apertura:**
Invitar a un estudiante a orar pidiendo sabiduría y concentración para la clase.`,

    ...(isReligious
      ? {
          biblicalResources: `## Recursos Bíblicos y Devocionales

### Versículos de referencia
- Proverbios 4:7 — *"La sabiduría es lo primero; adquiere sabiduría."*
- Colosenses 3:23 — *"Todo lo que hagan, háganlo de corazón."*
- Filipenses 4:13 — *"Todo lo puedo en Cristo que me fortalece."*

### Actividad devocional sugerida
**"La mayordomía del conocimiento"** (8 min)
Cada estudiante recibe una tarjeta y escribe: ¿cómo usaré lo aprendido hoy para servir a otros?
Se comparte voluntariamente y se hace una oración de dedicación.

### Recurso complementario
Lectura devocional: *"El estudiante cristiano y la búsqueda de la verdad"* (disponible en la capellanía institucional).`,
        }
      : {}),
  }
}
