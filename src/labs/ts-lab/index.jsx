import TsLab from './TsLab.jsx'

export const meta = {
  label: 'OpenSocial — TypeScript Lab',
  emoji: '🌐',
  color: 'blue',
  kind: 'lesson',
  subject: 'Web Dev',
  desc: 'Build a real social platform frontend from scratch using vanilla TypeScript — no framework. Fetch → render → interact → manage state. Every lesson ships working features against a live REST API.',
  tags: ['TypeScript', 'Fetch', 'DOM', 'REST API', 'Lessons'],
  cover: {
    grad: 'from-blue-600 via-indigo-700 to-violet-900',
    mark: 'TS',
    sub: 'Fetch · DOM · State · Events',
  },
}

export default function TsLabEntry({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <TsLab onBack={onBack} />
    </div>
  )
}
