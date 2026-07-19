import { lazy } from 'react'

export default {
  label: "5-Axis Kinematics",
  emoji: "⚙️",
  color: "violet",
  kind: "visualizer",
  subject: "Engineering",
  desc: "Visualize 5-axis CNC kinematics live — homogeneous transforms, surface normals, lead/lag angles, and swarf cutting on parametric shapes. Full matrix stack shown.",
  path: "/five-axis",
  tags: ["CNC", "Linear Algebra", "Kinematics"],
  cover: {
    grad: "from-violet-700 via-purple-800 to-indigo-950",
    mark: "M·v",
    sub: "CNC · Transforms · 5-Axis"
  },
  order: 33,
  routes: ['/five-axis'],
  component: lazy(() => import('./FiveAxisKinematicsPage.tsx')),
}
