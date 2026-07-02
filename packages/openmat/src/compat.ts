// ── MATLAB compatibility warnings ─────────────────────────────────────────────

const COMPAT_CHECKS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\b(syms?|vpa|dsolve|simplify|factor|expand|collect|subs)\b/i,
    message: "This script looks symbolic. OpenMAT is numeric-first, so Symbolic Math Toolbox style commands may need CAS mode or a rewrite." },
  { pattern: /\b(classdef|properties|methods|events)\b/i,
    message: "MATLAB class-based code is not supported yet in OpenMAT. Flatten the lesson code into plain scripts and functions first." },
  { pattern: /\b(readtable|writetable|table|timetable|readmatrix|writematrix|xlsread|xlswrite)\b/i,
    message: "This script uses MATLAB table/file I/O helpers. OpenMAT currently works best with imported CSV data and plain matrices." },
  { pattern: /\b(ode45|ode23|pdepe|fmincon|lsqnonlin|tf|ss|bode|lsim|fft2|imread|imshow)\b/i,
    message: "This script calls a MATLAB toolbox/helper that OpenMAT does not fully match yet. Keep the numeric core and replace toolbox-specific calls." },
  { pattern: /\bspdiags|sparse|symamd|cholinc\b/i,
    message: "Sparse and advanced matrix-structure helpers are only partially supported right now." },
]

export function detectMatlabCompatibilityWarnings(source: unknown): string[] {
  const text = String(source ?? "")
  return COMPAT_CHECKS.filter(c => c.pattern.test(text)).map(c => c.message)
}
