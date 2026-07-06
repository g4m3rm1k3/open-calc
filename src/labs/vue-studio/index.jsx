import VueStudio from './VueStudio.jsx'

export const meta = {
  label: 'Vue Studio',
  emoji: '💚',
  color: 'emerald',
  desc: 'Build a real Vue 3 project from scratch — real .vue files, real project structure. The studio shows why each file exists, what concepts it exercises, and how the component tree changes live as you write.',
  tags: ['Vue', 'TypeScript', 'Components', 'Reactive', 'Lessons'],
  cover: {
    grad: 'from-emerald-500 via-green-600 to-teal-900',
    mark: '<Vue>',
    sub: 'Real SFCs · Composition API · DevTools',
  },
}

export default function VueStudioEntry({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <VueStudio onBack={onBack} />
    </div>
  )
}
