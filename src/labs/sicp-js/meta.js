import { lazy } from 'react'

export default {
  label: "SICP — JavaScript",
  emoji: "📖",
  color: "cyan",
  kind: "lesson",
  subject: "CS Theory",
  desc: "Structure and Interpretation of Computer Programs, condensed as an interactive lesson. Narrated checkpoints, live code challenges, and CodeLens deep-dives — Chapter 1 first.",
  path: "/learn/sicp/1-1",
  tags: ["JavaScript", "CS Theory", "Interactive"],
  cover: {
    grad: "from-cyan-700 via-sky-800 to-indigo-950",
    mark: "λ",
    sub: "SICP · JS · Checkpoints"
  },
  order: 30,
  routes: ['/learn/sicp', '/learn/sicp/:lessonId'],
  component: lazy(() => import('./SICPPage.jsx')),
}
