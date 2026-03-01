# Asistente de Planeación Docente — Frontend

Interfaz web del **Asistente de Planeación Docente**, una aplicación que guía a los docentes, paso a paso, en la creación de planeaciones de clase mediante un flujo conversacional asistido por inteligencia artificial. Al finalizar el proceso, el sistema genera automáticamente la planeación, estrategias de evaluación y rúbricas adaptadas al curso seleccionado.

---

## Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Flujo de la Aplicación](#flujo-de-la-aplicación)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Gestión de Estado](#gestión-de-estado)

---

## Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| [React](https://react.dev/) | 19 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Tipado estático |
| [Vite](https://vite.dev/) | 7 | Bundler y servidor de desarrollo |
| [React Router DOM](https://reactrouter.com/) | 7 | Enrutamiento del lado del cliente |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Gestión de estado global |
| [Axios](https://axios-http.com/) | 1 | Cliente HTTP con interceptores JWT |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Estilos utilitarios |
| [Radix UI](https://www.radix-ui.com/) | — | Componentes accesibles (Dialog, Sheet, etc.) |
| [Lucide React](https://lucide.dev/) | — | Íconos |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                                                              │
│  ┌──────────┐   ┌────────────┐   ┌──────────────────────┐   │
│  │LoginPage │   │  ChatPage  │   │    ProfilePage       │   │
│  └──────────┘   │            │   │ (perfil + RAG upload)│   │
│                 │ ┌────────┐ │   └──────────────────────┘   │
│                 │ │Sidebar │ │                               │
│                 │ └────────┘ │                               │
│                 │ ┌────────┐ │                               │
│                 │ │ Chat   │ │   Stores (Zustand)            │
│                 │ │ Flow   │ │   ┌───────────┬────────────┐  │
│                 │ └────────┘ │   │ authStore │planningStore│  │
│                 └────────────┘   └───────────┴────────────┘  │
│                                                              │
│  api.ts (Axios + interceptores JWT)                          │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼───────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  /api/auth  /api/plannings  /api/rag  /api/ai                │
└──────────────────────────────────────────────────────────────┘
```

**Principios clave:**
- Estado global en dos stores independientes (`authStore`, `planningStore`)
- Token de acceso en memoria (no en `localStorage`) + refresh token en cookie `HttpOnly`
- Flujo conversacional dinámico: los cursos con integración religiosa insertan pasos adicionales automáticamente
- Sesiones persistidas en Zustand con versionado de esquema (migración automática)

---

## Estructura del Proyecto

```
src/
├── assets/            # Imágenes y recursos estáticos
├── components/
│   ├── chat/          # Message, MessageInput, QuickReplyChips, ResultCard, TypingIndicator
│   ├── flow/          # SubjectCard, SummaryCard
│   ├── layout/        # Layout, Sidebar
│   ├── sources/       # SourcesPanel, SourceItem (carga de PDFs al RAG)
│   └── ui/            # Componentes base: Button, Dialog, ScrollArea, Badge, etc.
├── data/
│   └── flowSteps.ts   # Definición y orden de los pasos del flujo guiado
├── hooks/
│   └── useConversationFlow.ts  # Lógica de transición entre pasos y llamadas a la API
├── lib/
│   ├── api.ts         # Cliente Axios con interceptores de autenticación
│   └── utils.ts       # Utilidades (cn, etc.)
├── pages/
│   ├── LoginPage.tsx  # Formulario de autenticación
│   ├── ChatPage.tsx   # Vista principal: sidebar + flujo de chat
│   └── ProfilePage.tsx # Perfil del usuario y cursos asignados
├── router/            # Configuración de rutas y guardias de navegación
├── store/
│   ├── authStore.ts   # Estado de autenticación y sesión de usuario
│   └── planningStore.ts # Estado de las sesiones de planeación
├── types/             # Tipos TypeScript compartidos (User, Course, PlanningSession, etc.)
├── App.tsx            # Componente raíz con inicialización de sesión
└── main.tsx           # Punto de entrada de la aplicación
```

---

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- El **backend** del proyecto ejecutándose y accesible (ver su propio README)

---

## Instalación y Configuración

1. **Clona el repositorio** e ingresa al directorio del frontend:

   ```bash
   git clone <url-del-repositorio>
   cd frontend
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   # Edita .env con la URL de tu backend
   ```

4. **Inicia el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend | `http://127.0.0.1:8000` |

> **Nota:** Todas las variables expuestas al cliente deben tener el prefijo `VITE_`.

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y genera el bundle de producción |
| `npm run preview` | Previsualiza el bundle de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre el código fuente |

---

## Flujo de la Aplicación

### Flujo base (todos los cursos)

```
Inicio de sesión
      │
      ▼
ChatPage: selección de materia
(tarjetas de curso con nombre, código y número de estudiantes)
      │
      ▼
Recolección de parámetros
  • Tema de la clase        (texto libre)
  • Metodología pedagógica  (chips: ABP, Aula Invertida, Gamificación, etc.)
  • Duración de la clase    (chips: 1 / 2 / 3 / 4+ horas)
  • Integración de fe       (chips: Sí / No)
  • Observaciones           (texto libre, opcional)
      │
      ▼
Resumen de respuestas (SummaryCard)
+ Chat libre pre-generación
(el docente puede añadir contexto adicional antes de generar)
      │
      ▼
Generación de la planeación por IA
(POST /api/plannings/{id}/generate)
      │
      ▼
Resultado: planeación + estrategias + rúbrica
+ Chat post-generación (consultas adicionales)
+ Exportar a PDF / Imprimir
```

### Pasos adicionales para cursos con integración religiosa

Cuando el curso tiene `isReligious: true`, se insertan automáticamente pasos adicionales después de "metodología":

```
  • Conexión con fe         (chips: Mayordomía, Dignidad, Servicio, Ética)
  • Objetivos misionales    (texto libre)
  • Tipo de evaluación      (multi-chips: Cognitivo, Espiritual, Valores, etc.)
  • Recursos de fe          (multi-chips: Versículos, Himnos, Devocionales, etc.)
  • Contexto del grupo      (nivel de madurez de fe)
```

El resultado incluirá adicionalmente `spiritualIntegration` y `biblicalResources`.

Cada paso del flujo está definido en `src/data/flowSteps.ts` y la lógica de transición es gestionada por el hook `useConversationFlow`.

---

## Funcionalidades Principales

### Flujo conversacional guiado

El hook `useConversationFlow` gestiona todo el ciclo de vida de la sesión:
- Avanza paso a paso recogiendo respuestas del docente
- Adapta el flujo dinámicamente (cursos religiosos vs. no religiosos)
- Envía las respuestas al backend para la generación de la planeación
- Maneja errores de generación revertiendo al paso de chat abierto

### Generación de planeación con IA

Al finalizar el flujo, se llama a `POST /api/plannings/{id}/generate` con las respuestas recopiladas. El backend genera:
- **Planeación de clase** (`class_planning`)
- **Estrategias de evaluación** (`evaluation_strategies`)
- **Rúbrica** (`rubric`)
- **Integración espiritual** y **recursos bíblicos** (solo cursos religiosos)

### Exportación a PDF

Desde el `ResultCard`, el docente puede:
- **Imprimir** la planeación directamente
- **Descargar** como PDF usando el backend (`POST /api/plannings/{id}/export/pdf`)

La vista de impresión utiliza un conversor interno de Markdown a HTML con escape de contenido para prevenir XSS.

### Carga de documentos al RAG

Desde el panel lateral derecho (`SourcesPanel`) en la vista de chat:
- El docente puede cargar archivos PDF o TXT como fuentes de referencia
- Los archivos se envían a `POST /api/rag/upload` con metadatos pedagógicos
- El backend los indexa en ChromaDB para enriquecer el contexto de la generación

### Chat post-generación

Después de generar la planeación, el docente puede continuar el chat para:
- Pedir ajustes o variaciones
- Consultar dudas pedagógicas
- El historial de mensajes se mantiene en la sesión

### Gestión de sesiones

La barra lateral muestra todas las sesiones del usuario con:
- Estado visual: `en progreso` / `completada`
- Título, fecha de creación
- Acciones: seleccionar, eliminar

---

## Autenticación y Seguridad

La autenticación utiliza un esquema de **tokens JWT con refresco automático**:

```
Login
  │
  ├── Recibe: access_token (corta duración, en memoria)
  └── Recibe: refresh_token (cookie HttpOnly, larga duración)

Cada request
  └── Header: Authorization: Bearer {access_token}

Al recibir 401
  ├── Llama POST /api/auth/refresh (usa cookie HttpOnly automáticamente)
  ├── Actualiza access_token en memoria
  └── Reintenta el request original

Si refresh falla
  └── Redirige al login
```

**Decisiones de seguridad:**
- El `access_token` se guarda **en memoria** (no en `localStorage`) para reducir la superficie de ataque XSS
- El `refresh_token` viaja exclusivamente como cookie `HttpOnly` — JavaScript no puede leerla
- Los requests concurrentes que generan 401 comparten una única promesa de refresh para evitar race conditions
- El estado de autenticación usa persistencia parcial en `localStorage` (solo datos no sensibles: nombre, rol)

---

## Gestión de Estado

### `authStore` (Zustand)

```typescript
{
  user: User | null        // Datos del usuario autenticado
  isAuthenticated: boolean
  isInitializing: boolean  // True durante el check inicial de sesión

  // Acciones
  login(email, password)   // POST /api/auth/login + GET /api/auth/me
  logout()                 // POST /api/auth/logout
  initializeAuth()         // Intenta refresh silencioso al arrancar la app
}
```

### `planningStore` (Zustand con versionado)

```typescript
{
  sessions: PlanningSession[]    // Todas las sesiones del usuario
  activePlanningId: string | null

  // Acciones
  createSession()                // POST /api/plannings/ → obtiene UUID real
  setActiveSession(id)
  addMessage(sessionId, message)
  updateFlowState(sessionId, flowState)
  completeSession(sessionId, result)
  restartFlow(sessionId)         // Reinicia el flujo desde cero
}
```

**Tipos principales:**

```typescript
interface PlanningSession {
  id: string
  title: string
  status: "in_progress" | "completed"
  messages: Message[]
  flowState: FlowState
  sources: Source[]
  result?: PlanningResult
}

interface FlowAnswers {
  courseId: string
  courseName: string
  classTopic: string
  methodology: string
  classHours: string
  faithIntegration: string
  observations: string
  // Solo para cursos religiosos:
  faithConnection?: string
  missionalObjectives?: string
  evaluationType?: string[]
  faithResources?: string[]
  groupContext?: string
}
```
