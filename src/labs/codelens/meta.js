import { lazy } from 'react'

export default {
  label: "CodeLens",
  emoji: "🔬",
  color: "indigo",
  kind: "visualizer",
  subject: "CS Theory",
  desc: "Paste any JavaScript and watch it execute — token stream, AST, live heap graph, call stack, scope chain, and plain-English explanations at every step.",
  path: "/codelens",
  tags: ["JavaScript", "CS Theory", "Visualizer"],
  cover: {
    grad: "from-indigo-700 via-violet-800 to-purple-950",
    mark: "{ }",
    sub: "AST · Heap · Execution"
  },
  order: 32,
  routes: ['/codelens'],
  component: lazy(() => import('./CodeLensPage.tsx')),
}
