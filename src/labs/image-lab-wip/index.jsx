import ImageLab from './ImageLab.tsx'

export const meta = {
  label: 'Image Lab',
  emoji: '▧',
  color: 'cyan',
  kind: 'lab',
  subject: 'Math',
  desc: 'The full image workspace — top-nav menus (File/View/Adjust/Analyze/Transform/Tools), SVD/FFT/compression tools, and real pixel math tested with vitest. Newer and still being tested; see Image Lab Junior for the simpler, proven version.',
  tags: ['Math', 'Images', 'Linear Algebra', 'Computer Vision', 'Matrices', 'OpenMAT', 'FFT'],
  cover: { grad: 'from-cyan-700 via-teal-800 to-slate-950', mark: 'px=Aij', sub: 'SVD · FFT · OpenMAT' },
}

export default function ImageLabWipEntry({ onBack }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <ImageLab onBack={onBack} />
    </div>
  )
}
