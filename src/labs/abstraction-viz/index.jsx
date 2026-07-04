import AbstractionViz from './AbstractionViz.jsx'

export const meta = {
  label: 'Abstraction Visualizer',
  emoji: '🔗',
  color: 'indigo',
  desc: 'Step through code patterns — callbacks, higher-order functions, closures, dependency injection — and watch the relationships light up directly in the editor as the abstraction builds.',
  tags: ['Patterns', 'Functional', 'JavaScript', 'Interactive'],
  cover: { grad: 'from-indigo-600 via-violet-700 to-purple-950', mark: 'fn→fn', sub: 'Callbacks · HOF · Closures · DI' },
}

export default function AbstractionVizEntry({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <AbstractionViz onBack={onBack} />
    </div>
  )
}
