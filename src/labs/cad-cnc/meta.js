import { lazy } from 'react'

export default {
  label: "CAD + CNC Workspace",
  emoji: "🏗",
  color: "teal",
  kind: "lab",
  subject: "Engineering",
  desc: "Draw geometry in the CAD editor and send it directly to the CNC Simulator as G-code — both panels live side by side.",
  path: "/cad-cnc",
  tags: ["Engineering", "CAD", "CNC", "CAM", "G-Code", "Toolpaths", "Manufacturing", "3D"],
  cover: {
    grad: "from-teal-700 via-cyan-800 to-blue-950",
    mark: "⊡→G",
    sub: "CAD · CAM · CNC"
  },
  order: 28,
  routes: ['/cad-cnc'],
  component: lazy(() => import('./CadCncPage.jsx')),
}
