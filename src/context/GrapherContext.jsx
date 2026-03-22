/**
 * GrapherContext
 *
 * Any component (lesson, problem, visualization) can call openGrapher(config)
 * to open the calculator pre-loaded with specific functions/sliders.
 *
 * Config shape:
 *   {
 *     mode: 'pro' | '2d' | '3d',          // which grapher to open
 *     title: string,                        // optional label shown in grapher header
 *     functions: [                          // array of function entries
 *       { expr: 'sin(x)', type: 'explicit', color: '#6366f1', label: 'f(x)' }
 *     ],
 *     sliders: [                            // optional slider defs
 *       { name: 'a', min: -5, max: 5, value: 1 }
 *     ],
 *     replace: true,                        // true = replace saved functions, false = append
 *   }
 */
import { createContext, useContext, useCallback, useRef } from 'react'

const GrapherContext = createContext(null)

export function useGrapher() {
  const ctx = useContext(GrapherContext)
  if (!ctx) throw new Error('useGrapher must be used inside GrapherProvider (AppShell)')
  return ctx
}

// AppShell is the actual provider — this file just exports the context object
// so AppShell can use createContext value directly.
export default GrapherContext
