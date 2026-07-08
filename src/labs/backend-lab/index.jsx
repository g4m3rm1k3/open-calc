import BackendLab from './BackendLab'

export const meta = {
  label: 'Backend Lab',
  emoji: '🛠️',
  color: 'emerald',
  desc: 'Build a real backend from scratch — routes, middleware, services, and a database — one felt need at a time. Test your own endpoints with a built-in request client, no server or hosting required.',
  tags: ['Backend', 'HTTP', 'APIs', 'Interactive'],
  cover: { grad: 'from-emerald-600 via-teal-700 to-slate-950', mark: '{ }', sub: 'Routes · Middleware · Data' },
}

export default function BackendLabEntry({ onBack }) {
  return <BackendLab onBack={onBack} />
}
