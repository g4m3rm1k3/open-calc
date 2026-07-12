import DecompLab from './DecompLab.jsx'

export const meta = {
  label: 'Decomp Lab',
  emoji: '⊗',
  color: 'violet',
  desc: 'See SVD and least squares in action — upload your own image to compress it by keeping only its dominant singular value layers, then fit polynomial curves to your own data (or a preset) using the normal equation.',
  tags: ['Math', 'Linear Algebra', 'Data Science'],
  cover: { grad: 'from-violet-700 via-purple-800 to-indigo-950', mark: 'UΣVᵀ', sub: 'SVD · Least Squares · Projection' },
}

export default function DecompLabEntry({ onBack }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <DecompLab onBack={onBack} />
    </div>
  )
}
