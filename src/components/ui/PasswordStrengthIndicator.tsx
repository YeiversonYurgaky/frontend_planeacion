import { useMemo } from "react"

interface Criterion {
  label: string
  test: (pw: string) => boolean
}

const CRITERIA: Criterion[] = [
  { label: "Mínimo 8 caracteres",     test: (pw) => pw.length >= 8 },
  { label: "Una letra mayúscula",      test: (pw) => /[A-Z]/.test(pw) },
  { label: "Una letra minúscula",      test: (pw) => /[a-z]/.test(pw) },
  { label: "Un número",               test: (pw) => /\d/.test(pw) },
  { label: "Un carácter especial",    test: (pw) => /[@$!%*?&._\-#]/.test(pw) },
]

type Strength = "empty" | "weak" | "fair" | "strong" | "very-strong"

function getStrength(passed: number, total: number): Strength {
  if (passed === 0) return "empty"
  if (passed <= 2) return "weak"
  if (passed === 3) return "fair"
  if (passed === 4) return "strong"
  return "very-strong"
}

const STRENGTH_META: Record<Strength, { label: string; color: string; bars: number }> = {
  empty:       { label: "",              color: "bg-muted",        bars: 0 },
  weak:        { label: "Débil",         color: "bg-destructive",  bars: 1 },
  fair:        { label: "Regular",       color: "bg-yellow-400",   bars: 2 },
  strong:      { label: "Buena",         color: "bg-blue-500",     bars: 3 },
  "very-strong": { label: "Muy fuerte", color: "bg-green-500",    bars: 4 },
}

interface Props {
  password: string
}

export default function PasswordStrengthIndicator({ password }: Props) {
  const results = useMemo(() => CRITERIA.map((c) => c.test(password)), [password])
  const passedCount = results.filter(Boolean).length
  const strength = getStrength(passedCount, CRITERIA.length)
  const meta = STRENGTH_META[strength]

  if (!password) return null

  return (
    <div className="space-y-2 mt-1">
      {/* Barras de fortaleza */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < meta.bars ? meta.color : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Etiqueta */}
      {meta.label && (
        <p className={`text-xs font-medium ${
          strength === "weak"        ? "text-destructive" :
          strength === "fair"        ? "text-yellow-600"  :
          strength === "strong"      ? "text-blue-600"    :
          "text-green-600"
        }`}>
          {meta.label}
        </p>
      )}

      {/* Criterios pendientes */}
      <ul className="space-y-0.5">
        {CRITERIA.map((c, i) => (
          <li key={i} className={`flex items-center gap-1.5 text-xs ${
            results[i] ? "text-muted-foreground line-through" : "text-muted-foreground"
          }`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              results[i] ? "bg-green-500" : "bg-muted-foreground/40"
            }`} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
