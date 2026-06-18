import DecompLab from './DecompLab.jsx'

export const meta = {
  label: 'Decomp Lab',
  emoji: '⊗',
  color: 'violet',
  desc: 'See SVD and least squares in action — compress a real image by keeping only its dominant singular value layers, then fit polynomial curves to noisy data using the normal equation.',
  tags: ['Math', 'Linear Algebra', 'Data Science'],
  cover: { grad: 'from-violet-700 via-purple-800 to-indigo-950', mark: 'UΣVᵀ', sub: 'SVD · Least Squares · Projection' },
}

export default function DecompLabEntry({ onBack }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 50 }}>
      <DecompLab onBack={onBack} />
    </div>
  )
}
