import { lazy } from 'react'

export default {
  label: "Viz Builder",
  emoji: "🔭",
  color: "sky",
  kind: "builder",
  desc: "Build custom data visualizations and interactive diagrams for lessons and labs.",
  path: "/viz-builder",
  tags: ["Tools", "Visualization", "Creator"],
  cover: {
    grad: "from-sky-700 via-blue-800 to-indigo-950",
    mark: "📊",
    sub: "Charts · Diagrams · Interactive"
  },
  order: 36,
  routes: ['/viz-builder'],
  component: lazy(() => import('../../pages/VizBuilderPage.jsx')),
}
