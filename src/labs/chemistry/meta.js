import { lazy } from 'react'

export default {
  label: "Chemistry Lab",
  emoji: "🧪",
  color: "cyan",
  desc: "Explore chemical reactions, periodic table data, and molecular structures interactively.",
  event: "chemistry",
  kind: "lab",
  subject: "Science",
  tags: ["Chemistry", "Lab", "Reactions", "Molecules", "Stoichiometry", "Elements"],
  cover: {
    grad: "from-cyan-700 via-teal-800 to-blue-950",
    mark: "⚗",
    sub: "Reactions · Molecules"
  },
  order: 25,
  routes: ['/chemistry'],
  component: lazy(() => import('./ChemistryPage.tsx')),
}
