import { lazy } from 'react'

export default {
  label: "Physics Engine",
  emoji: "🌌",
  color: "fuchsia",
  desc: "Simulate rigid body dynamics, forces, springs, pendulums, and wave mechanics.",
  event: "physics",
  kind: "lab",
  subject: "Science",
  tags: ["Physics", "Simulation", "Mechanics", "Gravity", "Forces", "Kinematics"],
  cover: {
    grad: "from-fuchsia-700 via-pink-800 to-rose-950",
    mark: "F=ma",
    sub: "Rigid Body Dynamics"
  },
  order: 26,
  routes: ['/physics'],
  component: lazy(() => import('./PhysicsPage.jsx')),
}
