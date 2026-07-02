import { lazy } from 'react'

export const SCENE_REGISTRY = {
  WelcomeScene:      lazy(() => import('./WelcomeScene.jsx')),
  SetVennDiagram:    lazy(() => import('./SetVennDiagram.jsx')),
  SetNotationScene:  lazy(() => import('./SetNotationScene.jsx')),
  SetMembership:     lazy(() => import('./SetMembership.jsx')),
  EmptySetScene:     lazy(() => import('./EmptySetScene.jsx')),
  SubsetScene:       lazy(() => import('./SubsetScene.jsx')),
  SetCardinality:    lazy(() => import('./SetCardinality.jsx')),
  NumberSets:        lazy(() => import('./NumberSets.jsx')),
}

export const SCENE_META = {
  WelcomeScene:     { label: 'Introduction',      desc: 'Welcome. Scroll through the lesson to explore.' },
  SetVennDiagram:   { label: 'Venn Diagram',      desc: 'Visualise set membership, intersection, and union.' },
  SetNotationScene: { label: 'Set Notation',       desc: 'Roster and set-builder notation compared.' },
  SetMembership:    { label: 'Membership ∈',       desc: 'Test whether elements belong to a set.' },
  EmptySetScene:    { label: 'Empty Set ∅',        desc: 'The empty set — nothing can belong to it.' },
  SubsetScene:      { label: 'Subsets ⊆',          desc: 'B ⊆ A: every element of B is also in A.' },
  SetCardinality:   { label: 'Cardinality |A|',    desc: 'Count the number of elements in a set.' },
  NumberSets:       { label: 'Number Sets',         desc: 'ℕ ⊊ ℤ ⊊ ℚ ⊊ ℝ ⊊ ℂ nested hierarchy.' },
}
