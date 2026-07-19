import { lazy } from 'react'

export default {
  label: "React 0 to Mastery",
  emoji: "⚛️",
  color: "cyan",
  kind: "lesson",
  subject: "Web Dev",
  desc: "Build from raw React elements to advanced patterns — 27 narrated lessons covering JSX, components, hooks, state, context, reducers, memoization, and Suspense with live interactive sandboxes.",
  path: "/web-learn/react-mastery",
  tags: ["React", "Web", "Interactive", "Frontend", "JavaScript"],
  cover: {
    grad: "from-cyan-500 via-blue-600 to-indigo-900",
    mark: "React",
    sub: "Components · Hooks · State"
  },
  order: 10,
  routes: ['/web-learn/react-mastery', '/web-learn/react-mastery/:lessonId'],
  component: lazy(() => import('./ReactMasteryPage.jsx')),
}
